"use client";

import { btnPrimary, btnSecondary, cardSurface } from "@/components/ui/page-shell";
import { useLanguage } from "@/contexts/language-context";

export function LoadErrorCard({
  message,
  onRetry,
  retryLabel,
}: {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}) {
  const { t } = useLanguage();
  return (
    <div className={`${cardSurface} space-y-4`}>
      <p className="text-sm font-semibold text-red-800 dark:text-red-200">
        {t("ui.failedToLoadData")}
      </p>
      <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
        {message}
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onRetry} className={btnPrimary}>
          {retryLabel ?? t("ui.tryAgain")}
        </button>
        <a href="/status" className={btnSecondary}>
          {t("ui.checkApiStatus")}
        </a>
      </div>
    </div>
  );
}
