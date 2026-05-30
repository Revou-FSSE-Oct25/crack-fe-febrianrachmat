"use client";

import { cardSurface } from "@/components/ui/page-shell";
import { useLanguage } from "@/contexts/language-context";
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

function formatLastActivity(
  iso: string | null | undefined,
  t: (key: string) => string,
): string {
  if (!iso) return t("profile.activity.noActivity");
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
  const { t } = useLanguage();
  return (
    <>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Stat
          label={t("profile.activity.totalBookings")}
          value={data.bookings.total}
        />
        <Stat
          label={t("profile.activity.activeBookings")}
          value={data.bookings.pending}
          hint={t("profile.activity.activeBookingsHint")}
        />
        <Stat
          label={t("profile.activity.completedBookings")}
          value={data.bookings.completed}
        />
        <Stat
          label={t("profile.activity.totalConsultations")}
          value={data.consultations.total}
        />
        <Stat
          label={t("profile.activity.activeConsultations")}
          value={data.consultations.active}
        />
        <Stat
          label={t("profile.activity.completedConsultations")}
          value={data.consultations.completed}
        />
        {"transactionsPending" in data ? (
          <Stat
            label={t("profile.activity.pendingPayments")}
            value={data.transactionsPending}
          />
        ) : null}
        <Stat label={t("profile.activity.reviews")} value={data.reviews} />
      </dl>
      <p className="text-sm text-slate-600">
        {t("profile.activity.lastActivity")}{" "}
        <span className="font-medium text-slate-800">
          {formatLastActivity(data.lastActivityAt, t)}
        </span>
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        <Link
          href="/bookings"
          className="text-sm font-medium text-teal-800 hover:text-teal-950 underline-offset-2 hover:underline"
        >
          {t("profile.activity.viewBookings")}
        </Link>
        <Link
          href="/consultations"
          className="text-sm font-medium text-teal-800 hover:text-teal-950 underline-offset-2 hover:underline"
        >
          {t("profile.activity.viewConsultations")}
        </Link>
        {role === "PATIENT" ? (
          <Link
            href="/transactions"
            className="text-sm font-medium text-teal-800 hover:text-teal-950 underline-offset-2 hover:underline"
          >
            {t("profile.activity.viewTransactions")}
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
  const { t } = useLanguage();
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
              : t("profile.activity.loadError"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, t]);

  if (!enabled) return null;

  return (
    <div className={`${cardSurface} mx-auto max-w-lg space-y-4`}>
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          {t("profile.activity.title")}
        </h2>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          {t("profile.activity.desc")}
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
              label={t("profile.activity.admin.pendingVerifications")}
              value={summary.pendingVerifications}
            />
            <Stat
              label={t("profile.activity.admin.pendingTransactions")}
              value={summary.transactionsPending}
            />
            <Stat
              label={t("profile.activity.admin.openConsultations")}
              value={summary.consultationsActive}
            />
          </dl>
          <Link
            href="/admin/dashboard"
            className="inline-flex text-sm font-medium text-teal-800 hover:text-teal-950 underline-offset-2 hover:underline"
          >
            {t("profile.activity.admin.openDashboard")}
          </Link>
        </>
      ) : summary &&
        (summary.role === "PATIENT" || summary.role === "PHYSIOTHERAPIST") ? (
        <PatientTherapistSummary data={summary} role={summary.role} />
      ) : null}
    </div>
  );
}
