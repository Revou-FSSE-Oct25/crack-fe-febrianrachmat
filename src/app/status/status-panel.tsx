"use client";

import { btnOutline, btnPrimary, cardSurface } from "@/components/ui/page-shell";
import { useLanguage } from "@/contexts/language-context";
import type { ApiHealthStatus } from "@/lib/api/health";
import Link from "next/link";
import { useCallback, useState } from "react";

export function StatusPanel({ initial }: { initial: ApiHealthStatus | null }) {
  const { t } = useLanguage();
  const [health, setHealth] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const json = (await res.json()) as {
        success?: boolean;
        data?: ApiHealthStatus;
        error?: { message?: string };
      };
      if (json.data) {
        setHealth(json.data);
      } else {
        throw new Error(json.error?.message ?? t("mkt.statusHealthFailed"));
      }
    } catch (e) {
      setHealth(null);
      setError(e instanceof Error ? e.message : t("mkt.statusUnreachable"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const apiOk = health?.status === "ok" && health.database === "connected";

  return (
    <section className={`${cardSurface} max-w-lg space-y-4`}>
      {error ? (
        <>
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            {t("mkt.statusNotConnected")}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
            {error}
          </p>
        </>
      ) : health ? (
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600 dark:text-slate-400">API</dt>
            <dd
              className={
                health.status === "ok"
                  ? "font-semibold text-emerald-700 dark:text-emerald-400"
                  : "font-semibold text-amber-800 dark:text-amber-300"
              }
            >
              {health.status}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600 dark:text-slate-400">Database</dt>
            <dd
              className={
                health.database === "connected"
                  ? "font-semibold text-emerald-700 dark:text-emerald-400"
                  : "font-semibold text-amber-800 dark:text-amber-300"
              }
            >
              {health.database}
            </dd>
          </div>
        </dl>
      ) : null}

      <p className="text-xs text-slate-500 border-t border-slate-100 pt-4 dark:border-slate-700">
        {apiOk ? t("mkt.statusReady") : t("mkt.statusCheckEnv")}
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className={btnPrimary}
        >
          {loading ? t("mkt.statusChecking") : t("mkt.statusRecheck")}
        </button>
        <Link href="/demo" className={btnOutline}>
          {t("mkt.demoGuideLink")}
        </Link>
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300"
        >
          {t("mkt.homeLink")}
        </Link>
      </div>
    </section>
  );
}
