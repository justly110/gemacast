import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useSettings } from '../../hooks/use-settings';
import { triggerHaptic } from '../../core/haptics';

const MIN_DB = -24;
const MAX_DB = 12;
const STEP = 0.5;
const DEBOUNCE_MS = 80;

function formatDb(db: number): string {
  if (db === 0) return '±0.0 dB';
  const sign = db > 0 ? '+' : '';
  return `${sign}${db.toFixed(1)} dB`;
}

export function QuickAudioControl() {
  const { settings, update } = useSettings();
  const [localDb, setLocalDb] = useState(settings.gainDb);
  const [lastNonZeroDb, setLastNonZeroDb] = useState(settings.gainDb || 0);
  const [prevGainDb, setPrevGainDb] = useState(settings.gainDb);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (prevGainDb !== settings.gainDb) {
    setPrevGainDb(settings.gainDb);
    setLocalDb(settings.gainDb);
    if (settings.gainDb > MIN_DB) {
      setLastNonZeroDb(settings.gainDb);
    }
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const applyGain = (val: number) => {
    setLocalDb(val);
    if (val > MIN_DB) setLastNonZeroDb(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      update({ gainDb: val });
    }, DEBOUNCE_MS);
  };

  const isMuted = localDb <= MIN_DB;

  const toggleMute = () => {
    triggerHaptic('light');
    if (isMuted) {
      const restore = lastNonZeroDb > MIN_DB ? lastNonZeroDb : 0;
      applyGain(restore);
    } else {
      applyGain(MIN_DB);
    }
  };

  const handleReset = () => {
    triggerHaptic('light');
    applyGain(0);
  };

  return (
    <div
      className="mt-3.5 pt-3 border-t border-border/50 flex flex-col gap-2 animate-[fade-in_200ms_ease-out]"
      aria-label="快速音频控制"
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <button
            type="button"
            onClick={toggleMute}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              isMuted
                ? 'bg-destructive/15 text-destructive hover:bg-destructive/25'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
            aria-label={isMuted ? '取消静音' : '快速静音'}
            title={isMuted ? '取消静音' : '快速静音'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <span className="text-[11px] text-muted-foreground font-mono">
            {isMuted ? '已静音' : `增益: ${formatDb(localDb)}`}
          </span>
        </div>

        {localDb !== 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-md bg-muted/40 hover:bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-all"
            aria-label="重置增益为 0dB"
          >
            <RotateCcw className="h-3 w-3" />
            <span>0 dB</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={MIN_DB}
          max={MAX_DB}
          step={STEP}
          value={localDb}
          onChange={(e) => applyGain(parseFloat(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted/60 accent-primary"
          aria-label="输出音量增益滑块"
        />
      </div>
    </div>
  );
}
