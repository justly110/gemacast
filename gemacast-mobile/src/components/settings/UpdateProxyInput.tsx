import { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { SegmentedControl } from '../shared/SegmentedControl';
import { Globe, Check } from 'lucide-react';

type ProxyType = 'direct' | 'http' | 'socks5' | 'custom';

export function UpdateProxyInput() {
  const { settings, update } = useSettings();
  const rawProxy = settings.updateProxy ?? '';

  const getInitialType = (proxy: string): ProxyType => {
    const p = proxy.trim();
    if (!p) return 'direct';
    if (p === 'http://127.0.0.1:7890') return 'http';
    if (p === 'socks5://127.0.0.1:7890' || p === 'socks5h://127.0.0.1:7890') return 'socks5';
    return 'custom';
  };

  const [selectedType, setSelectedType] = useState<ProxyType>(() => getInitialType(rawProxy));
  const [customValue, setCustomValue] = useState(rawProxy);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelectedType(getInitialType(settings.updateProxy ?? ''));
    setCustomValue(settings.updateProxy ?? '');
  }, [settings.updateProxy]);

  const handleTypeChange = (type: ProxyType) => {
    setSelectedType(type);
    if (type === 'direct') {
      update({ updateProxy: '' });
      setCustomValue('');
    } else if (type === 'http') {
      const val = 'http://127.0.0.1:7890';
      update({ updateProxy: val });
      setCustomValue(val);
    } else if (type === 'socks5') {
      const val = 'socks5://127.0.0.1:7890';
      update({ updateProxy: val });
      setCustomValue(val);
    } else if (type === 'custom') {
      if (!customValue) {
        setCustomValue('http://192.168.1.');
      }
    }
  };

  const handleSaveCustom = () => {
    update({ updateProxy: customValue.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const options: { value: ProxyType; label: string }[] = [
    { value: 'direct', label: '直连' },
    { value: 'http', label: 'HTTP' },
    { value: 'socks5', label: 'SOCKS5' },
    { value: 'custom', label: '自定义' },
  ];

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/25 p-4 backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-muted-foreground">
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span>更新网络代理 (仅限更新)</span>
        </div>
        <span className="text-[0.65rem] font-medium text-muted-foreground/80 bg-background/60 px-2 py-0.5 rounded-full border border-border/60">
          {selectedType === 'direct'
            ? '直连'
            : selectedType === 'http'
            ? 'HTTP (7890)'
            : selectedType === 'socks5'
            ? 'SOCKS5 (7890)'
            : '自定义'}
        </span>
      </div>

      <p className="text-[0.7rem] text-muted-foreground leading-relaxed">
        仅在检查更新和下载安装包时生效，不影响音频传输。内置代理默认地址为 127.0.0.1:7890。
      </p>

      <SegmentedControl<ProxyType>
        name="update-proxy-type"
        options={options}
        value={selectedType}
        onChange={handleTypeChange}
      />

      {selectedType !== 'direct' && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
            <span>当前代理地址：</span>
            {selectedType !== 'custom' && (
              <span className="text-[0.65rem] text-primary">内置默认值</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customValue}
              onChange={(e) => {
                setCustomValue(e.target.value);
                if (selectedType !== 'custom') {
                  setSelectedType('custom');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveCustom();
              }}
              placeholder="http://127.0.0.1:7890 或 socks5://..."
              className="flex-1 rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-md"
            />
            <button
              type="button"
              onClick={handleSaveCustom}
              className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-all duration-150 hover:opacity-90 active:scale-95 shrink-0"
              title="保存代理地址"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{saved ? '已保存' : '保存'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
