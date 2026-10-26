import React, { useState, useEffect } from 'react';
import { useCustomPresetEditor } from '../../hooks/use-custom-preset-editor';
import { ConfirmDialog } from '../shared/ConfirmDialog';

function NumberInput({
  value,
  onChange,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  value: number | null | undefined;
  onChange: (val: number | null) => void;
}) {
  const [local, setLocal] = useState(value == null ? '' : value.toString());

  useEffect(() => {
    if (value == null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocal('');
    } else {
      const parsedLocal = local === '' ? 0 : Number(local);
      if (parsedLocal !== value) {
        setLocal(value.toString());
      }
    }
  }, [value, local]);

  return (
    <input
      type="number"
      value={local}
      onChange={(e) => {
        const val = e.target.value;
        setLocal(val);
        if (val === '') {
          onChange(null);
        } else {
          const parsed = Number(val);
          if (!isNaN(parsed)) {
            onChange(parsed);
          }
        }
      }}
      className={className}
      {...props}
    />
  );
}

type CustomJitterConfigProps = {
  renderHelpButton: (key: string) => React.ReactNode;
};

export function CustomJitterConfig({ renderHelpButton }: CustomJitterConfigProps) {
  const editor = useCustomPresetEditor();

  if (!editor.isCustom) return null;

  const { config } = editor;

  const FIELD_LABELS: Record<string, string> = {
    staticTargetMs: '缓冲深度',
  };

  return (
    <div className="mt-3 flex flex-col gap-3.5 rounded-2xl border border-border/70 bg-background/50 p-4 backdrop-blur-md animate-[fade-in_200ms_ease-out]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-foreground">预设名称</span>
        <input
          type="text"
          value={editor.presetName}
          onChange={(e) => editor.setPresetName(e.target.value)}
          placeholder={
            editor.isEditingSaved
              ? editor.config && editor.savedMatchIndex >= 0
                ? undefined
                : '我的预设'
              : '我的预设'
          }
          maxLength={30}
          className="w-40 rounded-xl border border-border/70 bg-background/60 px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
          缓冲深度
          {renderHelpButton('static-depth')}
        </span>
        <div className="flex items-center justify-end">
          <NumberInput
            value={config.staticTargetMs}
            onChange={(val) => editor.updateField({ staticTargetMs: val ?? null })}
            className="mr-1.5 w-20 rounded-xl border border-border/70 bg-background/60 px-2.5 py-1.5 text-right font-mono text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
          <span className="text-xs font-semibold text-muted-foreground w-5 text-right">ms</span>
        </div>
      </div>

      {!editor.isValid && editor.validationErrors.length > 0 && (
        <div className="mt-1 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          <ul className="list-inside list-disc space-y-0.5">
            {editor.validationErrors.map((err, i) => (
              <li key={i}>
                <strong>{FIELD_LABELS[err.field] || err.field}:</strong> {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-1 flex flex-col gap-2">
        <button
          type="button"
          className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-all duration-150 hover:opacity-90 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={editor.handleSave}
          disabled={!editor.canSave}
        >
          保存预设
        </button>

        {editor.isEditingSaved && (
          <button
            type="button"
            className="w-full rounded-xl border border-destructive/30 bg-destructive/10 py-2.5 text-xs font-bold text-destructive transition-all duration-150 hover:bg-destructive hover:text-destructive-foreground active:scale-98"
            onClick={editor.requestDelete}
          >
            删除预设
          </button>
        )}
      </div>

      <ConfirmDialog
        open={editor.isDeleteDialogOpen}
        message="确定要删除此保存的预设吗？此操作无法撤销。"
        confirmLabel="删除"
        cancelLabel="取消"
        onConfirm={editor.confirmDelete}
        onCancel={editor.cancelDelete}
      />
    </div>
  );
}
