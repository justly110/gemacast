import { describe, it, expect, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { BottomNav } from './BottomNav';

beforeEach(() => {
  cleanup();
});

describe('BottomNav', () => {
  it('renders 首页 and 设置 tabs', () => {
    render(<BottomNav activeTab="home" onTabChange={() => {}} />);
    expect(screen.getByRole('tab', { name: '首页' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: '设置' })).toBeTruthy();
  });

  it('indicates active tab via aria-selected', () => {
    const { rerender } = render(<BottomNav activeTab="home" onTabChange={() => {}} />);
    expect(screen.getByRole('tab', { name: '首页' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: '设置' }).getAttribute('aria-selected')).toBe('false');

    rerender(<BottomNav activeTab="settings" onTabChange={() => {}} />);
    expect(screen.getByRole('tab', { name: '首页' }).getAttribute('aria-selected')).toBe('false');
    expect(screen.getByRole('tab', { name: '设置' }).getAttribute('aria-selected')).toBe('true');
  });

  it('calls onTabChange when clicking tabs', () => {
    let selected: string = '';
    render(<BottomNav activeTab="home" onTabChange={(t) => (selected = t)} />);

    fireEvent.click(screen.getByRole('tab', { name: '设置' }));
    expect(selected).toBe('settings');

    fireEvent.click(screen.getByRole('tab', { name: '首页' }));
    expect(selected).toBe('home');
  });
});
