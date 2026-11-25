use crate::network::Ports;
use crate::process::{quiet_command, quiet_tokio_command, shutdown_requested};
use std::path::{Path, PathBuf};
use std::sync::LazyLock;
use std::time::Duration;

/// How often the watchdog checks ADB while everything is healthy.
const HEALTHY_INTERVAL: Duration = Duration::from_secs(3);

/// Delay after the Nth consecutive failure (`1s, 2s, 4s, 8s`).
const BACKOFF_STEPS: [Duration; 4] = [
    Duration::from_secs(1),
    Duration::from_secs(2),
    Duration::from_secs(4),
    Duration::from_secs(8),
];

/// Stop probing after this many consecutive failures instead of hammering a
/// broken ADB install forever.
const MAX_CONSECUTIVE_FAILURES: u32 = 5;

/// After a burst hits [`MAX_CONSECUTIVE_FAILURES`], wait this long before
/// starting a fresh burst. Without it a transient problem (antivirus holding
/// adb.exe, a slow server start) would disable forwarding for the whole run.
const FAILURE_BURST_COOLDOWN: Duration = Duration::from_secs(60);

/// While the OS is tearing down the session we never spawn ADB. Re-check the
/// flag at this cadence in case the shutdown gets cancelled (`WM_ENDSESSION`
/// with `wParam == FALSE`).
const SESSION_END_RECHECK: Duration = Duration::from_secs(30);

/// Path to the bundled ADB binary, resolved once per process.
///
/// Memoized because resolving spawns a process (see [`runs`]). Without this,
/// every ADB command would cost two processes, and the watchdog below runs one
/// every 3 seconds for the life of the app.
fn local_adb_path() -> &'static Path {
    static ADB_PATH: LazyLock<PathBuf> = LazyLock::new(resolve_adb_path);
    ADB_PATH.as_path()
}

/// Find a working ADB: next to our own executable first (how every archive and
/// installer ships it), then the deb/rpm install path, then bare `adb` so a dev
/// box falls back to PATH.
fn resolve_adb_path() -> PathBuf {
    let adb_name = if cfg!(target_os = "windows") {
        "adb.exe"
    } else {
        "adb"
    };

    if let Ok(exe) = std::env::current_exe()
        && let Some(dir) = exe.parent()
    {
        let sibling = dir.join(adb_name);
        if runs(&sibling) {
            return sibling;
        }
    }

    #[cfg(target_os = "linux")]
    {
        let packaged = PathBuf::from("/usr/lib/gemacast/adb");
        if runs(&packaged) {
            return packaged;
        }
    }

    PathBuf::from(adb_name)
}

/// Whether `path` exists and can actually be launched.
fn runs(path: &Path) -> bool {
    path.exists() && quiet_command(path).arg("version").output().is_ok()
}

/// A Tokio Command for the bundled ADB. Never pops a console window.
pub fn adb_command() -> tokio::process::Command {
    quiet_tokio_command(local_adb_path())
}

/// Stop the ADB server so it does not outlive us.
///
/// The watchdog below runs `adb devices`, which starts a server. Nothing ever
/// stopped it, so `adb.exe` kept holding our install directory open long after
/// the app quit - which is why an uninstall later still found it in use.
///
/// Errors are ignored on purpose: `kill-server` exits non-zero when no server is
/// running and, unlike other subcommands, does not start one.
///
/// Skipped entirely once the session is ending: at that point creating any
/// process can surface `STATUS_DLL_INIT_FAILED (0xc0000142)`, and the OS tears
/// the server down on its own. Never "catch up" by killing ADB during shutdown.
pub async fn kill_adb_server() {
    if shutdown_requested() {
        tracing::info!("OS session is ending; not spawning adb kill-server");
        return;
    }

    let _ = tokio::time::timeout(
        tokio::time::Duration::from_secs(2),
        adb_command().arg("kill-server").output(),
    )
    .await;
}

