import { useAppStore } from '../../stores/app-store';
import { hasLiveSession, Status } from '../../core/types';
import { StatusChip } from '../device/StatusChip';
import { HelpDialog } from '../shared/HelpDialog';
import { useHelpDialog } from '../../hooks/use-help-dialog';
import { ConnectionMetrics } from './ConnectionMetrics';
import { NetworkLinkBadge } from './NetworkLinkBadge';
import { AudioVisualizer } from './AudioVisualizer';
import { QuickAudioControl } from './QuickAudioControl';

export function ConnectionReadout() {
  const status = useAppStore((s) => s.status);
  const help = useHelpDialog();

  if (!hasLiveSession(status)) return null;

  return (
    <section
      aria-label="连接状态"
      className="surface-card relative overflow-hidden rounded-2xl p-4.5 transition-all duration-300 animate-[fade-in_250ms_ease-out]"
    >
      {/* 顶部纳米高光微细线 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/20" />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusChip />
          <NetworkLinkBadge withLeadingSeparator />
        </div>
        <AudioVisualizer />
      </div>

      <ConnectionMetrics renderHelpButton={help.renderHelpButton} />
      {status !== Status.Reconnecting && <QuickAudioControl />}
      <HelpDialog activeKey={help.activeKey} onClose={help.closeHelp} dialogRef={help.dialogRef} />
    </section>
  );
}
