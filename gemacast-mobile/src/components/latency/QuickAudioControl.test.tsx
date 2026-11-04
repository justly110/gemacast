import { describe, it, expect, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { useAppStore } from '../../stores/app-store';
import { QuickAudioControl } from './QuickAudioControl';

beforeEach(() => {
  cleanup();
  useAppStore.getState().init({
    deviceId: 'test',
    deviceName: 'Test Device',
    ip: '127.0.0.1',
  });
  useAppStore.getState().updateSettings({ gainDb: 0 });
});

describe('QuickAudioControl', () => {
  it('renders quick volume slider and reset button', () => {
    render(<QuickAudioControl />);
    expect(screen.getByLabelText('输出音量增益滑块')).toBeTruthy();
    expect(screen.getByText('增益: ±0.0 dB')).toBeTruthy();
  });

  it('toggles mute to -24dB and back', () => {
    render(<QuickAudioControl />);
    const muteBtn = screen.getByLabelText('快速静音');
    fireEvent.click(muteBtn);

    expect(screen.getByText('已静音')).toBeTruthy();
    expect(screen.getByLabelText('取消静音')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('取消静音'));
    expect(screen.getByText('增益: ±0.0 dB')).toBeTruthy();
  });

  it('resets gain to 0dB on reset button click', () => {
    useAppStore.getState().updateSettings({ gainDb: 3.5 });
    render(<QuickAudioControl />);

    expect(screen.getByText('增益: +3.5 dB')).toBeTruthy();
    const resetBtn = screen.getByLabelText('重置增益为 0dB');
    fireEvent.click(resetBtn);

    expect(screen.getByText('增益: ±0.0 dB')).toBeTruthy();
  });
});