pub fn spawn_adb_port_forwarding_watchdog(
    tcp_drop_tx: tokio::sync::broadcast::Sender<()>,
) -> tokio::task::JoinHandle<()> {
    let managed_ports = [
        format!("tcp:{}", Ports::ADB_AUDIO_TCP),
        format!("tcp:{}", Ports::ADB_DISCOVERY_TCP),
        format!("tcp:{}", Ports::CONTROL),
    ];

    tokio::spawn(async move {
        let mut drop_rx = tcp_drop_tx.subscribe();
        let mut state = ForwardingState::default();

        loop {
            let delay = if shutdown_requested() {
                SESSION_END_RECHECK
            } else {
                state.next_delay()
            };

            tokio::select! {
                // `tcp_drop_tx` doubles as the shutdown signal from the app.
                // Leave without touching ADB: the exit path must not spawn.
                _ = drop_rx.recv() => {
                    tracing::info!("ADB forwarding watchdog stopped");
                    return;
                }
                _ = tokio::time::sleep(delay) => {}
            }

            if shutdown_requested() {
                tracing::info!("OS session is ending; skipping ADB forwarding check");
                continue;
            }

            let result = tokio::select! {
                _ = drop_rx.recv() => {
                    tracing::info!("ADB forwarding watchdog stopped");
                    return;
                }
                result = refresh_forwarding(&managed_ports) => result,
            };

            match result {
                Ok(()) => state.record_success(),
                Err(AdbFailure::Cancelled) => {
                    // The session ended while a command was in flight.
                    tracing::info!("OS session ended; ADB forwarding watchdog stopped");
                    return;
                }
                Err(failure) => {
                    let failures = state.record_failure();
                    failure.warn(Some(failures));
                    if failures >= MAX_CONSECUTIVE_FAILURES {
                        tracing::error!(
                            attempts = failures,
                            cooldown_secs = FAILURE_BURST_COOLDOWN.as_secs(),
                            "ADB reverse forwarding failed repeatedly; cooling down"
                        );
                        tokio::select! {
                            _ = drop_rx.recv() => {
                                tracing::info!("ADB forwarding watchdog stopped");
                                return;
                            }
                            _ = tokio::time::sleep(FAILURE_BURST_COOLDOWN) => {}
                        }
                        state.reset_burst();
                    }
                }
            }
        }
    });
}

#[derive(Default)]
struct ForwardingState {
    consecutive_failures: u32,
    attempted: bool,
}

impl ForwardingState {
    fn next_delay(&self) -> Duration {
        if !self.attempted {
            // Match the old interval's immediate first tick: a killed server is
            // restored at startup without waiting a full period.
            Duration::ZERO
        } else if self.consecutive_failures == 0 {
            HEALTHY_INTERVAL
        } else {
            backoff_delay(self.consecutive_failures)
        }
    }

    fn record_success(&mut self) {
        self.attempted = true;
        self.consecutive_failures = 0;
    }

    fn record_failure(&mut self) -> u32 {
        self.attempted = true;
        self.consecutive_failures = self.consecutive_failures.saturating_add(1);
        self.consecutive_failures
    }

    /// Start a fresh failure burst after the cooldown elapses.
    fn reset_burst(&mut self) {
        self.consecutive_failures = 0;
    }
}

/// Delay to wait after `failures` consecutive failures (`1s, 2s, 4s, 8s`, then
/// capped at `8s`).
fn backoff_delay(failures: u32) -> Duration {
    let index = (failures.saturating_sub(1) as usize).min(BACKOFF_STEPS.len() - 1);
    BACKOFF_STEPS[index]
}

/// Why a single watchdog cycle failed.
enum AdbFailure {
    /// The session started ending; no retry, no further spawns.
    Cancelled,
    /// `CreateProcess` itself failed, e.g. a missing or corrupt binary.
    Spawn {
        step: &'static str,
        error: std::io::Error,
    },
    /// ADB ran and reported failure (server died, device offline, ...).
    Exit {
        step: &'static str,
        code: Option<i32>,
    },
}

