import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { useAppStore } from '../../stores/app-store';
import { Status } from '../../core/types';
import { ConnectionReadout } from './ConnectionReadout';

beforeEach(() => {
  cleanup();
  HTMLDialogElement.prototype.showModal = mock();
  HTMLDialogElement.prototype.close = mock();
  useAppStore.getState().init({
    deviceId: 'test',
    deviceName: 'Test',
    ip: '127.0.0.1',
  });
});

describe('ConnectionReadout', () => {
  it.each([
    ['Idle', Status.Idle],
    ['Listening', Status.Listening],
    ['Connecting', Status.Connecting],
  ])('renders nothing when %s', (_name, status) => {
    useAppStore.getState().setStatus(status);
    const { container } = render(<ConnectionReadout />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the card with status and metrics when Connected', () => {
    useAppStore.getState().setStatus(Status.Connected);
    useAppStore.getState().updateMetrics({ bufferMs: 20, networkRttMs: 9, jitterMs: 4 });
    render(<ConnectionReadout />);
    expect(screen.getByText('已连接')).toBeTruthy();
    expect(screen.getByText('20')).toBeTruthy();
  });

  it('keeps the card up while Reconnecting so the stall is explained', () => {
    useAppStore.getState().patch({ status: Status.Reconnecting, reconnectAttempts: 2 });
    render(<ConnectionReadout />);
    expect(screen.getByText('重连中 (2/5)…')).toBeTruthy();
    expect(screen.queryByLabelText('连接指标')).toBeNull();
  });

  it('joins status and link with a separator only when a link is known', () => {
    useAppStore.getState().setStatus(Status.Connected);
    const { container: withoutLink } = render(<ConnectionReadout />);
    expect(withoutLink.textContent).not.toContain('•');

    cleanup();
    useAppStore.getState().setNetworkLinkPair({
      phone: 'wifi5Ghz',
      pc: 'wifi5Ghz',
      effective: 'wifi5Ghz',
      effectiveLabel: '5 GHz',
    });
    const { container: withLink } = render(<ConnectionReadout />);
    expect(withLink.textContent).toContain('•');
    expect(screen.getByText('5 GHz 极速')).toBeTruthy();
  });

  it.each([
    [
      'a hotspot pair',
      {
        pair: { phone: 'wifiUnknown', pc: 'wifi5Ghz', effective: 'wifi5Ghz' },
        shown: '5 GHz 极速',
        absent: '未知网络',
        title: '手机端 Wi-Fi，电脑端 5 GHz 极速 — 缓冲针对 5 GHz 极速 优化',
      },
    ],
    [
      'a real band split',
      {
        pair: { phone: 'wifi2_4Ghz', pc: 'wifi5Ghz', effective: 'wifi2_4Ghz' },
        shown: '2.4 GHz',
        absent: '5 GHz 极速',
        title: '手机端 2.4 GHz，电脑端 5 GHz 极速 — 缓冲针对 2.4 GHz 优化',
      },
    ],
    [
      'a pair whose effective side is neither',
      {
        pair: { phone: 'unknown', pc: 'ethernet', effective: 'wifiUnknown' },
        shown: 'Wi-Fi',
        absent: '以太网',
        title: '手机端 未知网络，电脑端 以太网 — 缓冲针对 Wi-Fi 优化',
      },
    ],
  ] as const)('shows only the effective link for %s', (_name, { pair, shown, absent, title }) => {
    useAppStore.getState().setStatus(Status.Connected);
    useAppStore.getState().setNetworkLinkPair({ ...pair, effectiveLabel: shown });
    const { container } = render(<ConnectionReadout />);

    expect(screen.getByText(shown)).toBeTruthy();
    expect(container.textContent).not.toContain(absent);
    expect(container.querySelector('#network-link-badge')?.getAttribute('title')).toBe(title);
  });

  it('explains the metrics on demand, since nothing on the row says what they are', () => {
    useAppStore.getState().setStatus(Status.Connected);
    render(<ConnectionReadout />);

    expect(screen.queryByText('连接指标 (Connection Metrics)')).toBeNull();

    fireEvent.click(screen.getByLabelText('帮助'));
    expect(screen.getByText('连接指标 (Connection Metrics)')).toBeTruthy();
    expect(screen.getByText(/在 ADB 模式下显示为 n\/a/)).toBeTruthy();
  });

  it('withdraws the help button along with the metrics it explains', () => {
    useAppStore.getState().patch({ status: Status.Reconnecting, reconnectAttempts: 1 });
    render(<ConnectionReadout />);
    expect(screen.queryByLabelText('连接指标')).toBeNull();
    expect(screen.queryByLabelText('帮助')).toBeNull();
  });
});
