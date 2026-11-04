import { useState, useCallback, useEffect } from 'react';
import { DeviceInfo } from '../device/DeviceInfo';
import { StreamerList } from '../streamers/StreamerList';
import { ManualConnect } from '../streamers/ManualConnect';
import { ConnectionReadout } from '../latency/ConnectionReadout';
import { ToastContainer } from '../feedback/ToastContainer';
import { SettingsView } from '../settings/SettingsView';
import { BottomNav, type TabId } from './BottomNav';
import { useWakeLock } from '../../hooks/use-wake-lock';
import { useAppStore } from '../../stores/app-store';

export function AppShell() {
  const keepScreenOn = useAppStore((s) => s.settings.keepScreenOn);
  useWakeLock(keepScreenOn);

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    return window.location.hash.startsWith('#settings') ? 'settings' : 'home';
  });

  const handleTabChange = useCallback((tab: TabId) => {
    if (tab === 'settings') {
      if (!window.location.hash.startsWith('#settings')) {
        window.history.pushState({ tab: 'settings' }, '', '#settings');
      }
      setActiveTab('settings');
    } else {
      if (window.location.hash.startsWith('#settings')) {
        window.history.back();
      } else if (!window.location.hash.startsWith('#root')) {
        window.history.pushState(null, '', '#root');
      }
      setActiveTab('home');
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(window.location.hash.startsWith('#settings') ? 'settings' : 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Whenever activeTab changes, close any lingering open modal dialogs to prevent document inert lock
    document.querySelectorAll('dialog[open]').forEach((el) => {
      try {
        (el as HTMLDialogElement).close();
      } catch {}
    });
  }, [activeTab]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background">
      {/* 极光流体背景装饰光晕 (Ambient Aurora Glow Orbs) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-60 dark:opacity-45"
        aria-hidden="true"
      >
        {/* 左上角冰蓝/极光青色漫射光球 */}
        <div
          className="absolute -top-[12%] -left-[15%] h-[420px] w-[420px] rounded-full blur-[100px] animate-[aurora-flow-1_18s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(circle, rgba(6,182,212,0.45) 0%, rgba(14,165,233,0.18) 55%, transparent 75%)',
          }}
        />
        {/* 右中侧深空靛蓝/紫罗兰漫射光球 */}
        <div
          className="absolute top-[28%] -right-[18%] h-[480px] w-[480px] rounded-full blur-[110px] animate-[aurora-flow-2_22s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.38) 0%, rgba(56,189,248,0.18) 60%, transparent 80%)',
          }}
        />
        {/* 底部中央柔和温暖翡翠/青翠微光 */}
        <div
          className="absolute -bottom-[10%] left-[10%] h-[380px] w-[380px] rounded-full blur-[90px] animate-[aurora-flow-3_20s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.28) 0%, rgba(6,182,212,0.12) 60%, transparent 75%)',
          }}
        />
        {/* 微粒晶格遮罩，增添现代高保真噪点质感 */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <ToastContainer />

      {/* 首页视图 */}
      <main
        className={`relative z-10 mx-auto h-dvh max-w-lg flex-col gap-5 px-5 overflow-hidden ${
          activeTab === 'home' ? 'flex animate-[fade-in_200ms_ease-out]' : 'hidden'
        }`}
        style={{
          paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <DeviceInfo />

        {/* 实时音频与网络状态仪表盘 */}
        <ConnectionReadout />

        <ManualConnect />
        <StreamerList />
      </main>

      {/* 设置视图 */}
      <div
        className={`relative z-10 mx-auto h-dvh max-w-lg flex-col overflow-hidden ${
          activeTab === 'settings' ? 'flex animate-[fade-in_200ms_ease-out]' : 'hidden'
        }`}
      >
        <SettingsView />
      </div>

      {/* 底部选项卡导航 */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
