import type { JitterConfig, PresetId } from './types';

export type PresetDefinition = {
  id: PresetId;
  name: string;
  description: string;
  config: JitterConfig | null;
};

export const JITTER_PRESETS: PresetDefinition[] = [
  {
    id: 'auto',
    name: '自动',
    description: '自动探测并维持当前网络连接下的最低稳定延迟。',
    config: {
      minDepthMs: 25,
      comfortCapMs: 1000,
      peakDecayHalflifeMs: 0,
      resumeThresholdPct: 0.25,
    },
  },
  {
    id: 'wired',
    name: '有线模式',
    description: 'USB、ADB 或近乎完美的连接。固定 10ms 缓冲区。',
    config: {
      minDepthMs: 0,
      comfortCapMs: 10,
      peakDecayHalflifeMs: 1000,
      resumeThresholdPct: 0.5,
      staticTargetMs: 10,
    },
  },
  {
    id: 'fast',
    name: '极速',
    description: '优质 5 GHz Wi-Fi。固定 30ms 缓冲区 — 超低延迟。',
    config: {
      minDepthMs: 10,
      comfortCapMs: 30,
      peakDecayHalflifeMs: 1000,
      resumeThresholdPct: 0.5,
      staticTargetMs: 30,
    },
  },
  {
    id: 'balanced',
    name: '均衡',
    description: '适用于大多数 Wi-Fi 网络。固定 60ms 缓冲区 — 兼顾低延迟与稳定性。',
    config: {
      minDepthMs: 20,
      comfortCapMs: 60,
      peakDecayHalflifeMs: 1000,
      resumeThresholdPct: 0.5,
      staticTargetMs: 60,
    },
  },
  {
    id: 'stable',
    name: '稳定',
    description: '拥挤网络或 2.4 GHz Wi-Fi。固定 120ms 缓冲区 — 提供更大容错空间。',
    config: {
      minDepthMs: 40,
      comfortCapMs: 120,
      peakDecayHalflifeMs: 1000,
      resumeThresholdPct: 0.5,
      staticTargetMs: 120,
    },
  },
  {
    id: 'resilient',
    name: '高抗抖动',
    description: '较差的 Wi-Fi 或熄屏播放。固定 200ms 缓冲区 — 最大限度防断续。',
    config: {
      minDepthMs: 60,
      comfortCapMs: 200,
      peakDecayHalflifeMs: 1000,
      resumeThresholdPct: 0.5,
      staticTargetMs: 200,
    },
  },
  {
    id: 'custom',
    name: '自定义',
    description: '手动配置专属的缓冲参数。',
    config: null,
  },
  {
    id: 'nobuffer',
    name: '无缓冲',
    description: '音频到达即刻播放。零缓冲，零安全容错空间。',
    config: {
      minDepthMs: 0,
      comfortCapMs: 0,
      peakDecayHalflifeMs: 1000,
      resumeThresholdPct: 0,
      staticTargetMs: 0,
    },
  },
];

export function getPresetConfig(id: string, customConfig: JitterConfig): JitterConfig {
  if (id === 'custom' || id.startsWith('saved-')) return customConfig;
  const def = JITTER_PRESETS.find((p) => p.id === id);
  return def?.config ?? customConfig;
}
