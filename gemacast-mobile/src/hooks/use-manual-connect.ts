import { useState } from 'react';
import { useAppStore } from '../stores/app-store';
import { useToastStore } from '../stores/toast-store';
import { tauriBridge } from '../core/tauri-bridge';
import { connectToStreamer } from './use-connection';
import { Ports } from '../core/constants';

/**
 * Hook that encapsulates the "connect by IP address" business logic:
 * - IP validation
 * - Reachability probe
 * - Manual streamer creation
 * - Connect/disconnect orchestration
 * - Discovery list mutation
 *
 * The ManualConnect component becomes a pure form renderer.
 */
export function useManualConnect() {
  const [ip, setIp] = useState('');
  const [isProbing, setIsProbing] = useState(false);
  const isLoading = useAppStore((s) => s.isLoading);
  const connectingStreamerId = useAppStore((s) => s.connectingStreamerId);

  const isManualConnecting =
    isProbing || (isLoading && connectingStreamerId?.startsWith('manual-'));

  const handleConnect = async () => {
    const trimmed = ip.trim();
    if (!trimmed) return;

    const octets = trimmed.split('.');
    const validIpv4 =
      octets.length === 4 &&
      octets.every((octet) => /^(0|[1-9]\d{0,2})$/.test(octet) && Number(octet) <= 255);
    const first = Number(octets[0]);
    const last = Number(octets[3]);
    const forbidden =
      first === 0 || first === 127 || first >= 224 || (first === 255 && last === 255);
    if (!validIpv4 || forbidden) {
      useToastStore.getState().show('warning', '无效的 IP 地址');
      return;
    }

    setIsProbing(true);
    useAppStore.getState().patch({ isLoading: true });

    try {
      await tauriBridge.probeStreamer({
        ip: trimmed,
        deviceId: useAppStore.getState().deviceInfo.deviceId,
      });
    } catch {
      useToastStore.getState().show('warning', '此 IP 地址无法访问');
      useAppStore.getState().patch({ isLoading: false });
      return;
    } finally {
      setIsProbing(false);
    }

    const manualStreamer = {
      deviceId: `manual-${trimmed}`,
      deviceName: `手动连接: ${trimmed}`,
      addr: `${trimmed}:${Ports.DISCOVERY}`,
      isOffline: false,
    };

    const previousStreamer = useAppStore.getState().connectedStreamer;
    const result = await connectToStreamer(manualStreamer);
    if (result.ok) {
      const state = useAppStore.getState();
      const existsIndex = state.discoveredStreamers.findIndex(
        (s) => s.deviceId === manualStreamer.deviceId,
      );
      const newList = [...state.discoveredStreamers];
      if (existsIndex >= 0) newList.splice(existsIndex, 1);
      newList.unshift(manualStreamer);
      useAppStore.getState().setDiscoveredStreamers(newList);
      setIp('');
    } else if (previousStreamer) {
      const restored = await connectToStreamer(previousStreamer);
      if (!restored.ok) {
        useToastStore.getState().show('warning', '无法恢复先前的音频流');
      }
    }
  };

  return {
    ip,
    setIp,
    isLoading: isManualConnecting,
    handleConnect,
    isDisabled: isLoading || !ip.trim() || isProbing,
  };
}
