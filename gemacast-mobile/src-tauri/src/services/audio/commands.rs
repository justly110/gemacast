use crate::state::AppState;
use crate::traits::{ConnectParams, ResumeParams};
use gemacast_core::domain::types::{DeviceId, TransportType};
use tauri::State;

#[tauri::command]
pub fn notify_streaming_stopped(state: State<'_, AppState>) -> Result<(), String> {
    state.audio.notify_streaming_stopped();
    Ok(())
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn connect_to_streamer(
    ip: String,
    device_id: DeviceId,
    device_name: String,
    mode: gemacast_core::domain::types::ConnectionMode,
    exclusive_mode: bool,
    jitter_config: gemacast_core::domain::types::JitterConfig,
    bitrate: Option<i32>,
    _transport: Option<TransportType>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    tracing::info!(
        "[Cmd] connect_to_streamer: ip={}, device={:?}, mode={:?}, exclusive={}",
        ip,
        device_id,
        mode,
        exclusive_mode,
    );
    let mode_str = match mode {
        gemacast_core::domain::types::ConnectionMode::Adb => "adb",
        gemacast_core::domain::types::ConnectionMode::Usb => "usb",
        gemacast_core::domain::types::ConnectionMode::Wifi => "wifi",
    };
    let phone_link = crate::services::discovery::service::detect_phone_link(
        state.network.as_ref(),
        state.platform.as_ref(),
        mode_str,
    );

    state
        .audio
        .connect_to_streamer(ConnectParams {
            ip,
            device_id,
            device_name,
            mode,
            exclusive_mode,
            jitter_config,
            bitrate,
            phone_network_link: Some(phone_link),
        })
        .await
}

#[tauri::command]
pub async fn disconnect_from_streamer(
    ip: String,
    device_id: DeviceId,
    state: State<'_, AppState>,
) -> Result<(), String> {
    tracing::info!(
        "[Cmd] disconnect_from_streamer: ip={}, device={:?}",
        ip,
        device_id
    );
    let ip_addr = ip
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;
    state
        .audio
        .disconnect_from_streamer(ip_addr, device_id)
        .await
}

#[tauri::command]
pub async fn stop_audio_playback(
    ip: Option<String>,
    device_id: Option<DeviceId>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    tracing::info!(
        "[Cmd] stop_audio_playback: ip={:?}, device={:?}",
        ip,
        device_id
    );
    let ip_parsed = ip
        .map(|s| {
            s.parse()
                .map_err(|e: std::net::AddrParseError| e.to_string())
        })
        .transpose()?;
    state.audio.stop_audio_playback(ip_parsed, device_id).await
}

#[tauri::command]
pub async fn kill_playback(state: State<'_, AppState>) -> Result<(), String> {
    tracing::info!("[Cmd] kill_playback");
    state.audio.kill_playback().await
}

#[tauri::command]
pub async fn start_audio_playback(
    ip: Option<String>,
    device_id: Option<DeviceId>,
    device_name: Option<String>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    tracing::info!(
        "[Cmd] start_audio_playback: ip={:?}, device={:?}",
        ip,
        device_id
    );
    let resume = if let (Some(ip_str), Some(did), Some(dname)) = (ip, device_id, device_name) {
        let ip_addr = ip_str
            .parse()
            .map_err(|e: std::net::AddrParseError| e.to_string())?;
        Some(ResumeParams {
            ip: ip_addr,
            device_id: did,
            device_name: dname,
        })
    } else {
        None
    };
    state.audio.start_audio_playback(resume).await
}

#[tauri::command]
pub async fn update_jitter_config(
    jitter_config: gemacast_core::domain::types::JitterConfig,
    state: State<'_, AppState>,
) -> Result<(), String> {
    tracing::info!(
        "[Cmd] update_jitter_config: min_depth={}ms, cap={}ms, static={:?}",
        jitter_config.min_depth_ms,
        jitter_config.comfort_cap_ms,
        jitter_config.static_target_ms,
    );
    state.audio.update_jitter_config(jitter_config).await
}

#[tauri::command]
pub async fn get_audio_sources(
    ip: String,
    state: State<'_, AppState>,
) -> Result<
    (
        Vec<gemacast_core::domain::types::AudioSource>,
        gemacast_core::domain::types::StreamerCapabilities,
    ),
    String,
> {
    let ip_addr = ip
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;
    state.audio.get_audio_sources(ip_addr).await
}

#[tauri::command]
pub async fn probe_streamer(
    ip: String,
    device_id: DeviceId,
    state: State<'_, AppState>,
) -> Result<gemacast_core::control::types::PresenceResponse, String> {
    tracing::info!("[Cmd] probe_streamer: ip={}, device={:?}", ip, device_id);
    let ip_addr = ip
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;
    state.audio.probe_streamer(ip_addr, device_id).await
}

#[tauri::command]
pub async fn start_link_recovery(
    ip: String,
    device_id: DeviceId,
    state: State<'_, AppState>,
) -> Result<(), String> {
    tracing::info!(
        "[Cmd] start_link_recovery: ip={}, device={:?}",
        ip,
        device_id
    );
    let ip_addr = ip
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;
    state.audio.start_link_recovery(ip_addr, device_id);
    Ok(())
}

#[tauri::command]
pub async fn stop_link_recovery(state: State<'_, AppState>) -> Result<(), String> {
    tracing::info!("[Cmd] stop_link_recovery");
    state.audio.stop_link_recovery();
    Ok(())
}

#[tauri::command]
pub async fn change_audio_source(
    ip: String,
    device_id: DeviceId,
    source: gemacast_core::domain::types::AudioSource,
    state: State<'_, AppState>,
) -> Result<(), String> {
    tracing::info!(
        "[Cmd] change_audio_source: ip={}, device={:?}, source={:?}",
        ip,
        device_id,
        source
    );
    let ip_addr = ip
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;
    state
        .audio
        .change_audio_source(ip_addr, device_id, source)
        .await
}

#[tauri::command]
pub async fn change_audio_bitrate(
    ip: String,
    device_id: DeviceId,
    bitrate: Option<i32>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    tracing::info!(
        "[Cmd] change_audio_bitrate: ip={}, device={:?}, bitrate={:?}",
        ip,
        device_id,
        bitrate
    );
    let ip_addr = ip
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;
    state
        .audio
        .change_audio_bitrate(ip_addr, device_id, bitrate)
        .await
}

#[tauri::command]
pub async fn get_process_list(
    ip: String,
    state: State<'_, AppState>,
) -> Result<Vec<gemacast_core::domain::types::ProcessInfo>, String> {
    let ip_addr = ip
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;
    state.audio.get_process_list(ip_addr).await
}

#[tauri::command]
pub async fn establish_websocket(
    streamer_ip: String,
    device_id: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    tracing::info!(
        "[Cmd] establish_websocket: ip={}, device={}",
        streamer_ip,
        device_id
    );
    let ip_addr = streamer_ip
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;
    state.audio.establish_websocket(ip_addr, device_id).await
}

#[tauri::command]
pub fn check_exclusive_support() -> bool {
    gemacast_core::stream::player::stream::probe_exclusive_support()
}

#[tauri::command]
pub async fn restart_session(
    exclusive_mode: bool,
    state: State<'_, AppState>,
) -> Result<(), String> {
    tracing::info!("[Cmd] restart_session: exclusive_mode={}", exclusive_mode,);
    state.audio.restart_session(exclusive_mode).await
}

/// Map a gain in dBFS onto the linear volume the audio session takes.
///
/// The bottom of the slider is a real mute, not merely a small number: the UI
/// shows "已静音" there, so anything the user can still hear would contradict it.
/// -24 dB is also the endpoint, so treating it as an exact zero costs no usable
/// range. The ceiling stays at +12 dB.
fn gain_db_to_linear(gain_db: f32) -> f32 {
    if gain_db <= -24.0 {
        0.0
    } else {
        10f32.powf(gain_db.min(12.0) / 20.0)
    }
}

#[tauri::command]
pub async fn set_audio_gain(gain_db: f32, state: State<'_, AppState>) -> Result<(), String> {
    tracing::info!("[Cmd] set_audio_gain: {}dB", gain_db);
    let linear = gain_db_to_linear(gain_db);
    state.audio.set_volume(linear).await
}

#[tauri::command]
pub async fn set_match_pc_volume(enabled: bool, state: State<'_, AppState>) -> Result<(), String> {
    tracing::info!("[Cmd] set_match_pc_volume: {}", enabled);
    state.audio.set_match_pc_volume(enabled).await
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkLinkPairInfo {
    pub phone: gemacast_core::domain::types::NetworkLink,
    pub pc: gemacast_core::domain::types::NetworkLink,
    pub effective: gemacast_core::domain::types::NetworkLink,
    pub effective_label: String,
}

fn network_link_label(link: gemacast_core::domain::types::NetworkLink) -> String {
    use gemacast_core::domain::types::NetworkLink;
    match link {
        NetworkLink::Adb => "ADB (localhost)".to_string(),
        NetworkLink::UsbTether => "USB Tether".to_string(),
        NetworkLink::Wifi5Ghz => "WiFi 5 GHz".to_string(),
        NetworkLink::Wifi2_4Ghz => "WiFi 2.4 GHz".to_string(),
        NetworkLink::Ethernet => "Ethernet".to_string(),
        NetworkLink::WifiUnknown => "WiFi".to_string(),
        NetworkLink::Unknown => "Unknown".to_string(),
    }
}

#[tauri::command]
pub fn get_network_link_pair(state: State<'_, AppState>) -> Option<NetworkLinkPairInfo> {
    state.audio.get_cached_link_pair().map(|pair| {
        let effective = pair.effective_link();
        NetworkLinkPairInfo {
            phone: pair.phone,
            pc: pair.pc,
            effective,
            effective_label: network_link_label(effective),
        }
    })
}

#[cfg(test)]
mod tests {
    use super::gain_db_to_linear;

    #[test]
    fn the_bottom_of_the_slider_should_be_exact_silence() {
        // The UI calls this state "已静音"; a 6% residual would audibly contradict it.
        assert_eq!(gain_db_to_linear(-24.0), 0.0);
        assert_eq!(gain_db_to_linear(-40.0), 0.0);
    }

    #[test]
    fn unity_gain_should_stay_unity() {
        assert!((gain_db_to_linear(0.0) - 1.0).abs() < 1e-6);
    }

    #[test]
    fn the_gain_should_be_clamped_at_the_top_of_the_slider() {
        assert!((gain_db_to_linear(99.0) - gain_db_to_linear(12.0)).abs() < 1e-6);
    }

    #[test]
    fn a_gain_just_above_the_floor_should_still_pass_audio() {
        // -23.5 dB is the first usable step; it must not be swept into the mute.
        assert!(gain_db_to_linear(-23.5) > 0.0);
    }
}
