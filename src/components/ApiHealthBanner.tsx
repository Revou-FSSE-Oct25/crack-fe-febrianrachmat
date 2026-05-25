"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ApiHealthStatus } from "@/lib/api/health";

type HealthPayload = ApiHealthStatus & { unreachable?: boolean };

const DEGRADED: HealthPayload = {
  status: "degraded",
  database: "disconnected",
  unreachable: true,
};

async function fetchClientHealth(): Promise<HealthPayload> {
  const res = await fetch("/api/health", { cache: "no-store" });
  const json = (await res.json()) as {
    success?: boolean;
    data?: ApiHealthStatus;
    error?: { message?: string };
  };
  if (json.data) return json.data;
  return DEGRADED;
}

export default function ApiHealthBanner() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const next = await fetchClientHealth();
        if (!cancelled) setHealth(next);
      } catch {
        if (!cancelled) setHealth(DEGRADED);
      }
    }

    const initialId = window.setTimeout(() => void refresh(), 0);
    const intervalId = window.setInterval(() => void refresh(), 90_000);

    return () => {
      cancelled = true;
      window.clearTimeout(initialId);
      window.clearInterval(intervalId);
    };
  }, []);

  if (dismissed || !health) return null;

  const ok =
    health.status === "ok" &&
    health.database === "connected" &&
    !health.unreachable;

  if (ok) return null;

  const message =
    health.unreachable || health.status !== "ok"
      ? "Backend tidak terjangkau dari browser ini."
      : "Database backend terputus — beberapa fitur mungkin gagal.";

  return (
    <div
      role="status"
      className="border-b border-amber-200/90 bg-amber-50 px-4 py-2.5 text-sm text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/50 dark:text-amber-100"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center sm:justify-between sm:text-left">
        <p>
          <span className="font-semibold">Perhatian demo:</span> {message}{" "}
          <Link
            href="/status"
            className="font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950 dark:text-amber-200"
          >
            Status layanan
          </Link>
          {" · "}
          <Link
            href="/demo"
            className="font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950 dark:text-amber-200"
          >
            Panduan demo
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-300/80 hover:bg-amber-100/80 dark:text-amber-100 dark:ring-amber-700/60 dark:hover:bg-amber-900/40"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
