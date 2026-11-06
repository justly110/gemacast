export type ThemeMode = 'light' | 'dark' | 'system';

export function resolveIsDark(theme: ThemeMode): boolean {
  if (theme === 'system') {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }
  return theme === 'dark';
}

export function applyTheme(theme: ThemeMode) {
  const isDark = resolveIsDark(theme);
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.classList.toggle('light', !isDark);
}
