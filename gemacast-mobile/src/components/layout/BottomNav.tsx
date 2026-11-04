import { Radio, SlidersHorizontal } from 'lucide-react';
import { triggerHaptic } from '../../core/haptics';

export type TabId = 'home' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const handleTab = (tab: TabId) => {
    triggerHaptic('light');
    onTabChange(tab);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl"
      aria-label="底部导航"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around px-8" role="tablist">
        <button
          type="button"
          onClick={() => handleTab('home')}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-200 active:scale-95 ${
            activeTab === 'home'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="首页"
          aria-selected={activeTab === 'home'}
          role="tab"
        >
          <Radio className="h-5 w-5" />
          <span
            className={`text-[11px] tracking-tight leading-none ${
              activeTab === 'home' ? 'font-semibold' : 'font-medium'
            }`}
          >
            首页
          </span>
          {activeTab === 'home' && (
            <span className="absolute -bottom-1 h-0.5 w-6 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)] animate-[fade-in_200ms_ease-out]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTab('settings')}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-200 active:scale-95 ${
            activeTab === 'settings'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="设置"
          aria-selected={activeTab === 'settings'}
          role="tab"
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span
            className={`text-[11px] tracking-tight leading-none ${
              activeTab === 'settings' ? 'font-semibold' : 'font-medium'
            }`}
          >
            设置
          </span>
          {activeTab === 'settings' && (
            <span className="absolute -bottom-1 h-0.5 w-6 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)] animate-[fade-in_200ms_ease-out]" />
          )}
        </button>
      </div>
    </nav>
  );
}
