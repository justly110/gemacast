import { Monitor, Usb, Play, Pause } from 'lucide-react';
import type {
  AudioSource,
  DiscoveredStreamer,
  ProcessInfo,
  StreamerCapabilities,
} from '../../core/types';
import { ProcessSelect } from './ProcessSelect';

type StreamerCardProps = {
  streamer: DiscoveredStreamer;
  isConnected: boolean;
  isConnecting: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  isDisabled: boolean;
  audioSources: AudioSource[];
  processList: ProcessInfo[];
  streamerCapabilities: StreamerCapabilities | null;
  currentSource: AudioSource;
  onToggle: () => void;
  onPlayPause: () => void;
  onSourceChange: (source: AudioSource) => void;
};

export function StreamerCard({
  streamer,
  isConnected,
  isConnecting,
  isPlaying,
  isLoading,
  isDisabled,
  audioSources,
  processList,
  streamerCapabilities,
  currentSource,
  onToggle,
  onPlayPause,
  onSourceChange,
}: StreamerCardProps) {
  const isAdb = streamer.addr.startsWith('127.0.0.1');
  const showLoading = isLoading && (isConnected || isConnecting);
  const hasSource = isConnected && (audioSources.length > 0 || processList.length > 0);

  return (
    <li
      className={`
        surface-card relative flex items-center justify-between gap-4 rounded-2xl
        p-4.5 transition-all duration-300 animate-[fade-in_250ms_ease-out]
        ${hasSource ? 'flex-wrap' : ''}
        ${
          isConnected
            ? 'z-10 border-primary/50 shadow-[0_8px_32px_rgba(2,132,199,0.18)] dark:shadow-[0_8px_36px_rgba(56,189,248,0.22)]'
            : 'z-0 hover:border-primary/40'
        }
      `}
    >
      {/* 顶部高光微细反光条 */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[1px] transition-opacity duration-300 ${
          isConnected
            ? 'bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-100'
            : 'bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-100 dark:via-white/10'
        }`}
      />

      <div
        className={`flex items-center gap-3.5 overflow-hidden ${hasSource ? 'min-w-0 flex-1' : 'min-w-0'}`}
      >
        <div
          className={`
            flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300
            ${
              isConnected
                ? 'border-primary/40 bg-primary/15 text-primary shadow-[0_0_16px_rgba(2,132,199,0.25)] dark:shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                : 'border-border/60 bg-muted/30 text-muted-foreground'
            }
          `}
        >
          {isAdb ? <Usb className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </div>

        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-[15px] font-bold tracking-tight text-foreground">
            {streamer.deviceName}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isConnected
                  ? 'bg-status-ok shadow-[0_0_6px_var(--color-status-ok)]'
                  : 'bg-muted-foreground/40'
              }`}
            />
            <p className="truncate text-xs font-mono font-medium text-muted-foreground">
              {isAdb ? 'ADB (USB 调试)' : streamer.addr.split(':')[0]}
            </p>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          disabled={isDisabled}
          className={`
            relative inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-[0.97]
            ${showLoading ? 'pointer-events-none' : ''}
            ${isDisabled && !showLoading ? 'opacity-40 pointer-events-none' : ''}
            ${
              isConnected
                ? 'border-destructive/40 bg-destructive/15 text-destructive backdrop-blur-md hover:bg-destructive hover:text-destructive-foreground shadow-[0_2px_12px_rgba(239,68,68,0.15)]'
                : 'border-border/80 bg-background/60 text-foreground backdrop-blur-md hover:border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-sm'
            }
          `}
          onClick={onToggle}
          aria-label={`${isConnected ? '断开与' : '连接至'} ${streamer.deviceName}`}
        >
          <span
            className={`transition-opacity duration-150 ${showLoading ? 'opacity-0' : 'opacity-100'}`}
          >
            {isConnected ? '断开' : '连接'}
          </span>
          {showLoading && (
            <span className="absolute left-1/2 top-1/2 inline-block h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
          )}
        </button>

        {isConnected && (
          <button
            type="button"
            disabled={isDisabled}
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 p-2 text-primary backdrop-blur-md transition-all duration-200 hover:bg-primary hover:text-primary-foreground active:scale-[0.95] shadow-[0_2px_12px_rgba(2,132,199,0.2)]"
            onClick={onPlayPause}
            aria-label={
              isPlaying ? `暂停 ${streamer.deviceName}` : `继续 ${streamer.deviceName}`
            }
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        )}
      </div>

      {hasSource && (
        <ProcessSelect
          audioSources={audioSources}
          processList={processList}
          currentSource={currentSource}
          onSourceChange={onSourceChange}
          streamer={streamer}
          supportsProcessCapture={streamerCapabilities?.supportsProcessCapture ?? true}
        />
      )}
    </li>
  );
}
