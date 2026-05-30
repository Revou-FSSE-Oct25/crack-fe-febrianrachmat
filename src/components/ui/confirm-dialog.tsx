"use client";

import {
  btnDanger,
  btnPrimary,
  btnSecondary,
} from "@/components/ui/page-shell";
import { useLanguage } from "@/contexts/language-context";
import { useEffect, type ReactNode } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useLanguage();
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  const confirmBtnClass =
    variant === "danger"
      ? `${btnDanger} min-h-[44px] justify-center px-5`
      : `${btnPrimary} min-h-[44px] justify-center px-5`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label={t("ui.closeDialog")}
        disabled={loading}
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? "confirm-dialog-desc" : undefined}
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl ring-1 ring-slate-900/5 dark:border-slate-600/80 dark:bg-slate-800 dark:ring-slate-900/40"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          {title}
        </h2>
        {description ? (
          <div
            id="confirm-dialog-desc"
            className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400"
          >
            {description}
          </div>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className={`${btnSecondary} min-h-[44px] justify-center px-5`}
          >
            {cancelLabel ?? t("ui.cancel")}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={confirmBtnClass}
          >
            {loading ? t("ui.processing") : confirmLabel ?? t("ui.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}