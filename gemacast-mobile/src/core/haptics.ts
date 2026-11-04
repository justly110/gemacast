/**
 * Lightweight haptic vibration feedback for mobile devices.
 * Uses navigator.vibrate when available; safely no-ops on desktop / unsupported environments.
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' = 'light'): void {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      if (type === 'light') {
        navigator.vibrate(10);
      } else if (type === 'medium') {
        navigator.vibrate(20);
      } else if (type === 'success') {
        navigator.vibrate([10, 30, 15]);
      }
    } catch {
      // Ignore vibration errors if unsupported or denied
    }
  }
}
