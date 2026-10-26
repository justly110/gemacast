import { useAppStore } from '../../stores/app-store';
import { hasLiveSession } from '../../core/types';
import { StatusChip } from '../device/StatusChip';
import { HelpDialog, useHelpDialog } from '../shared/HelpDialog';
import { ConnectionMetrics } from './ConnectionMetrics';
import { NetworkLinkBadge } from './NetworkLinkBadge';

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
      </div>

      <ConnectionMetrics renderHelpButton={help.renderHelpButton} />
      <HelpDialog activeKey={help.activeKey} onClose={help.closeHelp} dialogRef={help.dialogRef} />
    </section>
  );
}
