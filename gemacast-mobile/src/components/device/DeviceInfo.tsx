import { useAppStore } from '../../stores/app-store';
import { Smartphone } from 'lucide-react';

export function DeviceInfo() {
  const deviceName = useAppStore((s) => s.deviceInfo.deviceName);
  const ip = useAppStore((s) => s.deviceInfo.ip);

  return (
    <section className="flex flex-col items-center gap-1.5 px-1 text-center animate-[fade-in_300ms_ease-out]">
      <div className="flex items-center justify-center gap-2 max-w-full">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_12px_rgba(2,132,199,0.15)] dark:shadow-[0_0_16px_rgba(56,189,248,0.2)]">
          <Smartphone className="h-4.5 w-4.5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground truncate max-w-[280px]">
          {deviceName}
        </span>
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-0.5 text-xs font-mono font-medium text-muted-foreground backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-status-ok shadow-[0_0_6px_var(--color-status-ok)]" />
        <span>IP: {ip}</span>
      </div>
    </section>
  );
}
