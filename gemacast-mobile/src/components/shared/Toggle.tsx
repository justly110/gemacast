type ToggleProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelOn?: string;
  labelOff?: string;
  disabled?: boolean;
};

export function Toggle({
  id,
  checked,
  onChange,
  labelOn = '开',
  labelOff = '关',
  disabled = false,
}: ToggleProps) {
  return (
    <label className="relative inline-flex cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={`
          relative flex h-8 w-20 items-center rounded-full border p-0.5 backdrop-blur-md transition-all duration-300
          ${disabled ? 'pointer-events-none opacity-40' : ''}
          ${
            checked
              ? 'border-primary/40 bg-primary/20 shadow-[0_0_12px_rgba(2,132,199,0.2)] dark:shadow-[0_0_16px_rgba(56,189,248,0.25)]'
              : 'border-border/70 bg-muted/40'
          }
        `}
      >
        <span
          className={`
            z-10 flex-1 text-center text-[11px] font-bold tracking-wider transition-colors duration-200
            ${checked ? 'text-muted-foreground/60' : 'text-foreground'}
          `}
        >
          {labelOff}
        </span>
        <span
          className={`
            z-10 flex-1 text-center text-[11px] font-bold tracking-wider transition-colors duration-200
            ${checked ? 'text-primary-foreground' : 'text-muted-foreground/60'}
          `}
        >
          {labelOn}
        </span>
        <div
          className={`
            absolute left-0.5 top-0.5 h-7 w-9 rounded-full transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              checked
                ? 'translate-x-9.5 bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(2,132,199,0.4)] dark:shadow-[0_2px_12px_rgba(56,189,248,0.5)]'
                : 'translate-x-0 bg-white dark:bg-slate-700 shadow-sm border border-black/5 dark:border-white/10'
            }
          `}
        />
      </div>
    </label>
  );
}
