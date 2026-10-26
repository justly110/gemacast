import { useState } from 'react';
import { ChevronDown, Network } from 'lucide-react';
import { useManualConnect } from '../../hooks/use-manual-connect';
import { useAppStore } from '../../stores/app-store';
import { hasLiveSession } from '../../core/types';

export function ManualConnect() {
  const { ip, setIp, isLoading, isDisabled, handleConnect } = useManualConnect();
  const [expanded, setExpanded] = useState(false);
  const status = useAppStore((s) => s.status);

  if (hasLiveSession(status)) return null;

  return (
    <div className="surface-card relative z-0 mb-2 rounded-2xl overflow-hidden transition-all duration-300">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4.5 py-3.5 text-sm font-semibold text-card-foreground transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/5 active:scale-[0.99]"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls="manual-connect-form"
      >
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary opacity-80" />
          <span>通过 IP 地址连接</span>
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/40 border border-border/40 text-muted-foreground transition-transform duration-300">
          <ChevronDown
            className={`
              h-3.5 w-3.5 transition-transform duration-300 ease-out
              ${expanded ? 'rotate-180 text-foreground' : 'rotate-0'}
            `}
          />
        </div>
      </button>

      <div
        id="manual-connect-form"
        className={`
          grid transition-[grid-template-rows] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}
        `}
      >
        <div className="overflow-hidden">
          <div className="flex gap-2.5 px-4.5 pb-4.5 pt-1">
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              placeholder="192.xx.xx.xx"
              className={`
                flex-1 min-w-0 rounded-xl border border-border/70 bg-background/50
                px-3.5 py-2 text-sm text-foreground outline-none font-mono
                placeholder:text-muted-foreground/60 backdrop-blur-md transition-all duration-200
                focus:border-primary focus:ring-2 focus:ring-primary/25 focus:bg-background/80
              `}
              disabled={isLoading}
              tabIndex={expanded ? 0 : -1}
            />
            <button
              type="button"
              className={`
                relative inline-flex items-center justify-center whitespace-nowrap rounded-xl
                border border-primary/30 bg-primary/15 px-4.5 py-2 text-xs font-bold text-primary
                backdrop-blur-md transition-all duration-200 hover:bg-primary hover:text-primary-foreground
                active:scale-[0.97] disabled:pointer-events-none shadow-[0_2px_8px_rgba(2,132,199,0.15)]
                ${isDisabled && !isLoading ? 'opacity-40' : ''}
              `}
              onClick={handleConnect}
              disabled={isDisabled}
              tabIndex={expanded ? 0 : -1}
            >
              <span
                className={`transition-opacity duration-150 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              >
                连接
              </span>
              {isLoading && (
                <span className="absolute left-1/2 top-1/2 inline-block h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
