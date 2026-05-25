"use client";

import { btnOutline, btnPrimary, cardSurface } from "@/components/ui/page-shell";
import type { ApiHealthStatus } from "@/lib/api/health";
import Link from "next/link";
import { useCallback, useState } from "react";

export function StatusPanel({ initial }: { initial: ApiHealthStatus | null }) {
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
        throw new Error(json.error?.message ?? "Health check gagal");
      }
    } catch (e) {
      setHealth(null);
      setError(e instanceof Error ? e.message : "Tidak dapat menjangkau API.");
    } finally {
      setLoading(false);
    }
  }, []);

  const apiOk = health?.status === "ok" && health.database === "connected";

  return (
    <section className={`${cardSurface} max-w-lg space-y-4`}>
      {error ? (
        <>
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            Tidak terhubung
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
        {apiOk
          ? "Layanan siap digunakan."
          : "Periksa NEXT_PUBLIC_API_URL dan status deploy backend."}
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className={btnPrimary}
        >
          {loading ? "Memeriksa…" : "Periksa ulang"}
        </button>
        <Link href="/demo" className={btnOutline}>
          Panduan demo
        </Link>
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300"
        >
          Beranda
        </Link>
      </div>
    </section>
  );
}
