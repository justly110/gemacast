//! Watches for Windows session end (logoff / shutdown).
//!
//! `WM_QUERYENDSESSION` and `WM_ENDSESSION` are sent to top-level windows, so a
//! dedicated hidden window with its own message pump is the reliable way to
//! learn about them from a tray-only process. The window procedure sets the
//! process-wide shutdown flag in [`gemacast_core::process`] *before* Windows
//! tears down the window station/desktop, so the ADB watchdog cannot create
//! `adb.exe` in a dead session and surface `0xc0000142`.
//!
//! Message-only windows (`HWND_MESSAGE`) are not eligible: they do not receive
//! broadcast/session messages. This window is top-level but never shown.

/// Start the session-end watcher on a dedicated thread. No-op off Windows.
#[cfg(windows)]
pub fn watch() {
    if let Err(error) = std::thread::Builder::new()
        .name("gemacast-session-end".into())
        .spawn(windows_impl::run_message_loop)
    {
        tracing::warn!("Failed to start session-end watcher: {error}");
    }
}

/// Session end on other platforms is handled by the existing signal listeners.
#[cfg(not(windows))]
pub fn watch() {}

#[cfg(windows)]
mod windows_impl {
    use std::ptr;

    use windows_sys::Win32::Foundation::{HWND, LPARAM, LRESULT, WPARAM};
    use windows_sys::Win32::System::LibraryLoader::GetModuleHandleW;
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        CreateWindowExW, DefWindowProcW, DestroyWindow, DispatchMessageW, GetMessageW,
        PostQuitMessage, RegisterClassW, TranslateMessage, MSG, WNDCLASSW, WM_CLOSE, WM_DESTROY,
        WM_ENDSESSION, WM_QUERYENDSESSION,
    };

    const CLASS_NAME: &str = "GemacastSessionEndWatcher";

    fn wide(value: &str) -> Vec<u16> {
        value.encode_utf16().chain(std::iter::once(0)).collect()
    }

    pub(super) fn run_message_loop() {
        // SAFETY: standard Win32 setup on a dedicated thread. Pointers passed to
        // the API points at locals that outlive every call; no callback runs
        // after the message loop returns.
        unsafe {
            let hinstance = GetModuleHandleW(ptr::null());
            let class_name = wide(CLASS_NAME);
            let window_name = wide("Gemacast session end watcher");

            let window_class = WNDCLASSW {
                style: 0,
                lpfnWndProc: Some(wndproc),
                cbClsExtra: 0,
                cbWndExtra: 0,
                hInstance: hinstance,
                hIcon: ptr::null_mut(),
                hCursor: ptr::null_mut(),
                hbrBackground: ptr::null_mut(),
                lpszMenuName: ptr::null(),
                lpszClassName: class_name.as_ptr(),
            };

            if RegisterClassW(&window_class) == 0 {
                tracing::warn!(
                    error = ?std::io::Error::last_os_error(),
                    "Failed to register the session-end window class"
                );
                return;
            }

            // Top-level (no parent) but never shown: WM_QUERYENDSESSION /
            // WM_ENDSESSION are broadcast to top-level windows, visible or not.
            let hwnd = CreateWindowExW(
                0,
                class_name.as_ptr(),
                window_name.as_ptr(),
                0,
                0,
                0,
                0,
                0,
                ptr::null_mut(),
                ptr::null_mut(),
                hinstance,
                ptr::null(),
            );
            if hwnd.is_null() {
                tracing::warn!(
                    error = ?std::io::Error::last_os_error(),
                    "Failed to create the session-end hidden window"
                );
                return;
            }

            let mut msg: MSG = std::mem::zeroed();
            loop {
                let result = GetMessageW(&mut msg, ptr::null_mut(), 0, 0);
                if result <= 0 {
                    // 0 = WM_QUIT, -1 = error. Either way there is nothing left.
                    break;
                }
                TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
        }
    }

    unsafe extern "system" fn wndproc(
        hwnd: HWND,
        msg: u32,
        wparam: WPARAM,
        lparam: LPARAM,
    ) -> LRESULT {
        match msg {
            WM_QUERYENDSESSION => {
                // Set the flag before returning TRUE: the ADB watchdog must
                // stop creating processes before Windows gets its answer.
                gemacast_core::process::request_shutdown();
                1
            }
            WM_ENDSESSION => {
                if wparam != 0 {
                    gemacast_core::process::request_shutdown();
                } else {
                    // The shutdown was cancelled; allow spawning again.
                    gemacast_core::process::cancel_shutdown_request();
                }
                0
            }
            WM_CLOSE => {
                unsafe { DestroyWindow(hwnd) };
                0
            }
            WM_DESTROY => {
                unsafe { PostQuitMessage(0) };
                0
            }
            _ => unsafe { DefWindowProcW(hwnd, msg, wparam, lparam) },
        }
    }
}
