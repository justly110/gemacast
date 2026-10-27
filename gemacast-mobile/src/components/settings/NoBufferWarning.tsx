import { Check } from 'lucide-react';

export function NoBufferWarningDialog({
  dialogRef,
  dontShowAgain,
  setDontShowAgain,
  handleOk,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  dontShowAgain: boolean;
  setDontShowAgain: (v: boolean) => void;
  handleOk: () => void;
}) {
  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-[min(90vw,380px)] rounded-3xl border border-border/80 bg-popover/90 p-6 text-popover-foreground shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <h2 className="mb-2 text-base font-bold tracking-tight text-foreground">无缓冲模式</h2>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
        此模式将禁用所有音频缓冲。音频数据到达手机后即刻播放，没有任何容错缓冲安全区。
      </p>
      <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
        在不稳定的 Wi-Fi 网络下，可能会遇到爆音、杂音或短暂声音丢失。此模式最适合有线连接 (USB/ADB) 或极其稳定的 5 GHz Wi-Fi。
      </p>

      <label className="mb-6 flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={dontShowAgain}
          onChange={(e) => setDontShowAgain(e.target.checked)}
          className="peer sr-only"
        />
        <div
          className={`
            flex h-5 w-5 items-center justify-center rounded-lg border transition-all duration-150
            ${
              dontShowAgain
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border/80 bg-background/50 hover:border-primary/50'
            }
          `}
        >
          <Check
            className={`h-3.5 w-3.5 transition-opacity ${dontShowAgain ? 'opacity-100' : 'opacity-0'}`}
            strokeWidth={3}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">不再提示</span>
      </label>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all duration-150 hover:opacity-90 active:scale-95"
          onClick={handleOk}
        >
          确定
        </button>
      </div>
    </dialog>
  );
}
