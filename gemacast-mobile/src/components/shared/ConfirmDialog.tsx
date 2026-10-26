import { useEffect, useRef } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  message,
  confirmLabel = '确定',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-[min(90vw,380px)] rounded-3xl border border-border/80 bg-popover/90 p-6 text-popover-foreground shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <p className="mb-6 text-sm font-medium leading-relaxed text-foreground overflow-y-auto max-h-40 [overflow-wrap:anywhere]">
        {message}
      </p>
      <div className="flex justify-end gap-2.5">
        <button
          type="button"
          className="rounded-xl border border-border/70 bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-95"
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className="rounded-xl bg-destructive px-4.5 py-2 text-xs font-semibold text-primary-foreground! shadow-sm transition-all duration-150 hover:bg-destructive/90 active:scale-95"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
