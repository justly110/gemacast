import { useSettings } from '../../hooks/use-settings';
import { Sun, Moon } from 'lucide-react';
import { triggerHaptic } from '../../core/haptics';

export function applyTheme(theme: 'light' | 'dark' | 'system') {
  const isDark =
    theme === 'system'
      ? typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.classList.toggle('light', !isDark);
}

export function ThemeToggle() {
  const { settings, update } = useSettings();
  const isDark =
    settings.theme === 'system'
      ? typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      : settings.theme === 'dark';

  const toggle = () => {
    triggerHaptic('light');
    const next = isDark ? 'light' : 'dark';
    update({ theme: next });
    applyTheme(next);
  };

  return (
    <button
      type="button"
      className={`
        relative flex h-9 w-9 items-center justify-center rounded-full
        transition-all duration-300 ease-out
        hover:bg-accent active:scale-90
      `}
      onClick={toggle}
      aria-label="切换主题"
    >
      {/* Sun icon */}
      <Sun
        className={`
          absolute h-4.5 w-4.5 text-accent-yellow
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
        `}
        strokeWidth={2}
      />
      {/* Moon icon */}
      <Moon
        className={`
          absolute h-4.5 w-4.5 text-accent-blue
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
        `}
        strokeWidth={2}
      />
    </button>
  );
}
