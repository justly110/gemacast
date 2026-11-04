import { describe, it, expect, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { useAppStore } from '../../stores/app-store';
import { AppShell } from './AppShell';

beforeEach(() => {
  cleanup();
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
});
