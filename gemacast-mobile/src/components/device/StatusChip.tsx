import { useAppStore } from '../../stores/app-store';
import { Status } from '../../core/types';

type StatusDisplay = {
  tone: string;
  dotBg: string;
  dotPulse?: boolean;
  label: string;
  glow: string;
  badgeBg: string;
};

const STATUS_CONFIG: Record<Status, StatusDisplay | ((attempts: number) => StatusDisplay)> = {
  [Status.Idle]: {
    tone: 'text-muted-foreground',
    dotBg: 'bg-muted-foreground/60',
    label: '空闲',
    glow: 'transparent',
    badgeBg: 'bg-muted/40 border-border/50',
  },
  [Status.Listening]: {
    tone: 'text-primary font-medium',
    dotBg: 'bg-primary',
    dotPulse: true,
    label: '扫描中…',
    glow: 'shadow-[0_0_8px_var(--color-primary)]',
    badgeBg: 'bg-primary/10 border-primary/25',
  },
  [Status.Connecting]: {
    tone: 'text-status-connecting font-medium',
    dotBg: 'bg-status-connecting',
    dotPulse: true,
    label: '连接中…',
    glow: 'shadow-[0_0_8px_var(--color-status-connecting)]',
    badgeBg: 'bg-status-connecting-bg border-status-connecting-border',
  },
  [Status.Connected]: {
    tone: 'text-status-ok font-semibold',
    dotBg: 'bg-status-ok',
    label: '已连接',
    glow: 'shadow-[0_0_8px_var(--color-status-ok)]',
    badgeBg: 'bg-status-ok-bg border-status-ok-border',
  },
  [Status.Playing]: {
    tone: 'text-status-ok font-semibold',
    dotBg: 'bg-status-ok',
    dotPulse: true,
    label: '播放中',
    glow: 'shadow-[0_0_10px_var(--color-status-ok)]',
    badgeBg: 'bg-status-ok-bg border-status-ok-border',
  },
  [Status.Paused]: {
    tone: 'text-status-warn font-semibold',
    dotBg: 'bg-status-warn',
    label: '已暂停',
    glow: 'shadow-[0_0_8px_var(--color-status-warn)]',
    badgeBg: 'bg-status-warn-bg border-status-warn-border',
  },
  [Status.Reconnecting]: (attempts) => ({
    tone: 'text-status-warn font-semibold',
    dotBg: 'bg-status-warn',
    dotPulse: true,
    label: attempts > 0 ? `重连中 (${attempts}/5)…` : '重连中…',
    glow: 'shadow-[0_0_8px_var(--color-status-warn)]',
    badgeBg: 'bg-status-warn-bg border-status-warn-border',
  }),
};

export function StatusChip() {
  const status = useAppStore((s) => s.status);
  const attempts = useAppStore((s) => s.reconnectAttempts);

  const configEntry = STATUS_CONFIG[status];
  const config = typeof configEntry === 'function' ? configEntry(attempts) : configEntry;

  return (
    <span
      role="status"
      aria-live="polite"
      className={`
        inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide
        whitespace-nowrap transition-all duration-300 backdrop-blur-md
        ${config.badgeBg} ${config.tone}
      `}
    >
      <span className="relative flex h-2 w-2">
        {config.dotPulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dotBg}`}
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${config.dotBg} ${config.glow}`}
        />
      </span>
      <span>{config.label}</span>
    </span>
  );
}
