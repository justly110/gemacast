import { SlidersHorizontal, Sun, Moon, Laptop } from 'lucide-react';
import { ThemeToggle, applyTheme } from './ThemeToggle';
import { BufferPresetSelect } from './BufferPresetSelect';
import { CustomJitterConfig } from './CustomJitterConfig';
import { BitrateSelect } from './BitrateSelect';
import { GainSlider } from './GainSlider';
import { ExclusiveToggle } from './ExclusiveToggle';
import { MatchPcVolumeToggle } from './MatchPcVolumeToggle';
import { KeepScreenOnToggle } from './KeepScreenOnToggle';
import { AutoReconnectToggle } from './AutoReconnectToggle';
import { ModeSelector } from './ModeSelector';
import { UpdateBanner } from './UpdateBanner';
import { UpdateProxyInput } from './UpdateProxyInput';
import { ForgetPcIdentity } from './ForgetPcIdentity';
import { HelpDialog, useHelpDialog } from '../shared/HelpDialog';
import { useAppStore } from '../../stores/app-store';
import { useSettings } from '../../hooks/use-settings';
import { triggerHaptic } from '../../core/haptics';
import packageJson from '../../../package.json';

function SectionLabel({
  children,
  helpButton,
}: {
  children: React.ReactNode;
  helpButton?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between text-xs font-bold tracking-wider uppercase text-muted-foreground">
      <div className="flex items-center gap-1.5">{children}</div>
      {helpButton}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border/60 to-transparent my-1" />
  );
}

