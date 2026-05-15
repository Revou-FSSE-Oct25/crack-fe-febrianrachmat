"use client";

import { cardSurface } from "@/components/ui/page-shell";
import { ApiRequestError } from "@/lib/api/client";
import { getMyActivitySummary } from "@/lib/api/users";
import type { UserActivitySummary, UserRole } from "@/lib/api/types";
import Link from "next/link";
import { useEffect, useState } from "react";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

function formatLastActivity(iso: string | null | undefined): string {
  if (!iso) return "Belum ada aktivitas";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function PatientTherapistSummary({
  data,
  role,
}: {
  data: Extract<
    UserActivitySummary,
    { role: "PATIENT" } | { role: "PHYSIOTHERAPIST" }
  >;
  role: UserRole;
}) {
  return (
    <>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Stat label="Total booking" value={data.bookings.total} />
        <Stat
          label="Booking aktif"
          value={data.bookings.pending}
          hint="Menunggu / berlangsung"
        />
        <Stat label="Booking selesai" value={data.bookings.completed} />
        <Stat label="Total konsultasi" value={data.consultations.total} />
        <Stat
          label="Konsultasi aktif"
          value={data.consultations.active}
        />
        <Stat
          label="Konsultasi selesai"
          value={data.consultations.completed}
        />
        {"transactionsPending" in data ? (
          <Stat
            label="Pembayaran menunggu"
            value={data.transactionsPending}
          />
        ) : null}
        <Stat label="Ulasan" value={data.reviews} />
      </dl>
      <p className="text-sm text-slate-600">
        Aktivitas terakhir:{" "}
        <span className="font-medium text-slate-800">
          {formatLastActivity(data.lastActivityAt)}
        </span>
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        <Link
          href="/bookings"
          className="text-sm font-medium text-teal-800 hover:text-teal-950 underline-offset-2 hover:underline"
        >
          Lihat booking
        </Link>
        <Link
          href="/consultations"
          className="text-sm font-medium text-teal-800 hover:text-teal-950 underline-offset-2 hover:underline"
        >
          Lihat konsultasi
        </Link>
        {role === "PATIENT" ? (
          <Link
            href="/transactions"
            className="text-sm font-medium text-teal-800 hover:text-teal-950 underline-offset-2 hover:underline"
          >
            Lihat transaksi
          </Link>
        ) : null}
      </div>
    </>
  );
}

type ProfileActivitySummaryProps = {
  enabled: boolean;
};

export function ProfileActivitySummary({ enabled }: ProfileActivitySummaryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<UserActivitySummary | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    });
    getMyActivitySummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : "Gagal memuat ringkasan aktivitas.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className={`${cardSurface} mx-auto max-w-lg space-y-4`}>
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Ringkasan aktivitas
        </h2>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          Statistik singkat dari booking, konsultasi, dan transaksi Anda.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 animate-pulse">
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : summary?.role === "ADMIN" ? (
        <>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Stat
              label="Verifikasi PT menunggu"
              value={summary.pendingVerifications}
            />
            <Stat
              label="Transaksi menunggu"
              value={summary.transactionsPending}
            />
            <Stat
              label="Konsultasi terbuka"
              value={summary.consultationsActive}
            />
          </dl>
          <Link
            href="/admin/dashboard"
            className="inline-flex text-sm font-medium text-teal-800 hover:text-teal-950 underline-offset-2 hover:underline"
          >
            Buka dashboard admin
          </Link>
        </>
      ) : summary &&
        (summary.role === "PATIENT" || summary.role === "PHYSIOTHERAPIST") ? (
        <PatientTherapistSummary data={summary} role={summary.role} />
      ) : null}
    </div>
  );
}
