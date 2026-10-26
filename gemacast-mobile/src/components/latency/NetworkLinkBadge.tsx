import { useAppStore } from '../../stores/app-store';
import { Status } from '../../core/types';
import type { NetworkLink } from '../../core/types';
import { Usb, Wifi, Globe, Cable, HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type LinkMeta = {
  icon: LucideIcon;
  label: string;
  color: string;
  badgeBg: string;
};

function getLinkMeta(link: NetworkLink): LinkMeta {
  switch (link) {
    case 'adb':
      return {
        icon: Cable,
        label: 'ADB 调试',
        color: 'text-accent-green',
        badgeBg: 'bg-accent-green/10 border-accent-green/20',
      };
    case 'usbTether':
      return {
        icon: Usb,
        label: 'USB 共享',
        color: 'text-accent-green',
        badgeBg: 'bg-accent-green/10 border-accent-green/20',
      };
    case 'wifi5Ghz':
      return {
        icon: Wifi,
        label: '5 GHz 极速',
        color: 'text-accent-aqua',
        badgeBg: 'bg-accent-aqua/10 border-accent-aqua/20',
      };
    case 'wifi2_4Ghz':
      return {
        icon: Wifi,
        label: '2.4 GHz',
        color: 'text-accent-yellow',
        badgeBg: 'bg-accent-yellow/10 border-accent-yellow/20',
      };
    case 'ethernet':
      return {
        icon: Globe,
        label: '以太网',
        color: 'text-accent-blue',
        badgeBg: 'bg-accent-blue/10 border-accent-blue/20',
      };
    case 'wifiUnknown':
      return {
        icon: Wifi,
        label: 'Wi-Fi',
        color: 'text-muted-foreground',
        badgeBg: 'bg-muted/40 border-border/40',
      };
    default:
      return {
        icon: HelpCircle,
        label: '未知网络',
        color: 'text-muted-foreground/60',
        badgeBg: 'bg-muted/30 border-border/30',
      };
  }
}

type NetworkLinkBadgeProps = {
  withLeadingSeparator?: boolean;
};

export function NetworkLinkBadge({ withLeadingSeparator = false }: NetworkLinkBadgeProps = {}) {
  const linkPair = useAppStore((s) => s.networkLinkPair);
  const status = useAppStore((s) => s.status);

  const visible =
    linkPair &&
    (status === Status.Connected || status === Status.Playing || status === Status.Paused);

  if (!visible) return null;

  const effective = getLinkMeta(linkPair.effective);
  const EffectiveIcon = effective.icon;

  const isSymmetric = linkPair.phone === linkPair.pc;
  const phone = getLinkMeta(linkPair.phone);
  const pc = getLinkMeta(linkPair.pc);

  return (
    <div
      id="network-link-badge"
      className="inline-flex min-w-0 items-center gap-1.5"
      title={
        isSymmetric
          ? `网络链路: ${effective.label}`
          : `手机端 ${phone.label}，电脑端 ${pc.label} — 缓冲针对 ${effective.label} 优化`
      }
    >
      {withLeadingSeparator && (
        <span aria-hidden="true" className="text-border/80">
          •
        </span>
      )}
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium backdrop-blur-md transition-colors ${effective.badgeBg}`}
      >
        <EffectiveIcon size={12} className={`shrink-0 ${effective.color}`} aria-hidden="true" />
        <span className={`truncate ${effective.color}`}>{effective.label}</span>
      </div>
    </div>
  );
}
