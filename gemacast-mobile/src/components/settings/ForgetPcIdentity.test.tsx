import { beforeEach, describe, expect, it } from 'bun:test';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  invokeCalls,
  makeDeviceInfo,
  makeDiscoveredStreamer,
  setupInvokeMock,
} from '../../__tests__/setup';
import { Status } from '../../core/types';
import { loadPcNames, rememberPcName } from '../../core/persistence';
import { useAppStore } from '../../stores/app-store';
import { ForgetPcIdentity } from './ForgetPcIdentity';

beforeEach(() => {
  cleanup();
  setupInvokeMock();
  useAppStore.getState().init(makeDeviceInfo());
});

describe('ForgetPcIdentity', () => {
  it('shows only PCs present in the native trust store', async () => {
    setupInvokeMock({ get_paired_pc_ids: ['pc-2', 'missing-name'] });
    useAppStore
      .getState()
      .setDiscoveredStreamers([
        makeDiscoveredStreamer({ deviceId: 'pc-1', deviceName: 'Desktop PC' }),
        makeDiscoveredStreamer({ deviceId: 'pc-2', deviceName: 'Laptop' }),
      ]);
    render(<ForgetPcIdentity />);

    expect(await screen.findByLabelText('清除 Laptop 的配对')).toBeTruthy();
    expect(screen.getByLabelText('清除 missing-name 的配对')).toBeTruthy();
    expect(screen.queryByLabelText('清除 Desktop PC 的配对')).toBeNull();
  });

  it('wraps long PC names inside a vertically bounded list', async () => {
    const longName = `Living room ${'streaming-pc-'.repeat(20)}`;
    setupInvokeMock({ get_paired_pc_ids: ['pc-long'] });
    useAppStore
      .getState()
      .setDiscoveredStreamers([
        makeDiscoveredStreamer({ deviceId: 'pc-long', deviceName: longName }),
      ]);
    render(<ForgetPcIdentity />);

    const name = await screen.findByText(longName);
    expect(name.className).toContain('overflow-wrap:anywhere');
    expect(name.className).not.toContain('truncate');

    const list = screen.getByRole('list', { name: '已配对电脑' });
    expect(list.className).toContain('max-h-44');
    expect(list.className).toContain('overflow-y-auto');
  });

  it('refreshes the native trust store after a PC connects', async () => {
    let pairedPcIds: string[] = [];
    setupInvokeMock({ get_paired_pc_ids: () => pairedPcIds });
    const streamer = makeDiscoveredStreamer({ deviceId: 'pc-2', deviceName: 'Laptop' });
    useAppStore.getState().setDiscoveredStreamers([streamer]);
    render(<ForgetPcIdentity />);

    expect(await screen.findByText('暂无已配对电脑')).toBeTruthy();
    pairedPcIds = ['pc-2'];
    useAppStore.getState().setConnectedStreamer(streamer);

    expect(await screen.findByLabelText('清除 Laptop 的配对')).toBeTruthy();
  });

  it('removes only the selected PC after native removal succeeds', async () => {
    setupInvokeMock({ get_paired_pc_ids: ['pc-1', 'pc-2'] });
    useAppStore
      .getState()
      .setDiscoveredStreamers([
        makeDiscoveredStreamer({ deviceId: 'pc-1', deviceName: 'Desktop PC' }),
        makeDiscoveredStreamer({ deviceId: 'pc-2', deviceName: 'Laptop' }),
      ]);
    render(<ForgetPcIdentity />);

    await screen.findByLabelText('清除 Laptop 的配对');
    fireEvent.click(screen.getByLabelText('清除 Laptop 的配对'));
    fireEvent.click(screen.getByRole('button', { name: '清除配对', hidden: true }));

    await waitFor(() =>
      expect(invokeCalls).toContainEqual({ cmd: 'forget_pc_identity', args: { pcId: 'pc-2' } }),
    );
    await waitFor(() => expect(screen.queryByLabelText('清除 Laptop 的配对')).toBeNull());
    expect(screen.getByLabelText('清除 Desktop PC 的配对')).toBeTruthy();
    expect(invokeCalls).toContainEqual({ cmd: 'forget_pc_identity', args: { pcId: 'pc-2' } });
    expect(invokeCalls.some((call) => call.cmd === 'disconnect_from_streamer')).toBe(false);
  });

  it('disconnects the stream before forgetting the connected PC', async () => {
    setupInvokeMock({ get_paired_pc_ids: ['pc-2'] });
    const streamer = makeDiscoveredStreamer({ deviceId: 'pc-2', deviceName: 'Laptop' });
    useAppStore.getState().patch({
      connectedStreamer: streamer,
      lastConnectedStreamer: streamer,
      discoveredStreamers: [streamer],
      status: Status.Playing,
    });
    render(<ForgetPcIdentity />);

    await screen.findByLabelText('清除 Laptop 的配对');
    fireEvent.click(screen.getByLabelText('清除 Laptop 的配对'));
    expect(screen.getByText('断开并清除 Laptop 的配对凭证？')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '清除配对', hidden: true }));

    await waitFor(() =>
      expect(invokeCalls).toContainEqual({ cmd: 'forget_pc_identity', args: { pcId: 'pc-2' } }),
    );
    const disconnectIndex = invokeCalls.findIndex(
      (call) => call.cmd === 'disconnect_from_streamer',
    );
    const forgetIndex = invokeCalls.findIndex((call) => call.cmd === 'forget_pc_identity');
    expect(disconnectIndex).toBeGreaterThan(-1);
    expect(disconnectIndex).toBeLessThan(forgetIndex);
    expect(useAppStore.getState().connectedStreamer).toBeNull();
    expect(useAppStore.getState().lastConnectedStreamer).toBeNull();
    expect(useAppStore.getState().status).toBe(Status.Listening);
    await waitFor(() => expect(screen.queryByLabelText('清除 Laptop 的配对')).toBeNull());
  });

  it('keeps the PC when native removal fails', async () => {
    setupInvokeMock({
      get_paired_pc_ids: ['pc-2'],
      forget_pc_identity: () => {
        throw new Error('remove failed');
      },
    });
    useAppStore
      .getState()
      .setDiscoveredStreamers([makeDiscoveredStreamer({ deviceId: 'pc-2', deviceName: 'Laptop' })]);
    render(<ForgetPcIdentity />);

    await screen.findByLabelText('清除 Laptop 的配对');
    fireEvent.click(screen.getByLabelText('清除 Laptop 的配对'));
    fireEvent.click(screen.getByRole('button', { name: '清除配对', hidden: true }));

    await waitFor(() =>
      expect(invokeCalls).toContainEqual({
        cmd: 'forget_pc_identity',
        args: { pcId: 'pc-2' },
      }),
    );
    expect(screen.getByLabelText('清除 Laptop 的配对')).toBeTruthy();
  });

  describe('name resolution when the PC is not live', () => {
    const PC_ID = 'PC_194bf7dbba0d04b999197dc6a6a9433fe22599b9417590b490c57b9845c603e3';

    it('shows the remembered name with no live streamer at all', async () => {
      rememberPcName(PC_ID, 'DESKTOP-KJCRNVV');
      setupInvokeMock({ get_paired_pc_ids: [PC_ID] });
      useAppStore.getState().patch({
        discoveredStreamers: [],
        connectedStreamer: null,
        lastConnectedStreamer: null,
      });
      render(<ForgetPcIdentity />);

      expect(await screen.findByText('DESKTOP-KJCRNVV')).toBeTruthy();
      expect(screen.queryByText(PC_ID)).toBeNull();
    });

    it('still falls back to the id when no name was ever recorded', async () => {
      setupInvokeMock({ get_paired_pc_ids: [PC_ID] });
      render(<ForgetPcIdentity />);

      expect(await screen.findByText(PC_ID)).toBeTruthy();
    });

    it('prefers a live streamer name over a stale cached one', async () => {
      rememberPcName(PC_ID, 'OLD-NAME');
      setupInvokeMock({ get_paired_pc_ids: [PC_ID] });
      useAppStore
        .getState()
        .setDiscoveredStreamers([
          makeDiscoveredStreamer({ deviceId: PC_ID, deviceName: 'RENAMED-PC' }),
        ]);
      render(<ForgetPcIdentity />);

      expect(await screen.findByText('RENAMED-PC')).toBeTruthy();
      expect(screen.queryByText('OLD-NAME')).toBeNull();
    });

    it('drops the cached name when the PC is forgotten', async () => {
      rememberPcName(PC_ID, 'DESKTOP-KJCRNVV');
      setupInvokeMock({ get_paired_pc_ids: [PC_ID] });
      render(<ForgetPcIdentity />);

      await screen.findByLabelText('清除 DESKTOP-KJCRNVV 的配对');
      fireEvent.click(screen.getByLabelText('清除 DESKTOP-KJCRNVV 的配对'));
      fireEvent.click(screen.getByRole('button', { name: '清除配对', hidden: true }));

      await waitFor(() => expect(loadPcNames()[PC_ID]).toBeUndefined());
    });

    it('records the name from a discovery packet, so it survives losing the link', async () => {
      useAppStore
        .getState()
        .updateDiscoveredStreamer(
          makeDiscoveredStreamer({ deviceId: PC_ID, deviceName: 'DESKTOP-KJCRNVV' }),
        );
      expect(loadPcNames()[PC_ID]).toBe('DESKTOP-KJCRNVV');

      setupInvokeMock({ get_paired_pc_ids: [PC_ID] });
      useAppStore.getState().patch({ discoveredStreamers: [], lastConnectedStreamer: null });
      render(<ForgetPcIdentity />);

      expect(await screen.findByText('DESKTOP-KJCRNVV')).toBeTruthy();
    });
  });
});
