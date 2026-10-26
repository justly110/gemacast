import { Radio } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center animate-[fade-in_300ms_ease-out]">
      {/* 现代声学雷达脉冲微光圆环 */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-primary/20 bg-primary/10 animate-[scan-radar_2.5s_cubic-bezier(0.25,1,0.5,1)_infinite]" />
        <div className="absolute inset-1 rounded-full border border-primary/30 bg-primary/5 animate-[scan-radar_2.5s_cubic-bezier(0.25,1,0.5,1)_infinite_0.8s]" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary backdrop-blur-md shadow-[0_0_16px_rgba(2,132,199,0.25)] dark:shadow-[0_0_20px_rgba(56,189,248,0.3)]">
          <Radio className="h-5 w-5 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col gap-1 max-w-xs">
        <p className="m-0 text-[0.95rem] font-bold text-foreground tracking-tight">
          正在扫描局域网中的电脑…
        </p>
        <p className="m-0 text-xs font-medium text-muted-foreground leading-relaxed">
          请确保电脑端已运行 Gemacast，并处于相同 Wi-Fi 或已连接 USB 线缆
        </p>
      </div>
    </div>
  );
}
