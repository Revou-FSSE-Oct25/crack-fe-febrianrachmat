"use client";

import {
  btnOutline,
  btnPrimary,
  cardSurface,
  pageShell,
} from "@/components/ui/page-shell";
import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className={`${pageShell} flex min-h-[50vh] flex-col items-center justify-center pb-16`}
    >
      <div className={`${cardSurface} w-full max-w-md text-center space-y-5`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-red-800">
          {t("ui.errorEyebrow")}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-balance">
          {t("ui.errorTitle")}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {t("ui.errorDescription")}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => reset()}
            className={`${btnPrimary} min-h-[44px] justify-center px-6`}
          >
            {t("ui.tryAgain")}
          </button>
          <Link
            href="/"
            className={`${btnOutline} min-h-[44px] justify-center px-6`}
          >
            {t("ui.toHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
