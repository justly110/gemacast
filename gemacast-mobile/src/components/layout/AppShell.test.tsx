import { describe, it, expect, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { useAppStore } from '../../stores/app-store';
import { __resetModalHistoryForTest } from '../../core/modal-history';
import { AppShell } from './AppShell';

beforeEach(() => {
  cleanup();
  // Modal entries outlive a test file's render trees, and a stale count would
  // make the router treat this test's popstate as a dialog's.
  __resetModalHistoryForTest();
  window.location.hash = '';
  useAppStore.getState().init({
    deviceId: 'test',
    deviceName: 'Test Device',
    ip: '127.0.0.1',
  });
});

describe('AppShell tabs', () => {
  it('renders home view visible by default and settings view hidden', () => {
    render(<AppShell />);

    const homeView = screen.getByRole('main');
    const settingsView = screen.getByTestId('settings-view').parentElement!;

    expect(homeView.classList.contains('flex')).toBe(true);
    expect(homeView.classList.contains('hidden')).toBe(false);

    expect(settingsView.classList.contains('hidden')).toBe(true);
    expect(settingsView.classList.contains('flex')).toBe(false);
  });

  it('switches to settings view when clicking settings tab', () => {
    render(<AppShell />);

    fireEvent.click(screen.getByRole('tab', { name: '设置' }));

    const homeView = screen.getByRole('main');
    const settingsView = screen.getByTestId('settings-view').parentElement!;

    expect(homeView.classList.contains('hidden')).toBe(true);
    expect(homeView.classList.contains('flex')).toBe(false);
    expect(settingsView.classList.contains('flex')).toBe(true);
    expect(settingsView.classList.contains('hidden')).toBe(false);
  });

  it('switches back to home view when clicking home tab', () => {
    render(<AppShell />);

    fireEvent.click(screen.getByRole('tab', { name: '设置' }));
    fireEvent.click(screen.getByRole('tab', { name: '首页' }));

    const homeView = screen.getByRole('main');
    const settingsView = screen.getByTestId('settings-view').parentElement!;

    expect(homeView.classList.contains('flex')).toBe(true);
    expect(homeView.classList.contains('hidden')).toBe(false);
    expect(settingsView.classList.contains('hidden')).toBe(true);
    expect(settingsView.classList.contains('flex')).toBe(false);
  });

  it('updates active tab when popstate event fires with hash change', () => {
    render(<AppShell />);

    fireEvent.click(screen.getByRole('tab', { name: '设置' }));
    expect(window.location.hash).toBe('#settings');

    act(() => {
      window.location.hash = '#root';
      window.dispatchEvent(new Event('popstate'));
    });

    const homeView = screen.getByRole('main');
    const settingsView = screen.getByTestId('settings-view').parentElement!;

    expect(homeView.classList.contains('flex')).toBe(true);
    expect(homeView.classList.contains('hidden')).toBe(false);
    expect(settingsView.classList.contains('hidden')).toBe(true);
  });

  it('keeps settings view active when back navigation comes from #settings+help to #settings', () => {
    render(<AppShell />);

    fireEvent.click(screen.getByRole('tab', { name: '设置' }));
    expect(window.location.hash).toBe('#settings');

    act(() => {
      window.location.hash = '#settings+help';
      window.dispatchEvent(new Event('popstate'));
    });

    const settingsView = screen.getByTestId('settings-view').parentElement!;
    expect(settingsView.classList.contains('flex')).toBe(true);
    expect(settingsView.classList.contains('hidden')).toBe(false);

    act(() => {
      window.location.hash = '#settings';
      window.dispatchEvent(new Event('popstate'));
    });

    expect(settingsView.classList.contains('flex')).toBe(true);
    expect(settingsView.classList.contains('hidden')).toBe(false);
  });
});
