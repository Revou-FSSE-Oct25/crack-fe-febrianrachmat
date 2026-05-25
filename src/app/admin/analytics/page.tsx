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
import {
  getAdminDashboardAnalytics,
  type AdminDashboardAnalytics,
} from "@/lib/api/admin-dashboard";
import { ApiRequestError } from "@/lib/api/client";
import { formatIdr, parseMoney } from "@/lib/format/currency";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const PERIOD_OPTIONS = [7, 14, 30, 60, 90] as const;

export default function AdminAnalyticsPage() {
  const { user, isReady } = useAuth();
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
          : "Gagal memuat analytics.",
      );
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    if (!isReady || user?.role !== "ADMIN") return;
    void load();
  }, [isReady, user?.role, load]);

  if (!isReady) {
    return <PageLoading label="Memuat analytics…" />;
  }

  if (!user) {
    return <SignInRequired message="Masuk sebagai admin untuk analytics." />;
  }

  if (user.role !== "ADMIN") {
    return (
      <main className={adminPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader title="Akses ditolak" description="Hanya admin." />
          <Link href="/" className="text-sm font-semibold text-teal-700">
            Beranda
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
          title="Analytics"
          description="Tren aktivitas, pendapatan, distribusi ulasan, dan performa terapis dalam periode yang dipilih."
        />
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="analytics-days" className="sr-only">
            Periode (hari)
          </label>
          <select
            id="analytics-days"
            className={`${inputBase} min-w-[8rem]`}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            {PERIOD_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} hari terakhir
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className={`${btnOutline} min-h-[44px] px-5`}
          >
            {loading ? "Memuat…" : "Muat ulang"}
          </button>
        </div>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading && !data ? (
        <ListSkeleton rows={4} />
      ) : !data ? (
        <EmptyState
          title="Tidak ada data analytics"
          actions={[{ href: "/admin/dashboard", label: "Dashboard" }]}
        />
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-slate-600">
            Periode: {data.periodDays} hari (sejak{" "}
            {new Date(data.periodStart).toLocaleDateString("id-ID")}) ·{" "}
            {data.auditLogsInPeriod} entri audit log · diperbarui{" "}
            {new Date(data.generatedAt).toLocaleString("id-ID")}
          </p>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Pendapatan harian (PAID)
              </h2>
              <TrendBars
                labels={data.trends.labels}
                values={data.trends.paidRevenue}
                formatValue={(n) => formatIdr(n)}
              />
            </div>
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Pengguna baru / hari
              </h2>
              <TrendBars labels={data.trends.labels} values={data.trends.newUsers} />
            </div>
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Booking baru / hari
              </h2>
              <TrendBars
                labels={data.trends.labels}
                values={data.trends.newBookings}
              />
            </div>
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Konsultasi baru / hari
              </h2>
              <TrendBars
                labels={data.trends.labels}
                values={data.trends.newConsultations}
              />
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Mix pembayaran (PAID)
              </h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Transaksi booking</dt>
                  <dd className="font-medium tabular-nums">
                    {data.paymentMix.paidBookingCount}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Transaksi konsultasi</dt>
                  <dd className="font-medium tabular-nums">
                    {data.paymentMix.paidConsultationCount}
                  </dd>
                </div>
              </dl>
              <div className="pt-2 border-t border-slate-100 space-y-1 text-sm">
                <p>
                  Revenue booking:{" "}
                  <strong>
                    {formatIdr(parseMoney(data.paymentMix.paidBookingRevenue))}
                  </strong>
                </p>
                <p>
                  Revenue konsultasi:{" "}
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
                Ulasan (publik)
              </h2>
              <p className="text-2xl font-bold text-slate-900">
                {data.reviews.averageRating != null
                  ? `${data.reviews.averageRating.toFixed(1)} ★`
                  : "—"}
                <span className="text-sm font-normal text-slate-500 ml-2">
                  rata-rata
                </span>
              </p>
              <div className="space-y-2">
                {data.reviews.ratingDistribution.map((row) => (
                  <StatBar
                    key={row.rating}
                    label={`${row.rating} bintang`}
                    value={row.count}
                    max={maxRating}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                Kunjungan: {data.reviews.bySource.booking} · Konsultasi:{" "}
                {data.reviews.bySource.consultation}
              </p>
            </div>

            <div className={`${cardSurface} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Top terapis (rating)
              </h2>
              {data.topTherapistsByRating.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada ulasan publik.</p>
              ) : (
                <ol className="space-y-3">
                  {data.topTherapistsByRating.map((t, i) => (
                    <li key={t.physiotherapistId} className="text-sm">
                      <span className="font-semibold text-slate-900">
                        {i + 1}. {t.fullName}
                      </span>
                      <span className="text-slate-600 block">
                        {t.averageRating?.toFixed(1) ?? "—"} ★ · {t.reviewCount}{" "}
                        ulasan
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
            <Link href="/admin/dashboard" className={`${btnOutline} min-h-[44px] px-5`}>
              ← Dashboard ringkas
            </Link>
            <Link href="/admin/audit-logs" className={`${btnOutline} min-h-[44px] px-5`}>
              Audit log
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
