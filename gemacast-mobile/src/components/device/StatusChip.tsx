import { useAppStore } from '../../stores/app-store';
import { Status } from '../../core/types';

/**
 * Status label presentation.
 *
 * There is deliberately no indicator dot. The metrics row beside it already
 * encodes health in the tinted values, so a dot was a second encoding of the
 * same fact — and its glow + breathing ring were the loudest thing in a panel
 * whose job is to be read, not watched.
 *
 * `tone` spends colour only where it carries information: the ordinary states
 * are neutral, and only paused/reconnecting tint. A green "Connected" next to
 * three green numbers says nothing the numbers do not already say.
 */
const STATUS_CONFIG: Record<
  Status,
  { tone: string; label: string } | ((attempts: number) => { tone: string; label: string })
> = {
  [Status.Idle]: { tone: 'text-muted-foreground', label: '空闲' },
  [Status.Listening]: { tone: 'text-muted-foreground', label: '扫描中…' },
  [Status.Connecting]: { tone: 'text-muted-foreground', label: '连接中…' },
  [Status.Connected]: { tone: 'text-foreground', label: '已连接' },
  [Status.Playing]: { tone: 'text-foreground', label: '播放中' },
  [Status.Paused]: { tone: 'text-status-warn', label: '已暂停' },
  [Status.Reconnecting]: (attempts) => ({
    tone: 'text-status-warn',
    label: attempts > 0 ? `重连中 (${attempts}/5)…` : '重连中…',
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
      className={`text-xs font-medium tracking-wide whitespace-nowrap transition-colors duration-300 ${config.tone}`}
    >
      {config.label}
    </span>
  );
}
