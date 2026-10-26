import { useUpdater } from '../../hooks/use-updater';
import { Download, RefreshCw, AlertTriangle, RotateCcw, CheckCircle2 } from 'lucide-react';

export function UpdateBanner() {
  const { state, checkForUpdates, startDownload, installUpdate, retry } = useUpdater();

  if (state.status === 'up-to-date' || state.status === 'idle') {
    return (
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-border/70 bg-background/50 p-4 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-status-ok" />
          <span className="text-xs font-semibold">当前已是最新版本</span>
        </div>
        <button
          type="button"
          onClick={checkForUpdates}
          className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-95 shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-primary" />
          <span>检查更新</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-2xl border border-border/80 bg-background/60 p-4 backdrop-blur-md shadow-sm">
      {state.status === 'checking' && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs font-medium">正在检查更新…</span>
        </div>
      )}

      {state.status === 'available' && (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight text-foreground">发现新版本</p>
            <p className="text-xs font-mono text-muted-foreground">v{state.version}</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all duration-150 hover:opacity-90 active:scale-95"
            onClick={startDownload}
          >
            <Download className="h-4 w-4" />
            <span>下载</span>
          </button>
        </div>
      )}

      {state.status === 'downloading' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">正在下载…</span>
            <span className="text-xs font-mono font-bold tabular-nums text-primary">
              {state.percent}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out shadow-[0_0_8px_var(--color-primary)]"
              style={{ width: `${state.percent}%` }}
            />
          </div>
        </div>
      )}

      {state.status === 'ready' && (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight text-foreground">准备安装</p>
            <p className="text-xs font-mono text-muted-foreground">v{state.version}</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all duration-150 hover:opacity-90 active:scale-95"
            onClick={installUpdate}
          >
            <Download className="h-4 w-4" />
            <span>安装</span>
          </button>
        </div>
      )}

      {state.status === 'installing' && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs font-medium">正在打开安装程序…</span>
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1 text-status-warn">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-xs font-medium truncate">{state.errorMessage}</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-95"
            onClick={retry}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>重试</span>
          </button>
        </div>
      )}
    </div>
  );
}
