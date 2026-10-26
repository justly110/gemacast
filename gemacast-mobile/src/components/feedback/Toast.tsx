import { useRef } from 'react';
import { CircleCheck, XCircle, TriangleAlert, Info, X } from 'lucide-react';
import type { Toast as ToastType } from '../../stores/toast-store';
import { useToastStore } from '../../stores/toast-store';

const ICON_MAP: Record<ToastType['type'], React.ReactNode> = {
  success: <CircleCheck className="h-5 w-5 text-status-ok drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />,
  error: <XCircle className="h-5 w-5 text-status-lost drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" />,
  warning: <TriangleAlert className="h-5 w-5 text-status-warn drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />,
  info: <Info className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(2,132,199,0.4)]" />,
};

export function Toast({ toast }: { toast: ToastType }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const isError = toast.type === 'error';

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-3.5
        rounded-2xl border px-4.5 py-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.22)]
        backdrop-blur-2xl min-w-64 max-w-sm transition-all duration-300
        ${
          toast.closing
            ? 'animate-[toast-slide-out_200ms_ease-in_forwards]'
            : 'animate-[toast-slide-in_300ms_cubic-bezier(0.16,1,0.3,1)_forwards]'
        }
        ${
          isError
            ? 'border-status-lost/30 bg-status-lost/10 text-foreground'
            : 'border-white/30 dark:border-white/10 bg-popover/85 text-popover-foreground'
        }
      `}
      role="alert"
    >
      <span className="flex shrink-0 items-center justify-center">{ICON_MAP[toast.type]}</span>

      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-xs font-semibold leading-relaxed tracking-tight">{toast.message}</span>
        {isError && toast.fullLog && (
          <button
            type="button"
            className="text-left text-[11px] font-bold text-status-lost underline underline-offset-2 hover:opacity-80 transition-opacity"
            onClick={() => dialogRef.current?.showModal()}
          >
            点击查看详情
          </button>
        )}
      </div>

      <button
        type="button"
        className="shrink-0 -mr-1 flex h-6 w-6 items-center justify-center rounded-full bg-muted/40 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-90"
        onClick={() => dismiss(toast.id)}
        aria-label="关闭提示"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {isError && toast.fullLog && (
        <dialog
          ref={dialogRef}
          className="fixed inset-0 z-10001 m-auto w-[min(90vw,600px)] rounded-3xl border border-border/80 bg-popover/90 p-6 text-popover-foreground shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === dialogRef.current) dialogRef.current.close();
          }}
        >
          <h3 className="mb-3 text-base font-bold tracking-tight">错误详情</h3>
          <div className="mb-5 min-h-24 max-h-[50vh] overflow-x-auto overflow-y-auto rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-xs whitespace-pre font-mono hide-scrollbar">
            {toast.fullLog}
          </div>
          <button
            type="button"
            className="btn btn-primary w-full rounded-xl py-2.5 text-xs font-bold"
            onClick={() => dialogRef.current?.close()}
          >
            关闭
          </button>
        </dialog>
      )}
    </div>
  );
}
