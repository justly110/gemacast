import { useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { tauriBridge } from '../../core/tauri-bridge';
import {
  forgetPcName,
  loadLastStreamer,
  loadPcNames,
  saveLastMode,
  saveLastStreamer,
} from '../../core/persistence';
import { disconnect } from '../../hooks/use-connection';
import { useAppStore } from '../../stores/app-store';
import { useToastStore } from '../../stores/toast-store';
import { ConfirmDialog } from '../shared/ConfirmDialog';

export function ForgetPcIdentity() {
  const connectedStreamer = useAppStore((state) => state.connectedStreamer);
  const connectedStreamerId = connectedStreamer?.deviceId;
  const lastConnectedStreamer = useAppStore((state) => state.lastConnectedStreamer);
  const discoveredStreamers = useAppStore((state) => state.discoveredStreamers);
  const [pairedPcIds, setPairedPcIds] = useState<string[]>([]);
  const [rememberedNames, setRememberedNames] = useState<Record<string, string>>({});
  const [selectedPc, setSelectedPc] = useState<{ deviceId: string; deviceName: string } | null>(
    null,
  );
  const hasLoadedPairedPcs = useRef(false);

  useEffect(() => {
    if (hasLoadedPairedPcs.current && !connectedStreamerId) return;
    hasLoadedPairedPcs.current = true;
    let active = true;
    void tauriBridge
      .getPairedPcIds()
      .then((ids) => {
        if (active) {
          setPairedPcIds([...new Set(ids)]);
          setRememberedNames(loadPcNames());
        }
      })
      .catch((error) => {
        if (active) {
          useToastStore.getState().show('error', '无法加载已配对电脑', String(error));
        }
      });
    return () => {
      active = false;
    };
  }, [connectedStreamerId]);

  const streamers = (() => {
    const byId = new Map<string, string>(Object.entries(rememberedNames));
    for (const streamer of [...discoveredStreamers, lastConnectedStreamer, connectedStreamer]) {
      if (streamer?.deviceName) byId.set(streamer.deviceId, streamer.deviceName);
    }
    return pairedPcIds.map((deviceId) => ({
      deviceId,
      deviceName: byId.get(deviceId) ?? deviceId,
    }));
  })();

  const forget = async () => {
    if (!selectedPc) return;
    const pc = selectedPc;
    setSelectedPc(null);
    try {
      if (useAppStore.getState().connectedStreamer?.deviceId === pc.deviceId) {
        const result = await disconnect(true);
        if (!result.ok) throw result.error;
      }
      await tauriBridge.forgetPcIdentity(pc.deviceId);
      forgetPcName(pc.deviceId);
      if (loadLastStreamer()?.deviceId === pc.deviceId) {
        saveLastStreamer(null);
        saveLastMode(null);
        useAppStore.getState().patch({ lastConnectedStreamer: null, lastConnectedMode: null });
      }
      setPairedPcIds((ids) => ids.filter((id) => id !== pc.deviceId));
      useToastStore.getState().show('success', `已清除 ${pc.deviceName} 的配对信息`);
    } catch (error) {
      useToastStore.getState().show('error', `清除 ${pc.deviceName} 配对信息失败`, String(error));
    }
  };

  return (
    <div className="space-y-2">
      {streamers.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-background/40 p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground/70">暂无已配对电脑</p>
        </div>
      ) : (
        <div
          className="max-h-44 space-y-1.5 overflow-y-auto overscroll-contain pr-1 hide-scrollbar"
          role="list"
          aria-label="已配对电脑"
        >
          {streamers.map((streamer) => (
            <div
              key={streamer.deviceId}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3.5 py-2 text-sm backdrop-blur-md transition-colors hover:border-primary/40"
              role="listitem"
            >
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere] leading-snug font-medium text-foreground">
                {streamer.deviceName}
              </span>
              <button
                type="button"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:bg-destructive/15 hover:text-destructive active:scale-90"
                title={`清除 ${streamer.deviceName} 的配对`}
                aria-label={`清除 ${streamer.deviceName} 的配对`}
                onClick={() => setSelectedPc(streamer)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={selectedPc !== null}
        message={
          selectedPc
            ? selectedPc.deviceId === connectedStreamerId
              ? `断开并清除 ${selectedPc.deviceName} 的配对凭证？`
              : `确定要清除电脑 ${selectedPc.deviceName} 的信任身份吗？`
            : ''
        }
        confirmLabel="清除配对"
        cancelLabel="取消"
        onConfirm={forget}
        onCancel={() => setSelectedPc(null)}
      />
    </div>
  );
}
