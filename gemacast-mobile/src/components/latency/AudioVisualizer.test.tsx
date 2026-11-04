import { describe, it, expect, beforeEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { useAppStore } from '../../stores/app-store';
import { Status } from '../../core/types';
import { AudioVisualizer } from './AudioVisualizer';

beforeEach(() => {
  cleanup();
});

describe('AudioVisualizer', () => {
  it('renders nothing when Idle or Listening', () => {
    useAppStore.getState().setStatus(Status.Idle);
    const { container: idleContainer } = render(<AudioVisualizer />);
    expect(idleContainer.innerHTML).toBe('');

    useAppStore.getState().setStatus(Status.Listening);
    const { container: listeningContainer } = render(<AudioVisualizer />);
    expect(listeningContainer.innerHTML).toBe('');
  });

  it('renders animated visualizer bars when Playing', () => {
    useAppStore.getState().setStatus(Status.Playing);
    render(<AudioVisualizer />);
    expect(screen.getByLabelText('音频波形跳动中')).toBeTruthy();
  });

  it('renders static visualizer bars when Connected or Paused', () => {
    useAppStore.getState().setStatus(Status.Connected);
    render(<AudioVisualizer />);
    expect(screen.getByLabelText('音频静止')).toBeTruthy();

    cleanup();
    useAppStore.getState().setStatus(Status.Paused);
    render(<AudioVisualizer />);
    expect(screen.getByLabelText('音频静止')).toBeTruthy();
  });
});
