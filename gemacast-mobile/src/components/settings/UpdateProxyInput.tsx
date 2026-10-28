import { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { Globe, Check, RotateCcw } from 'lucide-react';

export function UpdateProxyInput() {
  const { settings, update } = useSettings();
  const [value, setValue] = useState(settings.updateProxy ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(settings.updateProxy ?? '');
  }, [settings.updateProxy]);

  const handleSave = () => {
    update({ updateProxy: value.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setValue('');
    update({ updateProxy: '' });
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/25 p-4 backdrop-blur-md space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-muted-foreground">
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span>更新网络代理 (仅用于更新)</span>
        </div>
        {settings.updateProxy ? (
          <span className="text-[0.65rem] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            已启用
          </span>
        ) : (
          <span className="text-[0.65rem] font-medium text-muted-foreground/70 bg-muted/50 px-2 py-0.5 rounded-full">
            直连
          </span>
        )}
      </div>

      <p className="text-[0.7rem] text-muted-foreground leading-relaxed">
        支持 HTTP / SOCKS5 代理。仅在检查更新和下载安装包时生效，不影响音频传输。
      </p>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
          placeholder="例如 http://127.0.0.1:7890 或 socks5://..."
          className="flex-1 rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-md"
        />
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-all duration-150 hover:opacity-90 active:scale-95"
          title="保存代理设置"
        >
          <Check className="h-3.5 w-3.5" />
          <span>{saved ? '已保存' : '保存'}</span>
        </button>
        {Boolean(value) && (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95"
            title="清空代理（恢复直连）"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
