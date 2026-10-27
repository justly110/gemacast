import { useState } from 'react';
import { Monitor, Volume2, Settings, ChevronDown, RefreshCw } from 'lucide-react';
import type { AudioSource, ProcessInfo, DiscoveredStreamer } from '../../core/types';
import { useConnection } from '../../hooks/use-connection';
import { PULL_REFRESH_IGNORE_ATTR } from '../../hooks/use-pull-to-refresh';

type ProcessSelectProps = {
  audioSources: AudioSource[];
  processList: ProcessInfo[];
  currentSource: AudioSource;
  onSourceChange: (source: AudioSource) => void;
  streamer: DiscoveredStreamer;
  supportsProcessCapture: boolean;
};

export function ProcessSelect({
  audioSources,
  processList,
  currentSource,
  onSourceChange,
  streamer,
  supportsProcessCapture,
}: ProcessSelectProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fetchProcessList } = useConnection();

  const startClosing = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setSearch('');
    }, 150);
  };

  const sortedProcesses = [...processList].sort((a, b) => {
    if (a.hasAudioSession !== b.hasAudioSession) {
      return a.hasAudioSession ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  const filteredProcesses = (() => {
    if (!search.trim()) return sortedProcesses;
    const q = search.toLowerCase();
    return sortedProcesses.filter((p) => p.name.toLowerCase().includes(q));
  })();

  const currentLabel = (() => {
    if (currentSource.type === 'desktop') {
      return (
        <div className="flex min-w-0 items-center gap-1.5">
          <Monitor className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate font-medium">Desktop Audio</span>
        </div>
      );
    }
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        {currentSource.hasAudioSession ? (
          <Volume2 className="h-3.5 w-3.5 shrink-0 text-accent-green" />
        ) : (
          <Settings className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate font-medium">
          {currentSource.name} (PID: {currentSource.pid})
        </span>
      </div>
    );
  })();

  const handleSelect = (source: AudioSource) => {
    onSourceChange(source);
    startClosing();
  };

  const hasDesktop = audioSources.some((s) => s.type === 'desktop');

  return (
    <div
      className={`relative flex w-full items-center gap-2 pt-2.5 mt-2 border-t border-border/50 ${open ? 'z-50' : 'z-auto'}`}
    >
      <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-muted-foreground/80">
        音源:
      </span>
      <button
        type="button"
        className={`
          flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl
          border border-border/70 bg-background/50 px-3 py-1.5 text-xs text-foreground
          backdrop-blur-md transition-all duration-200 hover:border-primary/50 hover:bg-background/80
          focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none
        `}
        onClick={() => (open ? startClosing() : setOpen(true))}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5">{currentLabel}</div>
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200 ${open && !closing ? 'rotate-180 text-foreground' : ''}`}
        />
      </button>

      {(open || closing) && (
        <div
          {...{ [PULL_REFRESH_IGNORE_ATTR]: '' }}
          className={`
            absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl
            border border-border/80 bg-popover/90 shadow-[0_16px_40px_rgba(0,0,0,0.25)]
            backdrop-blur-2xl
            ${closing ? 'animate-[fade-out_150ms_ease-in_forwards]' : 'animate-[fade-in_150ms_ease-out]'}
          `}
        >
          <div className="flex items-stretch border-b border-border/60 bg-muted/20">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索进程..."
              className={`
                flex-1 min-w-0 border-none bg-transparent px-3 py-2 text-xs
                text-foreground outline-none placeholder:text-muted-foreground/60
              `}
            />
            <button
              type="button"
              aria-label="刷新进程列表"
              className={`
                flex w-9 shrink-0 items-center justify-center border-l border-border/60 bg-transparent
                p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground
              `}
              onClick={async (e) => {
                e.stopPropagation();
                if (isRefreshing) return;
                setIsRefreshing(true);
                try {
                  await Promise.all([
                    fetchProcessList(streamer),
                    new Promise((r) => setTimeout(r, 600)),
                  ]);
                } finally {
                  setIsRefreshing(false);
                }
              }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>

          <div className="max-h-60 min-h-28 overflow-y-auto p-1.5 hide-scrollbar">
            {hasDesktop && (
              <button
                type="button"
                className={`
                  flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-medium transition-all duration-150
                  ${currentSource.type === 'desktop' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted/60 text-foreground'}
                `}
                onClick={() => handleSelect({ type: 'desktop' })}
              >
                <Monitor className="mr-2 h-3.5 w-3.5 shrink-0" /> 桌面整机音频
              </button>
            )}

            {filteredProcesses.map((proc) => {
              const isSelected = currentSource.type === 'process' && currentSource.pid === proc.pid;
              const isProcessDisabled = !supportsProcessCapture;
              return (
                <button
                  key={proc.pid}
                  type="button"
                  disabled={isProcessDisabled}
                  title={
                    isProcessDisabled
                      ? '此电脑不支持按进程捕获音频'
                      : undefined
                  }
                  className={`
                    flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium transition-all duration-150
                    ${isProcessDisabled ? 'cursor-not-allowed opacity-40' : ''}
                    ${isSelected && !isProcessDisabled ? 'bg-primary text-primary-foreground shadow-sm' : isProcessDisabled ? '' : 'hover:bg-muted/60 text-foreground'}
                  `}
                  onClick={() =>
                    handleSelect({
                      type: 'process',
                      pid: proc.pid,
                      name: proc.name,
                      hasAudioSession: proc.hasAudioSession,
                    })
                  }
                >
                  <span className="w-4.5 shrink-0">
                    {proc.hasAudioSession ? (
                      <Volume2 className={`h-3.5 w-3.5 ${isSelected ? 'text-primary-foreground' : 'text-accent-green'}`} />
                    ) : (
                      <Settings className="h-3.5 w-3.5 opacity-60" />
                    )}
                  </span>
                  <span className="truncate">{proc.name}</span>
                  <span className="ml-auto shrink-0 text-[10px] opacity-70 font-mono">
                    PID: {proc.pid}
                  </span>
                </button>
              );
            })}

            {!supportsProcessCapture && filteredProcesses.length > 0 && (
              <p className="border-t border-border/40 px-3 py-2 text-[10px] text-muted-foreground text-center">
                此电脑不支持按进程捕获音频
              </p>
            )}

            {filteredProcesses.length === 0 && (
              <p className="px-3 py-3 text-xs text-muted-foreground text-center">未找到相关进程</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
