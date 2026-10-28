use crate::traits::TrayNotifier;
use crate::updater::platform_key;
use std::sync::Arc;
use tokio::task::JoinSet;

/// How often to re-check for updates (4 hours).
const RECHECK_INTERVAL: tokio::time::Duration = tokio::time::Duration::from_secs(4 * 60 * 60);

/// Spawns the background update task.
///
/// Cleans up stale update files from previous sessions.
/// Automatic background polling is disabled; users trigger update checks manually from the tray.
pub fn spawn_update_checker(set: &mut JoinSet<()>, _tray: Arc<dyn TrayNotifier>) {
    set.spawn(async move {
        // Clean up stale update files from previous sessions.
        let dir = std::env::temp_dir().join("gemacast-update");
        gemacast_core::updater::cleanup_stale_updates(&dir);

        // Background auto-polling is intentionally disabled.
        // Update checks run on-demand when the user clicks "检查更新" in the tray.
    });
}

/// Run a single check-and-download cycle.
async fn check_and_download(
    current_version: &str,
    platform_key: &str,
    tray: &Arc<dyn TrayNotifier>,
) {
    let proxy = crate::config::load_config().update_proxy;
    let proxy_opt = if proxy.trim().is_empty() {
        None
    } else {
        Some(proxy.as_str())
    };

    let info = match gemacast_core::updater::check_for_update_with_proxy(
        current_version,
        platform_key,
        proxy_opt,
    )
    .await
    {
        Ok(Some(info)) => info,
        Ok(None) => return,
        Err(e) => {
            tracing::warn!("Update check failed: {}", e);
            tray.notify_update_failed(e);
            return;
        }
    };

    // Streamlined UX: download silently in the background.
    // NOTE: we don't pass a progress channel since the PC tray has no download progress UI.

    // Derive a filename from the URL.
    let filename = info
        .download_url
        .rsplit('/')
        .next()
        .unwrap_or("gemacast-update");

    let dir = std::env::temp_dir().join("gemacast-update");
    if let Err(e) = std::fs::create_dir_all(&dir) {
        tracing::warn!("Failed to create update directory: {}", e);
        tray.notify_update_failed(format!("Failed to create update directory: {e}"));
        return;
    }
    let file_path = dir.join(filename);

    if file_path.exists() {
        tray.notify_update_ready(info.version, file_path);
        return;
    }

    match gemacast_core::updater::download_update_with_proxy(
        &info.download_url,
        &file_path,
        None,
        &info.sha256,
        proxy_opt,
    )
    .await
    {
        Ok(()) => {
            tray.notify_update_ready(info.version, file_path);
        }
        Err(e) => {
            tracing::warn!("Update download failed: {}", e);
            tray.notify_update_failed(e);
        }
    }
}
