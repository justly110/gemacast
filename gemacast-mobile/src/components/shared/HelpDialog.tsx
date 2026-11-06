import { X } from 'lucide-react';
import { HELP_CONTENT } from '../../core/help-content';

export function HelpDialog({
  activeKey,
  onClose,
  dialogRef,
}: {
  activeKey: string | null;
  onClose: () => void;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
}) {
  const content = activeKey ? HELP_CONTENT[activeKey] : null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="fixed inset-0 z-10000 m-auto w-[min(90vw,460px)] rounded-3xl border border-border/80 bg-popover/90 p-6 text-popover-foreground shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      {content && (
        <>
          <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
            <h3 className="text-base font-bold tracking-tight text-foreground">{content.title}</h3>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/40 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-90"
              onClick={onClose}
              aria-label="关闭帮助"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="py-4 text-xs font-normal leading-relaxed text-muted-foreground whitespace-pre-line max-h-[60vh] overflow-y-auto hide-scrollbar">
            {content.body}
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="rounded-xl border border-border/70 bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all duration-150 hover:opacity-90 active:scale-95"
              onClick={onClose}
            >
              我知道了
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
