import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
};

type CustomSelectProps<T extends string = string> = {
  id: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  renderOption?: (option: SelectOption<T>, isSelected: boolean) => React.ReactNode;
};

const FADE_MS = 150;

export function CustomSelect<T extends string = string>({
  id,
  options,
  value,
  onChange,
  renderOption,
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const startClosing = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, FADE_MS);
  };

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    startClosing();
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      startClosing();
    }
  };

  return (
    <div id={id} ref={containerRef} className="relative w-full" onBlur={handleBlur}>
      <button
        type="button"
        className={`
          flex w-full items-center justify-between rounded-xl
          border border-border/80 bg-background/60 p-3.5 text-sm font-semibold text-foreground
          backdrop-blur-md transition-all duration-200 hover:border-primary/50 hover:bg-background/90
          active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30
        `}
        onClick={() => (open ? startClosing() : setOpen(true))}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate">{selectedOption?.label ?? '请选择…'}</span>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-250 ease-out ${
              open && !closing ? 'rotate-180 text-foreground' : ''
            }`}
          />
        </div>
      </button>

      {(open || closing) && (
        <div
          role="listbox"
          className={`
            absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl
            border border-border/80 bg-popover/90 shadow-[0_16px_40px_rgba(0,0,0,0.25)]
            backdrop-blur-2xl
            ${closing ? 'animate-[fade-out_150ms_ease-in_forwards]' : 'animate-[fade-in_150ms_ease-out]'}
          `}
        >
          <div className="max-h-64 overflow-y-auto p-1.5 hide-scrollbar">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  className={`
                    flex w-full flex-col rounded-xl p-3 text-left transition-all duration-150
                    ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground hover:bg-muted/60'
                    }
                    ${option.disabled ? 'pointer-events-none opacity-30' : ''}
                  `}
                  onClick={() => handleSelect(option.value)}
                >
                  {renderOption ? (
                    renderOption(option, isSelected)
                  ) : (
                    <>
                      <span className="font-semibold text-sm tracking-tight">{option.label}</span>
                      {option.description && (
                        <span
                          className={`mt-0.5 text-xs ${
                            isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}
                        >
                          {option.description}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
