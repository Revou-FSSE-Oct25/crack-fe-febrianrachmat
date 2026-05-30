"use client";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  adminPageShell,
  AlertBanner,
  btnOutline,
  cardSurface,
  PageHeader,
  PageLoading,
  SignInRequired,
} from "@/components/ui/page-shell";
import {
  getAdminDashboardOverview,
  type AdminDashboardOverview,
} from "@/lib/api/admin-dashboard";
import { formatIdr, parseMoney } from "@/lib/format/currency";
import {
  getAdminOperationsQueue,
  type AdminOperationsQueue,
} from "@/lib/api/admin-operations";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`${cardSurface} min-h-[160px]`}
        >
          <div className="h-3 w-24 rounded-lg bg-slate-200" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full rounded-lg bg-slate-100" />
            <div className="h-4 w-[85%] rounded-lg bg-slate-100" />
            <div className="h-4 w-[60%] rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function OverviewCards({ data }: { data: AdminDashboardOverview }) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <section className={`${cardSurface} border-l-4 border-l-teal-500`}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("admin.dashboard.users")}
        </h2>
        <dl className="mt-5 space-y-2.5 text-slate-800 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">{t("admin.common.total")}</dt>
            <dd className="font-semibold tabular-nums">{data.users.total}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">{t("admin.dashboard.patients")}</dt>
            <dd className="tabular-nums">{data.users.patients}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">{t("admin.dashboard.physiotherapists")}</dt>
            <dd className="tabular-nums">{data.users.physiotherapists}</dd>
          </div>
        </dl>
      </section>

      <section className={`${cardSurface} border-l-4 border-l-amber-400`}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("admin.dashboard.physioVerification")}
        </h2>
        <dl className="mt-5 space-y-2.5 text-slate-800 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">{t("admin.dashboard.pending")}</dt>
            <dd className="font-semibold tabular-nums text-amber-700">
              {data.physiotherapistVerification.pending}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">{t("admin.dashboard.approved")}</dt>
            <dd className="tabular-nums text-emerald-700">
              {data.physiotherapistVerification.approved}
            </dd>
          </div>
        </dl>
        <Link
          href="/admin/physiotherapists"
          className="mt-5 inline-flex items-center text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          {t("admin.dashboard.manageVerificationQueue")}
          <span aria-hidden className="ml-1">
            →
          </span>
        </Link>
      </section>

      <section className={`${cardSurface} border-l-4 border-l-indigo-500`}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("admin.dashboard.onlineConsultations")}
        </h2>
        <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {data.consultations.total}
        </p>
        <ul className="mt-4 space-y-2 text-sm border-t border-slate-100 pt-4 max-h-36 overflow-y-auto">
          {data.consultations.byStatus.map((row) => (
            <li key={row.status} className="flex justify-between gap-2">
              <span className="text-slate-600">{row.status}</span>
              <span className="tabular-nums font-medium">{row._count._all}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${cardSurface} border-l-4 border-l-sky-500`}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("admin.dashboard.booking")}
        </h2>
        <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {data.bookings.total}
        </p>
        <p className="text-xs text-slate-500 mt-1">{t("admin.dashboard.totalBookings")}</p>
        <ul className="mt-4 space-y-2 text-sm border-t border-slate-100 pt-4">
          {data.bookings.byStatus.map((row) => (
            <li key={row.status} className="flex justify-between gap-2">
              <span className="text-slate-600">{row.status}</span>
              <span className="tabular-nums font-medium">{row._count._all}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        className={`${cardSurface} md:col-span-2 xl:col-span-2 border-l-4 border-l-emerald-500`}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("admin.dashboard.transactions")}
        </h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-6">
          <div className="rounded-xl bg-teal-50/80 px-4 py-3 ring-1 ring-teal-900/5">
            <p className="text-xs font-medium text-slate-600">{t("admin.dashboard.revenuePaid")}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-teal-800">
              {formatIdr(parseMoney(data.transactions.totalRevenuePaid))}
            </p>
          </div>
          <div className="rounded-xl bg-red-50/80 px-4 py-3 ring-1 ring-red-900/5">
            <p className="text-xs font-medium text-slate-600">{t("admin.dashboard.totalRefund")}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-red-800">
              {formatIdr(parseMoney(data.transactions.totalRefundAmount))}
            </p>
          </div>
        </div>
        <ul className="mt-5 space-y-2 text-sm border-t border-slate-100 pt-4">
          {data.transactions.byStatus.map((row) => (
            <li key={row.status} className="flex justify-between gap-2">
              <span className="text-slate-600">{row.status}</span>
              <span className="tabular-nums font-medium">{row._count._all}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${cardSurface} border-l-4 border-l-violet-500`}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("admin.dashboard.reviews")}
        </h2>
        <p className="mt-3 text-2xl font-bold text-slate-900">
          {data.reviews.averageRating != null
            ? `${data.reviews.averageRating.toFixed(1)} ★`
            : "—"}
          <span className="text-sm font-normal text-slate-500 ml-1">{t("admin.common.average")}</span>
        </p>
        <dl className="mt-4 space-y-2.5 text-slate-800 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">{t("admin.common.total")}</dt>
            <dd className="font-semibold tabular-nums">{data.reviews.total}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">{t("admin.dashboard.public")}</dt>
            <dd className="tabular-nums">{data.reviews.visible}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">{t("admin.dashboard.hidden")}</dt>
            <dd className="tabular-nums">{data.reviews.hidden}</dd>
          </div>
        </dl>
        <Link
          href="/admin/analytics"
          className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          {t("admin.dashboard.viewFullAnalytics")}
        </Link>
      </section>

      <section className={`${cardSurface} border-l-4 border-l-slate-500`}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("admin.dashboard.auditLog")}
        </h2>
        <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">
          {data.auditLogs.total}
        </p>
        <p className="text-xs text-slate-500 mt-1">{t("admin.dashboard.totalEntriesStored")}</p>
        <Link
          href="/admin/audit-logs"
          className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          {t("admin.dashboard.openAuditLog")}
        </Link>
      </section>
    </div>
  );
}

