import { describe, it, expect, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { useAppStore } from '../../stores/app-store';
import { StreamerCard } from './StreamerCard';

const makeStreamer = (
  overrides: Partial<{ deviceId: string; deviceName: string; addr: string }> = {},
) => ({
  deviceId: 'pc-1',
  deviceName: 'Desktop PC',
  addr: '192.168.1.10:9000',
  isOffline: false,
  ...overrides,
});

const noop = () => {};

const defaultProps = () => ({
  streamer: makeStreamer(),
  isConnected: false,
  isConnecting: false,
  isPlaying: false,
  isLoading: false,
  isDisabled: false,
  audioSources: [],
  processList: [],
  currentSource: { type: 'desktop' as const },
  streamerCapabilities: null,
  onToggle: noop,
  onPlayPause: noop,
  onSourceChange: noop,
});

beforeEach(() => {
  cleanup();
  useAppStore.getState().init({
    deviceId: 'test',
    deviceName: 'Test',
    ip: '127.0.0.1',
  });
});

describe('StreamerCard', () => {
  it('renders streamer name and IP', () => {
    render(<StreamerCard {...defaultProps()} />);
    expect(screen.getByText('Desktop PC')).toBeTruthy();
    expect(screen.getByText('192.168.1.10')).toBeTruthy();
  });

  it('shows Connect when not connected', () => {
    render(<StreamerCard {...defaultProps()} />);
    expect(screen.getByText('连接')).toBeTruthy();
  });

  it('shows Disconnect when connected', () => {
    render(<StreamerCard {...defaultProps()} isConnected />);
    expect(screen.getByText('断开')).toBeTruthy();
  });

  it('shows spinner when loading and connected', () => {
    render(<StreamerCard {...defaultProps()} isConnected isLoading />);
    const btn = screen.getByRole('button', { name: /断开/i });
    expect(btn.querySelector('span:first-child')?.className).toContain('opacity-0');
  });

  it('shows ADB icon for localhost streamers', () => {
    const streamer = makeStreamer({ addr: '127.0.0.1:9000' });
    render(<StreamerCard {...defaultProps()} streamer={streamer} />);
    expect(screen.getByText('ADB (USB 调试)')).toBeTruthy();
  });

  it('disables button when isDisabled', () => {
    render(<StreamerCard {...defaultProps()} isDisabled />);
    const btn = screen.getByRole('button', { name: /连接至/i });
    expect(btn.hasAttribute('disabled')).toBe(true);
  });

  it('shows ProcessSelect when connected with audio sources', () => {
    const streamer = makeStreamer();
    render(
      <StreamerCard
        {...defaultProps()}
        streamer={streamer}
        isConnected
        audioSources={[{ type: 'desktop' }]}
      />,
    );
    expect(screen.getByText('Desktop Audio')).toBeTruthy();
  });

  it('does not show play/pause button when not connected', () => {
    render(<StreamerCard {...defaultProps()} />);
    expect(screen.queryByRole('button', { name: /暂停/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /继续/i })).toBeNull();
  });

  it('shows Pause button when connected and playing', () => {
    render(<StreamerCard {...defaultProps()} isConnected isPlaying />);
    const btn = screen.getByRole('button', { name: /暂停/i });
    expect(btn).toBeTruthy();
  });

  it('shows Play button when connected and paused', () => {
    render(<StreamerCard {...defaultProps()} isConnected isPlaying={false} />);
    const btn = screen.getByRole('button', { name: /继续/i });
    expect(btn).toBeTruthy();
  });

  it('calls onPlayPause when play/pause button is clicked', () => {
    let called = false;
    const onPlayPause = () => {
      called = true;
    };
    render(<StreamerCard {...defaultProps()} isConnected isPlaying onPlayPause={onPlayPause} />);
    const btn = screen.getByRole('button', { name: /暂停/i });
    fireEvent.click(btn);
    expect(called).toBe(true);
  });
});