export function SettingsView() {
  const help = useHelpDialog();
  const { settings, update } = useSettings();
  const exclusiveSupported = useAppStore((s) => s.exclusiveSupported);
  const volumeSyncSupported = useAppStore(
    (s) => s.streamerCapabilities?.supportsVolumeSync ?? false,
  );
  const currentTheme = settings.theme;

  const handleThemeChange = (next: 'light' | 'dark' | 'system') => {
    triggerHaptic('light');
    update({ theme: next });
    applyTheme(next);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" data-testid="settings-view">
      {/* 顶部标题栏 */}
      <header
        className="flex items-center justify-between border-b border-border/60 px-6 py-3.5 bg-muted/20 backdrop-blur-md"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_12px_rgba(2,132,199,0.15)] dark:shadow-[0_0_16px_rgba(56,189,248,0.2)]">
            <SlidersHorizontal className="h-4.5 w-4.5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">系统设置</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* 滚动设置区域 */}
      <div
        className="flex-1 space-y-5 overflow-y-auto px-5 py-5 hide-scrollbar"
        style={{
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <UpdateBanner />
        <UpdateProxyInput />

        {/* 外观主题 */}
        <div className="rounded-2xl border border-border/60 bg-muted/25 p-4 backdrop-blur-md">
          <SectionLabel>外观主题</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleThemeChange('system')}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-all active:scale-95 ${
                currentTheme === 'system'
                  ? 'border-primary/50 bg-primary/15 text-primary shadow-xs font-semibold'
                  : 'border-border/60 bg-background/50 text-muted-foreground hover:bg-background/80 hover:text-foreground'
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              <span>跟随系统</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-all active:scale-95 ${
                currentTheme === 'light'
                  ? 'border-primary/50 bg-primary/15 text-primary shadow-xs font-semibold'
                  : 'border-border/60 bg-background/50 text-muted-foreground hover:bg-background/80 hover:text-foreground'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>浅色</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-all active:scale-95 ${
                currentTheme === 'dark'
                  ? 'border-primary/50 bg-primary/15 text-primary shadow-xs font-semibold'
                  : 'border-border/60 bg-background/50 text-muted-foreground hover:bg-background/80 hover:text-foreground'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              <span>深色</span>
            </button>
          </div>
        </div>

        <SectionDivider />

        {/* 缓冲预设 */}
        <div className="relative z-30 rounded-2xl border border-border/60 bg-muted/30 p-4 backdrop-blur-md">
          <SectionLabel helpButton={help.renderHelpButton('buffer-preset')}>
            缓冲预设
          </SectionLabel>
          <BufferPresetSelect />
          <CustomJitterConfig renderHelpButton={help.renderHelpButton} />
        </div>

        <SectionDivider />

        {/* 音频码率质量 */}
        <div className="relative z-20 rounded-2xl border border-border/60 bg-muted/30 p-4 backdrop-blur-md">
          <SectionLabel helpButton={help.renderHelpButton('audio-bitrate')}>
            音频码率质量
          </SectionLabel>
          <BitrateSelect />
        </div>

        <SectionDivider />

        {/* 音频增益 */}
        <div className="relative z-10 rounded-2xl border border-border/60 bg-muted/30 p-4 backdrop-blur-md">
          <SectionLabel helpButton={help.renderHelpButton('audio-gain')}>音频增益</SectionLabel>
          <GainSlider />
        </div>

        <SectionDivider />

        {/* 功能开关组 */}
        <div className="relative z-0 rounded-2xl border border-border/60 bg-muted/30 p-4 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionLabel helpButton={help.renderHelpButton('exclusive-mode')}>
                独占模式
              </SectionLabel>
              {!exclusiveSupported && (
                <p className="-mt-1 text-[0.7rem] text-muted-foreground/70">当前设备不支持</p>
              )}
            </div>
            <ExclusiveToggle />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionLabel helpButton={help.renderHelpButton('match-pc-volume')}>
                与电脑音量同步
              </SectionLabel>
              {!volumeSyncSupported && (
                <p className="-mt-1 text-[0.7rem] text-muted-foreground/70">当前电脑未上报音量</p>
              )}
            </div>
            <MatchPcVolumeToggle />
          </div>

          <div className="flex items-center justify-between gap-3">
            <SectionLabel helpButton={help.renderHelpButton('keep-screen-on')}>
              保持屏幕常亮
            </SectionLabel>
            <KeepScreenOnToggle />
          </div>

          <div className="flex items-center justify-between gap-3">
            <SectionLabel helpButton={help.renderHelpButton('auto-reconnect')}>
              自动重新连接
            </SectionLabel>
            <AutoReconnectToggle />
          </div>
        </div>

        <SectionDivider />

        {/* 连接模式 */}
        <div className="rounded-2xl border border-border/60 bg-muted/25 p-4 backdrop-blur-md">
          <SectionLabel helpButton={help.renderHelpButton('connection-mode')}>
            连接模式
          </SectionLabel>
          <ModeSelector />
        </div>

        <SectionDivider />

        {/* 已配对电脑 */}
        <div className="rounded-2xl border border-border/60 bg-muted/25 p-4 backdrop-blur-md">
          <SectionLabel>已配对电脑</SectionLabel>
          <ForgetPcIdentity />
        </div>

        {/* 底部信息与版权 */}
        <div className="flex flex-col gap-y-2 mt-4 pt-6 text-center justify-center">
          <p className="text-xs text-muted-foreground leading-relaxed px-2">
            推荐使用 USB 网络共享或 5 GHz Wi-Fi 以获得最低延迟。可在上方通过 <em>缓冲预设</em> 在延迟与稳定性之间权衡。
          </p>
          <a
            className="mt-2 inline-flex items-center justify-center self-center rounded-full border border-border/70 bg-background/60 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-200 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-xs gap-x-2"
            href="https://github.com/justly110/gemacast"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              width={16}
              height={16}
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>justly110/gemacast</span>
          </a>

          <p className="mt-2 text-[0.75rem] font-mono text-muted-foreground/70">
            v{packageJson.version} · 2026 Echa Apriliyanto
          </p>
        </div>
      </div>

      <HelpDialog activeKey={help.activeKey} onClose={help.closeHelp} dialogRef={help.dialogRef} />
    </div>
  );
}