impl AdbFailure {
    fn warn(&self, attempt: Option<u32>) {
        match self {
            Self::Cancelled => {}
            Self::Spawn { step, error } => tracing::warn!(
                step = %step,
                attempt = ?attempt,
                error = %error,
                kind = ?error.kind(),
                os_code = ?error.raw_os_error(),
                "Failed to launch adb"
            ),
            Self::Exit { step, code } => tracing::warn!(
                step = %step,
                attempt = ?attempt,
                exit_code = ?code,
                "adb exited with a failure status"
            ),
        }
    }
}

/// Re-create every managed reverse forward for every connected device.
async fn refresh_forwarding(managed_ports: &[String; 3]) -> Result<(), AdbFailure> {
    let devices = run_adb("adb devices", &["devices"]).await?;
    let listing = String::from_utf8_lossy(&devices.stdout);

    for serial in listing.lines().filter_map(connected_serial) {
        // A per-device failure is logged but does not fail the whole cycle: the
        // server itself answered `adb devices`.
        let reverse_list = match run_adb(
            "adb reverse --list",
            &["-s", serial, "reverse", "--list"],
        )
        .await
        {
            Ok(output) => output,
            Err(failure @ AdbFailure::Cancelled) => return Err(failure),
            Err(failure) => {
                failure.warn(None);
                continue;
            }
        };
        let existing = String::from_utf8_lossy(&reverse_list.stdout);

        for port in managed_ports {
            if existing.contains(port.as_str()) {
                continue;
            }
            if let Err(failure) = run_adb(
                "adb reverse",
                &["-s", serial, "reverse", port.as_str(), port.as_str()],
            )
            .await
            {
                match failure {
                    AdbFailure::Cancelled => return Err(AdbFailure::Cancelled),
                    other => other.warn(None),
                }
            }
        }
    }

    Ok(())
}

/// Spawn `adb` with `args`, refusing to do so once the session is ending.
///
/// The flag is checked both before the spawn and again after the child returns,
/// because a shutdown can land while the child is running.
async fn run_adb(
    step: &'static str,
    args: &[&str],
) -> Result<std::process::Output, AdbFailure> {
    if shutdown_requested() {
        return Err(AdbFailure::Cancelled);
    }

    let output = adb_command()
        .args(args)
        .output()
        .await
        .map_err(|error| AdbFailure::Spawn { step, error })?;

    if shutdown_requested() {
        return Err(AdbFailure::Cancelled);
    }

    if !output.status.success() {
        return Err(AdbFailure::Exit {
            step,
            code: output.status.code(),
        });
    }

    Ok(output)
}

fn connected_serial(line: &str) -> Option<&str> {
    let mut fields = line.split_whitespace();
    let serial = fields.next()?;
    (fields.next() == Some("device")).then_some(serial)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn backoff_grows_then_caps() {
        assert_eq!(backoff_delay(1), Duration::from_secs(1));
        assert_eq!(backoff_delay(2), Duration::from_secs(2));
        assert_eq!(backoff_delay(3), Duration::from_secs(4));
        assert_eq!(backoff_delay(4), Duration::from_secs(8));
        assert_eq!(backoff_delay(5), Duration::from_secs(8));
    }

    #[test]
    fn first_attempt_is_immediate_then_healthy_interval() {
        let mut state = ForwardingState::default();
        assert_eq!(state.next_delay(), Duration::ZERO);

        state.record_failure();
        assert_eq!(state.next_delay(), Duration::from_secs(1));

        state.record_success();
        assert_eq!(state.next_delay(), HEALTHY_INTERVAL);
    }

    #[test]
    fn failures_accumulate_until_success_resets_them() {
        let mut state = ForwardingState::default();
        assert_eq!(state.record_failure(), 1);
        assert_eq!(state.record_failure(), 2);
        assert_eq!(state.record_failure(), 3);
        state.record_success();
        assert_eq!(state.record_failure(), 1);
    }

    #[test]
    fn connected_serial_only_accepts_ready_devices() {
        assert_eq!(connected_serial("emulator-5554\tdevice"), Some("emulator-5554"));
        assert_eq!(connected_serial("abc\toffline"), None);
        assert_eq!(connected_serial("List of devices attached"), None);
    }
}
