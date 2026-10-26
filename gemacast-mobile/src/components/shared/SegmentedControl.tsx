type SegmentOption<T extends string = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type SegmentedControlProps<T extends string = string> = {
  name: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'default' | 'mini';
};

export function SegmentedControl<T extends string = string>({
  name,
  options,
  value,
  onChange,
  size = 'default',
}: SegmentedControlProps<T>) {
  const isMini = size === 'mini';
  return (
    <div
      className={`
        flex items-center gap-1 overflow-hidden rounded-2xl border border-border/70 bg-background/50 p-1 backdrop-blur-md
        ${isMini ? 'w-auto' : 'w-full'}
      `}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex-1 cursor-pointer rounded-xl text-center font-bold tracking-tight transition-all duration-200 select-none
            ${isMini ? 'px-2.5 py-1 text-xs' : 'px-3 py-2 text-xs'}
            ${
              value === option.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            }
            ${option.disabled ? 'pointer-events-none opacity-30 grayscale' : ''}
          `}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={option.disabled}
            className="sr-only"
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
