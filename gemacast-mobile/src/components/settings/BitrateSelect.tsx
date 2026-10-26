import { useState } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { CustomSelect, type SelectOption } from '../shared/CustomSelect';
import type { BitratePreset } from '../../core/types';

const BITRATE_OPTIONS: SelectOption<BitratePreset>[] = [
  { value: '10', label: '10 Kbps', description: '语音通话音质' },
  { value: '24', label: '24 Kbps', description: '低音质' },
  { value: '32', label: '32 Kbps', description: '调频广播音质' },
  { value: '64', label: '64 Kbps', description: '标准音质' },
  { value: '96', label: '96 Kbps', description: '良好音质' },
  { value: '128', label: '128 Kbps — 高 (默认)', description: '推荐绝大多数场景使用' },
  { value: '256', label: '256 Kbps', description: '极高音质' },
  { value: '450', label: '450 Kbps', description: '接近无损 (近透明)' },
  { value: '512', label: '512 Kbps', description: 'Opus 最高音质' },
  {
    value: 'raw',
    label: '未压缩 PCM',
    description: '零编解码延迟 — 占用极高网络带宽',
  },
  { value: 'custom', label: '自定义码率', description: '手动指定码率数值' },
];

export function BitrateSelect() {
  const { settings, update } = useSettings();
  const [customKbps, setCustomKbps] = useState(String(settings.customBitrateKbps));

  const handleSelect = (value: BitratePreset) => {
    update({ bitratePreset: value });
  };

  const applyCustom = () => {
    const val = Number(customKbps);
    if (Number.isInteger(val) && val >= 6 && val <= 512) {
      update({ customBitrateKbps: val, bitratePreset: 'custom' });
    }
  };

  const options = BITRATE_OPTIONS.map((opt) => {
    if (opt.value === 'custom' && settings.bitratePreset === 'custom') {
      return {
        ...opt,
        label: `自定义 - ${settings.customBitrateKbps} Kbps`,
      };
    }
    return opt;
  });

  return (
    <div>
      <CustomSelect
        id="setting-bitrate"
        options={options}
        value={settings.bitratePreset}
        onChange={handleSelect}
      />

      {settings.bitratePreset === 'custom' && (
        <div className="mt-2.5 flex items-center gap-2 rounded-2xl border border-border/70 bg-background/50 p-2 backdrop-blur-md animate-[fade-in_200ms_ease-out]">
          <input
            type="number"
            value={customKbps}
            onChange={(e) => setCustomKbps(e.target.value)}
            placeholder="128"
            min={6}
            max={512}
            className="flex-1 rounded-xl border border-border/70 bg-background/60 px-3 py-1.5 text-sm font-mono text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
          <span className="text-xs font-semibold text-muted-foreground">Kbps</span>
          <button
            type="button"
            className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={applyCustom}
            disabled={
              !customKbps ||
              !Number.isInteger(Number(customKbps)) ||
              Number(customKbps) < 6 ||
              Number(customKbps) > 512
            }
          >
            应用
          </button>
        </div>
      )}
    </div>
  );
}