function OperationsQueueBanner({ queue }: { queue: AdminOperationsQueue }) {
  const { t } = useLanguage();
  const { counts } = queue;
  const urgent =
    counts.pendingTransactions + counts.pendingPhysiotherapistVerifications;
  if (urgent === 0) return null;

  return (
    <div
      className={`${cardSurface} border-l-4 border-l-amber-500 bg-amber-50/50 p-5`}
    >
      <h2 className="text-sm font-semibold text-amber-950">
        {t("admin.dashboard.operationalQueue")}
      </h2>
      <p className="mt-1 text-sm text-amber-900/90">
        {counts.pendingTransactions > 0
          ? `${counts.pendingTransactions} ${t("admin.dashboard.txAwaiting")} `
          : null}
        {counts.pendingPhysiotherapistVerifications > 0
          ? `${counts.pendingPhysiotherapistVerifications} ${t("admin.dashboard.physioVerifAwaiting")}`
          : null}
      </p>
      <Link
        href="/admin/operations"
        className="mt-4 inline-flex text-sm font-semibold text-teal-800 hover:text-teal-900"
      >
        {t("admin.dashboard.openOperationalPanel")}
      </Link>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isReady } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<AdminDashboardOverview | null>(null);
  const [queue, setQueue] = useState<AdminOperationsQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, operationsQueue] = await Promise.all([
        getAdminDashboardOverview(),
        getAdminOperationsQueue(),
      ]);
      setData(overview);
      setQueue(operationsQueue);
    } catch (err) {
      setData(null);
      setQueue(null);
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("admin.dashboard.errLoad"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isReady || user?.role !== "ADMIN") return;
    void load();
  }, [isReady, user?.role, load]);

  if (!isReady) {
    return <PageLoading label={t("admin.dashboard.loading")} />;
  }

  if (!user) {
    return (
      <SignInRequired message={t("admin.dashboard.signIn")} />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className={adminPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader
            eyebrow="Admin"
            title={t("admin.common.accessDenied")}
            description={t("admin.common.adminOnly")}
          />
          <Link href="/" className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800">
            {t("admin.common.backHome")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={adminPageShell}>
      <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-white to-teal-50/40 p-6 sm:p-8 shadow-sm ring-1 ring-slate-900/5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <PageHeader
            eyebrow="Admin"
            title={t("admin.dashboard.title")}
            description={t("admin.dashboard.description")}
          />
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className={`${btnOutline} min-h-[44px] px-5`}
          >
            {loading ? t("admin.common.loading") : t("admin.common.reload")}
          </button>
        </div>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {queue ? <OperationsQueueBanner queue={queue} /> : null}

      {loading && !data ? (
        <DashboardSkeleton />
      ) : data ? (
        <>
          <OverviewCards data={data} />
          <div className="flex flex-wrap gap-3 sm:gap-4 border-t border-slate-200 pt-8">
            <Link
              href="/admin/analytics"
              className={`${btnOutline} min-h-[44px] items-center justify-center border-teal-200 bg-teal-50 text-teal-950`}
            >
              {t("admin.dashboard.navAnalytics")}
            </Link>
            <Link
              href="/admin/operations"
              className={`${btnOutline} min-h-[44px] items-center justify-center border-amber-200 bg-amber-50 text-amber-950`}
            >
              {t("admin.dashboard.navOperational")}
            </Link>
            <Link
              href="/admin/physiotherapists"
              className={`${btnOutline} min-h-[44px] items-center justify-center`}
            >
              {t("admin.dashboard.navPhysioVerify")}
            </Link>
            <Link
              href="/admin/categories"
              className={`${btnOutline} min-h-[44px] items-center justify-center`}
            >
              {t("admin.dashboard.navCategories")}
            </Link>
            <Link
              href="/admin/reviews"
              className={`${btnOutline} min-h-[44px] items-center justify-center`}
            >
              {t("admin.dashboard.navReviews")}
            </Link>
            <Link
              href="/admin/audit-logs"
              className={`${btnOutline} min-h-[44px] items-center justify-center`}
            >
              {t("admin.dashboard.navAudit")}
            </Link>
            <Link
              href="/transactions"
              className={`${btnOutline} min-h-[44px] items-center justify-center`}
            >
              {t("admin.dashboard.navTransactions")}
            </Link>
            <Link
              href="/admin/notifications"
              className={`${btnOutline} min-h-[44px] items-center justify-center`}
            >
              {t("admin.dashboard.navNotifications")}
            </Link>
          </div>
        </>
      ) : !error ? (
        <p className="text-slate-600">{t("admin.dashboard.noData")}</p>
      ) : null}
    </main>
  );
}
