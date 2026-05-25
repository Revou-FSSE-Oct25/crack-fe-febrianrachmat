"use client";

import { btnPrimary, btnSecondary, cardSurface } from "@/components/ui/page-shell";

export function LoadErrorCard({
  message,
  onRetry,
  retryLabel = "Coba lagi",
}: {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}) {
  return (
    <div className={`${cardSurface} space-y-4`}>
      <p className="text-sm font-semibold text-red-800 dark:text-red-200">
        Gagal memuat data
      </p>
      <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
        {message}
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onRetry} className={btnPrimary}>
          {retryLabel}
        </button>
        <a href="/status" className={btnSecondary}>
          Cek status API
        </a>
      </div>
    </div>
  );
}
