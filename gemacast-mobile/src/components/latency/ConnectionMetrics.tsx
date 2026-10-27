import { useAppStore } from '../../stores/app-store';
import { Status } from '../../core/types';

function bandColor(ms: number | null, warn: number, lost: number): string {
  if (ms === null) return 'text-muted-foreground/50';
  if (ms <= warn) return 'text-status-ok drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]';
  if (ms <= lost) return 'text-status-warn drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]';
  return 'text-status-lost drop-shadow-[0_0_8px_rgba(239,68,68,0.35)]';
}

type MetricProps = {
  label: string;
  ms: number | null;
  tone: string;
  placeholder?: string;
};

function Metric({ label, ms, tone, placeholder }: MetricProps) {
  const unavailable = ms === null && placeholder !== undefined;

  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-1.5 py-1">
      <span
        className={`flex items-baseline whitespace-nowrap text-[22px] font-bold font-mono tracking-tight leading-none tabular-nums transition-all duration-300 ${tone}`}
      >
        {unavailable ? (
          <span className="text-[13px] font-sans font-medium text-muted-foreground/70">
            {placeholder}
          </span>
        ) : (
          <>
            {ms === null ? '--' : ms}
            <span className="ml-0.5 text-[10px] font-sans font-semibold text-muted-foreground/80">
              ms
            </span>
          </>
        )}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
        {label}
      </span>
    </div>
  );
}

type ConnectionMetricsProps = {
  renderHelpButton?: (key: string) => React.ReactNode;
};

export function ConnectionMetrics({ renderHelpButton }: ConnectionMetricsProps = {}) {
  const metrics = useAppStore((s) => s.metrics);
  const status = useAppStore((s) => s.status);
  const linkPair = useAppStore((s) => s.networkLinkPair);

  const visible =
    status === Status.Connected || status === Status.Playing || status === Status.Paused;
  if (!visible) return null;

  const isLoopback = linkPair?.effective === 'adb';

  return (
    <div
      className="mt-3 grid w-full grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto] items-center rounded-xl bg-background/30 p-2 backdrop-blur-md border border-white/5 dark:border-white/[0.04]"
      role="group"
      aria-label="连接指标"
    >
      <span aria-hidden="true" className={renderHelpButton ? 'w-6' : ''} />
      <Metric label="缓冲" ms={metrics.bufferMs} tone={bandColor(metrics.bufferMs, 30, 60)} />
      <span aria-hidden="true" className="readout-divider h-8 w-px self-center" />
      <Metric
        label="往返延迟"
        ms={metrics.networkRttMs}
        tone={bandColor(metrics.networkRttMs, 30, 80)}
        placeholder={isLoopback ? 'n/a' : undefined}
      />
      <span aria-hidden="true" className="readout-divider h-8 w-px self-center" />
      <Metric label="抖动" ms={metrics.jitterMs} tone={bandColor(metrics.jitterMs, 10, 25)} />
      <span className="self-center flex items-center justify-center">
        {renderHelpButton?.('connection-metrics')}
      </span>
    </div>
  );
}
