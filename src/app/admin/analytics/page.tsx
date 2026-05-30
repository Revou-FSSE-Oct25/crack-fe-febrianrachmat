"use client";

import { StatBar, TrendBars } from "@/components/admin/StatBar";
import {
  adminPageShell,
  AdminBreadcrumb,
  AlertBanner,
  btnOutline,
  cardSurface,
  EmptyState,
  inputBase,
  ListSkeleton,
  PageHeader,
  PageLoading,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import {
  getAdminDashboardAnalytics,
  type AdminDashboardAnalytics,
} from "@/lib/api/admin-dashboard";
import { ApiRequestError } from "@/lib/api/client";
import { formatIdr, parseMoney } from "@/lib/format/currency";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const PERIOD_OPTIONS = [7, 14, 30, 60, 90] as const;
const asPercent = (v: number): string => `${(v * 100).toFixed(1)}%`;

function wowDeltaLabel(
  values: number[],
  t: (key: string) => string,
): string {
  if (values.length < 2) return t("admin.analytics.insufficientPrevWeek");
  const current = values[values.length - 1] ?? 0;
  const prev = values[values.length - 2] ?? 0;
  const delta = current - prev;
  const pct = prev > 0 ? (delta / prev) * 100 : current > 0 ? 100 : 0;
  const direction =
    delta > 0
      ? t("admin.analytics.directionUp")
      : delta < 0
        ? t("admin.analytics.directionDown")
        : t("admin.analytics.directionStable");
  return `${direction} ${Math.abs(pct).toFixed(1)}% (${t("admin.analytics.wowThisWeek")} ${current}, ${t("admin.analytics.wowLastWeek")} ${prev})`;
}

function wowDirection(values: number[]): "up" | "down" | "flat" {
  if (values.length < 2) return "flat";
  const current = values[values.length - 1] ?? 0;
  const prev = values[values.length - 2] ?? 0;
  if (current > prev) return "up";
  if (current < prev) return "down";
  return "flat";
}

function wowTone(
  values: number[],
  mode: "higher_is_better" | "lower_is_better" | "informational",
): "good" | "bad" | "neutral" {
  if (values.length < 2) return "neutral";
  if (mode === "informational") return "neutral";
  const current = values[values.length - 1] ?? 0;
  const prev = values[values.length - 2] ?? 0;
  if (current === prev) return "neutral";
  const increased = current > prev;
  if (mode === "higher_is_better") {
    return increased ? "good" : "bad";
  }
  return increased ? "bad" : "good";
}

function wowCardToneClass(tone: "good" | "bad" | "neutral"): string {
  if (tone === "good") {
    return "border-emerald-200 bg-emerald-50";
  }
  if (tone === "bad") {
    return "border-rose-200 bg-rose-50";
  }
  return "border-slate-200 bg-slate-50";
}

function wowDirectionIcon(direction: "up" | "down" | "flat"): string {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  return "→";
}

export default function AdminAnalyticsPage() {
  const { user, isReady } = useAuth();
  const { t } = useLanguage();
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<AdminDashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const analytics = await getAdminDashboardAnalytics({ days });
      setData(analytics);
    } catch (err) {
      setData(null);
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("admin.analytics.errLoad"),
      );
    } finally {
      setLoading(false);
    }
  }, [days, t]);

  useEffect(() => {
    if (!isReady || user?.role !== "ADMIN") return;
    void load();
  }, [isReady, user?.role, load]);

  if (!isReady) {
    return <PageLoading label={t("admin.analytics.loading")} />;
  }

  if (!user) {
    return <SignInRequired message={t("admin.analytics.signIn")} />;
  }

  if (user.role !== "ADMIN") {
    return (
      <main className={adminPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader title={t("admin.common.accessDenied")} description={t("admin.analytics.onlyAdminShort")} />
          <Link href="/" className="text-sm font-semibold text-teal-700">
            {t("admin.analytics.home")}
          </Link>
        </div>
      </main>
    );
  }

  const maxRating = data
    ? Math.max(1, ...data.reviews.ratingDistribution.map((r) => r.count))
    : 1;

  return (
    <main className={adminPageShell}>
      <AdminBreadcrumb />

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Admin"
          title={t("admin.analytics.title")}
          description={t("admin.analytics.description")}
        />
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="analytics-days" className="sr-only">
            {t("admin.analytics.periodDays")}
          </label>
          <select
            id="analytics-days"
            className={`${inputBase} min-w-[8rem]`}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            {PERIOD_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} {t("admin.analytics.daysOption")}
              </option>
            ))}
          </select>
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

      {loading && !data ? (
        <ListSkeleton rows={4} />
      ) : !data ? (
        <EmptyState
          title={t("admin.analytics.noData")}
          actions={[{ href: "/admin/dashboard", label: t("admin.common.dashboard") }]}
        />
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-slate-600">
            {t("admin.analytics.periodLabel")} {data.periodDays} {t("admin.analytics.daysWord")} ({t("admin.analytics.sinceWord")}{" "}
            {new Date(data.periodStart).toLocaleDateString("id-ID")}) ·{" "}
            {data.auditLogsInPeriod} {t("admin.analytics.auditEntriesSuffix")} · {t("admin.analytics.updatedWord")}{" "}
            {new Date(data.generatedAt).toLocaleString("id-ID")}
          </p>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.analytics.dailyRevenuePaid")}
              </h2>
              <TrendBars
                labels={data.trends.labels}
                values={data.trends.paidRevenue}
                formatValue={(n) => formatIdr(n)}
              />
            </div>
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.analytics.newUsersPerDay")}
              </h2>
              <TrendBars labels={data.trends.labels} values={data.trends.newUsers} />
            </div>
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.analytics.newBookingsPerDay")}
              </h2>
              <TrendBars
                labels={data.trends.labels}
                values={data.trends.newBookings}
              />
            </div>
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.analytics.newConsultationsPerDay")}
              </h2>
              <TrendBars
                labels={data.trends.labels}
                values={data.trends.newConsultations}
              />
            </div>
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.analytics.bookingCompletedPerDay")}
              </h2>
              <TrendBars
                labels={data.trends.labels}
                values={data.trends.bookingCompleted}
              />
            </div>
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.analytics.bookingCancelledPerDay")}
              </h2>
              <TrendBars
                labels={data.trends.labels}
                values={data.trends.bookingCancelled}
              />
            </div>
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.analytics.noShowPerDay")}
              </h2>
              <TrendBars
                labels={data.trends.labels}
                values={data.trends.bookingNoShowEstimated}
              />
            </div>
          </section>

          <section className={`${cardSurface} space-y-4`}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {t("admin.analytics.weeklyOperationalSummary")}
            </h2>
            <p className="text-sm text-slate-600">
              Bucket {data.operationalWeekly.bucketDays} {t("admin.analytics.bucketDaysDesc")}
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div
                className={`rounded-xl border p-3 ${wowCardToneClass(
                  wowTone(
                    data.operationalWeekly.bookingCompleted,
                    "higher_is_better",
                  ),
                )}`}
              >
                <p className="text-xs uppercase tracking-wide text-slate-500 flex items-center justify-between gap-2">
                  {t("admin.analytics.bookingSuccess")}
                  <span className="text-sm font-semibold text-slate-700">
                    {wowDirectionIcon(
                      wowDirection(data.operationalWeekly.bookingCompleted),
                    )}
                  </span>
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {wowDeltaLabel(data.operationalWeekly.bookingCompleted, t)}
                </p>
              </div>
              <div
                className={`rounded-xl border p-3 ${wowCardToneClass(
                  wowTone(
                    data.operationalWeekly.bookingCancelled,
                    "lower_is_better",
                  ),
                )}`}
              >
                <p className="text-xs uppercase tracking-wide text-slate-500 flex items-center justify-between gap-2">
                  {t("admin.analytics.cancelled")}
                  <span className="text-sm font-semibold text-slate-700">
                    {wowDirectionIcon(
                      wowDirection(data.operationalWeekly.bookingCancelled),
                    )}
                  </span>
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {wowDeltaLabel(data.operationalWeekly.bookingCancelled, t)}
                </p>
              </div>
              <div
                className={`rounded-xl border p-3 ${wowCardToneClass(
                  wowTone(
                    data.operationalWeekly.bookingNoShowEstimated,
                    "lower_is_better",
                  ),
                )}`}
              >
                <p className="text-xs uppercase tracking-wide text-slate-500 flex items-center justify-between gap-2">
                  {t("admin.analytics.noShowEstimated")}
                  <span className="text-sm font-semibold text-slate-700">
                    {wowDirectionIcon(
                      wowDirection(data.operationalWeekly.bookingNoShowEstimated),
                    )}
                  </span>
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {wowDeltaLabel(data.operationalWeekly.bookingNoShowEstimated, t)}
                </p>
              </div>
              <div
                className={`rounded-xl border p-3 ${wowCardToneClass(
                  wowTone(data.operationalWeekly.totalOperational, "informational"),
                )}`}
              >
                <p className="text-xs uppercase tracking-wide text-slate-500 flex items-center justify-between gap-2">
                  {t("admin.analytics.totalOperational")}
                  <span className="text-sm font-semibold text-slate-700">
                    {wowDirectionIcon(
                      wowDirection(data.operationalWeekly.totalOperational),
                    )}
                  </span>
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {wowDeltaLabel(data.operationalWeekly.totalOperational, t)}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.analytics.operationalKpi")}
              </h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">{t("admin.analytics.bookingSuccess")}</dt>
                  <dd className="font-medium tabular-nums">
                    {asPercent(data.operationalKpis.bookingSuccessRate)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">{t("admin.analytics.cancelRate")}</dt>
                  <dd className="font-medium tabular-nums">
                    {asPercent(data.operationalKpis.cancelRate)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">{t("admin.analytics.noShowRate")}</dt>
                  <dd className="font-medium tabular-nums">
                    {asPercent(data.operationalKpis.noShowRate)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">{t("admin.analytics.repeatPatient")}</dt>
                  <dd className="font-medium tabular-nums">
                    {asPercent(data.operationalKpis.repeatPatientRate)}
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                {t("admin.analytics.basisPrefix")} {t("admin.analytics.basisSuccess")} {data.operationalKpis.totals.completed} ·
                {" "}{t("admin.analytics.basisCancel")} {data.operationalKpis.totals.cancelled} · {t("admin.analytics.basisNoShow")}{" "}
                {data.operationalKpis.totals.noShowEstimated}
              </p>
            </div>
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.analytics.paymentMix")}
              </h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">{t("admin.analytics.bookingTransactions")}</dt>
                  <dd className="font-medium tabular-nums">
                    {data.paymentMix.paidBookingCount}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">{t("admin.analytics.consultationTransactions")}</dt>
                  <dd className="font-medium tabular-nums">
                    {data.paymentMix.paidConsultationCount}
                  </dd>
                </div>
              </dl>
              <div className="pt-2 border-t border-slate-100 space-y-1 text-sm">
                <p>
                  {t("admin.analytics.revenueBooking")}{" "}
                  <strong>
                    {formatIdr(parseMoney(data.paymentMix.paidBookingRevenue))}
                  </strong>
                </p>
                <p>
                  {t("admin.analytics.revenueConsultation")}{" "}
                  <strong>
                    {formatIdr(
                      parseMoney(data.paymentMix.paidConsultationRevenue),
                    )}
                  </strong>
                </p>
              </div>
            </div>

            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.analytics.reviewsPublic")}
              </h2>
              <p className="text-2xl font-bold text-slate-900">
                {data.reviews.averageRating != null
                  ? `${data.reviews.averageRating.toFixed(1)} ★`
                  : "—"}
                <span className="text-sm font-normal text-slate-500 ml-2">
                  {t("admin.common.average")}
                </span>
              </p>
              <div className="space-y-2">
                {data.reviews.ratingDistribution.map((row) => (
                  <StatBar
                    key={row.rating}
                    label={`${row.rating} ${t("admin.analytics.starWord")}`}
                    value={row.count}
                    max={maxRating}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                {t("admin.analytics.reviewVisit")}: {data.reviews.bySource.booking} · {t("admin.analytics.reviewConsultation")}:{" "}
                {data.reviews.bySource.consultation}
              </p>
            </div>

            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.analytics.topTherapistsRating")}
              </h2>
              {data.topTherapistsByRating.length === 0 ? (
                <p className="text-sm text-slate-500">{t("admin.analytics.noPublicReviews")}</p>
              ) : (
                <ol className="space-y-3">
                  {data.topTherapistsByRating.map((therapist, i) => (
                    <li key={therapist.physiotherapistId} className="text-sm">
                      <span className="font-semibold text-slate-900">
                        {i + 1}. {therapist.fullName}
                      </span>
                      <span className="text-slate-600 block">
                        {therapist.averageRating?.toFixed(1) ?? "—"} ★ · {therapist.reviewCount}{" "}
                        {t("admin.analytics.reviewsWord")}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.analytics.topPhysioCompleted")}
              </h2>
              {data.topPhysiotherapistsByCompletedBookings.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {t("admin.analytics.noCompletedBookings")}
                </p>
              ) : (
                <ol className="space-y-3">
                  {data.topPhysiotherapistsByCompletedBookings.map((physio, i) => (
                    <li key={physio.physiotherapistId} className="text-sm">
                      <span className="font-semibold text-slate-900">
                        {i + 1}. {physio.fullName}
                      </span>
                      <span className="text-slate-600 block">
                        {physio.completedBookingCount} {t("admin.analytics.bookingCompletedWord")}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
            <Link href="/admin/dashboard" className={`${btnOutline} min-h-[44px] px-5`}>
              {t("admin.analytics.dashboardSummaryLink")}
            </Link>
            <Link href="/admin/audit-logs" className={`${btnOutline} min-h-[44px] px-5`}>
              {t("admin.dashboard.auditLog")}
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
