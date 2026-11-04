import { describe, it, expect, mock } from 'bun:test';
import { triggerHaptic } from './haptics';

describe('triggerHaptic', () => {
  it('calls navigator.vibrate with duration when supported', () => {
    const vibrateMock = mock();
    (navigator as unknown as { vibrate: typeof vibrateMock }).vibrate = vibrateMock;

    triggerHaptic('light');
    expect(vibrateMock).toHaveBeenCalledWith(10);

    triggerHaptic('medium');
    expect(vibrateMock).toHaveBeenCalledWith(20);

    triggerHaptic('success');
    expect(vibrateMock).toHaveBeenCalledWith([10, 30, 15]);
  });

  it('safely handles missing or throwing vibrate without unhandled exceptions', () => {
    (navigator as unknown as { vibrate: () => never }).vibrate = () => {
      throw new Error('NotAllowedError');
    };

    expect(() => triggerHaptic('light')).not.toThrow();
  });
});
