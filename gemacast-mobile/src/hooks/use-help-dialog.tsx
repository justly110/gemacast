import { useRef, useState, useCallback, useEffect } from 'react';
import { onModalPopState, pushModalEntry, releaseModalEntry } from '../core/modal-history';

/**
 * Modal open/close state for a single `<dialog>`, with browser-history
 * bookkeeping so the back button closes it instead of leaving the page.
 *
 * Kept out of the component file: exporting a hook and a component from one
 * module defeats React Fast Refresh for both.
 */
export function useHelpDialog() {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hasHistoryRef = useRef(false);

  const closeHelp = useCallback(() => {
    try {
      dialogRef.current?.close();
    } catch {
      // The dialog was already closed, which is a normal outcome here.
    }
    setActiveKey(null);
    if (hasHistoryRef.current) {
      hasHistoryRef.current = false;
      releaseModalEntry();
    }
  }, []);

  const openHelp = useCallback((key: string) => {
    setActiveKey(key);
    dialogRef.current?.showModal();
    if (!hasHistoryRef.current) {
      hasHistoryRef.current = pushModalEntry();
    }
  }, []);

  useEffect(() => {
    const dialog = () => dialogRef.current;
    const handlePopState = () => {
      if (!hasHistoryRef.current) return;
      hasHistoryRef.current = false;
      try {
        dialog()?.close();
      } catch {
        // Same as closeHelp: an already-closed dialog needs no recovery.
      }
      setActiveKey(null);
    };
    const unsubscribe = onModalPopState(handlePopState);
    return () => {
      unsubscribe();
      if (hasHistoryRef.current) {
        hasHistoryRef.current = false;
        releaseModalEntry();
      }
      try {
        dialog()?.close();
      } catch {
        // Unmount after a manual close; the dialog is already shut.
      }
    };
  }, []);

  const renderHelpButton = (helpKey: string) => (
    <button
      type="button"
      className="flex h-4.5 w-4.5 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-[10px] font-bold text-muted-foreground backdrop-blur-sm transition-all duration-150 hover:border-primary/50 hover:bg-primary/10 hover:text-primary active:scale-90"
      onClick={(e) => {
        e.stopPropagation();
        openHelp(helpKey);
      }}
      aria-label="帮助"
    >
      ?
    </button>
  );

  return { activeKey, openHelp, closeHelp, renderHelpButton, dialogRef };
}
