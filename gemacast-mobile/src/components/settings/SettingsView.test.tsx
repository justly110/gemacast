import { describe, it, expect, beforeEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { useAppStore } from '../../stores/app-store';
import { SettingsView } from './SettingsView';

beforeEach(() => {
  cleanup();
  useAppStore.getState().init({
    deviceId: 'test',
    deviceName: 'Test',
    ip: '127.0.0.1',
  });
});

describe('SettingsView', () => {
  it('renders header with title', () => {
    render(<SettingsView />);
    expect(screen.getByText('系统设置')).toBeTruthy();
  });

  it('renders Buffer Preset label', () => {
    render(<SettingsView />);
    expect(screen.getAllByText('缓冲预设').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Audio Bitrate label', () => {
    render(<SettingsView />);
    expect(screen.getAllByText('音频码率质量').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Mode label', () => {
    render(<SettingsView />);
    expect(screen.getAllByText('连接模式').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Match Volume With PC label', () => {
    render(<SettingsView />);
    expect(screen.getAllByText('与电脑音量同步').length).toBeGreaterThanOrEqual(1);
  });

  it('explains an unreported volume level while the PC cannot sync it', () => {
    render(<SettingsView />);
    expect(screen.getAllByText('当前电脑未上报音量').length).toBeGreaterThanOrEqual(1);
  });

  it('drops the hint once the PC reports volume sync support', () => {
    useAppStore.getState().setStreamerCapabilities({
      supportsProcessCapture: false,
      supportsVolumeSync: true,
    });
    render(<SettingsView />);
    expect(screen.queryByText('当前电脑未上报音量')).toBeNull();
  });
});
