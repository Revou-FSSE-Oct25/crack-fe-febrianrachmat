"use client";

import { useLanguage } from "@/contexts/language-context";
import {
  btnOutline,
  btnPrimary,
  cardSurface,
  pageShell,
} from "@/components/ui/page-shell";
import Link from "next/link";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <main
      className={`${pageShell} flex min-h-[50vh] flex-col items-center justify-center pb-16`}
    >
      <div className={`${cardSurface} w-full max-w-md text-center space-y-5`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
          404
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-balance">
          {t("ui.notFoundTitle")}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {t("ui.notFoundDesc")}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <Link
            href="/"
            className={`${btnPrimary} min-h-[44px] justify-center px-6`}
          >
            {t("ui.toHome")}
          </Link>
          <Link
            href="/therapists"
            className={`${btnOutline} min-h-[44px] justify-center px-6`}
          >
            {t("ui.findTherapist")}
          </Link>
        </div>
      </div>
    </main>
  );
}
