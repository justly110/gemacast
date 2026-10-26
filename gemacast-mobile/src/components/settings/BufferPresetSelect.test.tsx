import { describe, it, expect, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { BufferPresetSelect } from './BufferPresetSelect';
import { useAppStore } from '../../stores/app-store';

const defaultSettings = {
  bufferPreset: 'auto',
  customJitterConfig: {
    minDepthMs: 25,
    comfortCapMs: 1000,
    peakDecayHalflifeMs: 0,
    resumeThresholdPct: 0.25,
    staticTargetMs: 60,
  },
  savedPresets: [
    {
      name: 'My Preset',
      config: {
        minDepthMs: 25,
        comfortCapMs: 1000,
        peakDecayHalflifeMs: 0,
        resumeThresholdPct: 0.25,
        staticTargetMs: 50,
      },
    },
  ],
};

beforeEach(() => {
  cleanup();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useAppStore.getState().updateSettings(defaultSettings as any);
});

describe('BufferPresetSelect', () => {
  it('renders correctly with current preset', () => {
    render(<BufferPresetSelect />);
    expect(screen.getByText('自动')).toBeTruthy();
  });

  it('renders all presets including saved ones when opened', () => {
    render(<BufferPresetSelect />);
    const trigger = screen.getAllByRole('button')[0];
    fireEvent.click(trigger);

    // Built-in presets
    expect(screen.getByText('有线模式')).toBeTruthy();
    expect(screen.getByText('自定义')).toBeTruthy();
    // Saved preset
    expect(screen.getByText('My Preset')).toBeTruthy();
  });

  it('updates bufferPreset for built-in preset', () => {
    render(<BufferPresetSelect />);
    const trigger = screen.getAllByRole('button')[0];
    fireEvent.click(trigger);

    fireEvent.click(screen.getByText('有线模式'));

    expect(useAppStore.getState().settings.bufferPreset).toBe('wired');
  });

  it('updates customJitterConfig from auto when custom is selected', () => {
    render(<BufferPresetSelect />);
    const trigger = screen.getAllByRole('button')[0];
    fireEvent.click(trigger);

    fireEvent.click(screen.getByText('自定义'));

    expect(useAppStore.getState().settings.bufferPreset).toBe('custom');
  });

  it('updates from saved preset', () => {
    render(<BufferPresetSelect />);
    const trigger = screen.getAllByRole('button')[0];
    fireEvent.click(trigger);

    fireEvent.click(screen.getByText('My Preset'));

    expect(useAppStore.getState().settings.bufferPreset).toBe('saved-0');
    expect(useAppStore.getState().settings.customJitterConfig).toMatchObject({
      staticTargetMs: 50,
    });
  });
});
