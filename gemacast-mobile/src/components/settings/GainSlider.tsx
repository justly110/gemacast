import { useState, useRef, useEffect } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { tauriBridge } from '../../core/tauri-bridge';
import { RotateCcw } from 'lucide-react';

const MIN_DB = -24;
const MAX_DB = 12;
const STEP = 0.5;
const DEBOUNCE_MS = 100;

function formatDb(db: number): string {
  if (db === 0) return '±0.0 dB';
  const sign = db > 0 ? '+' : '';
  return `${sign}${db.toFixed(1)} dB`;
}

export function GainSlider() {
  const { settings, update } = useSettings();
  const [localDb, setLocalDb] = useState(settings.gainDb);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalDb(settings.gainDb);
  }, [settings.gainDb]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLocalDb(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      update({ gainDb: value });
      tauriBridge.setAudioGain({ gainDb: value }).catch((err) => {
        console.warn('Failed to set audio gain:', err);
      });
    }, DEBOUNCE_MS);
  };

  const handleReset = () => {
    setLocalDb(0);
    update({ gainDb: 0 });
    tauriBridge.setAudioGain({ gainDb: 0 }).catch((err) => {
      console.warn('Failed to reset audio gain:', err);
    });
  };

  const offset = (localDb - MIN_DB) / (MAX_DB - MIN_DB);
  const zeroOffset = (0 - MIN_DB) / (MAX_DB - MIN_DB);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/50 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-bold font-mono tracking-tight tabular-nums ${
            localDb === 0
              ? 'text-muted-foreground'
              : localDb > 0
                ? 'text-accent-yellow drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                : 'text-accent-aqua drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]'
          }`}
        >
          {formatDb(localDb)}
        </span>
        {localDb !== 0 && (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-95"
            onClick={handleReset}
            aria-label="重置增益为 0 dB"
          >
            <RotateCcw className="h-3 w-3" />
            <span>重置</span>
          </button>
        )}
      </div>

      <div className="relative py-1">
        {/* 0 dB 刻度线 */}
        <div
          className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 bg-muted-foreground/50 z-10 pointer-events-none rounded-full"
          style={{ left: `calc(11px + (100% - 22px) * ${zeroOffset})` }}
        />

        <input
          type="range"
          min={MIN_DB}
          max={MAX_DB}
          step={STEP}
          value={localDb}
          onChange={handleChange}
          className="gain-slider w-full cursor-pointer"
          aria-label="音频增益"
          style={
            {
              '--fill-pos': `calc(11px + (100% - 22px) * ${offset})`,
              '--zero-pos': `calc(11px + (100% - 22px) * ${zeroOffset})`,
            } as React.CSSProperties
          }
        />
      </div>

      <div className="relative h-4 text-[0.7rem] font-mono font-medium text-muted-foreground/60">
        <span className="absolute left-0">{MIN_DB} dB</span>
        <span
          className="absolute -translate-x-1/2"
          style={{ left: `calc(11px + (100% - 22px) * ${zeroOffset})` }}
        >
          0 dB
        </span>
        <span className="absolute right-0">+{MAX_DB} dB</span>
      </div>
    </div>
  );
}
