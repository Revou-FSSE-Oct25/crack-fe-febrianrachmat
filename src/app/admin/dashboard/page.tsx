"use client";

import { useAuth } from "@/contexts/auth-context";
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
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function parseMoney(v: string | number): number {
  if (typeof v === "number") return v;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function formatIdr(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 min-h-[160px]"
        >
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-[85%] rounded bg-slate-100" />
            <div className="h-4 w-[60%] rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function OverviewCards({ data }: { data: AdminDashboardOverview }) {
  const cardBase =
    "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md hover:ring-slate-900/10";

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <section className={`${cardBase} border-l-4 border-l-teal-500`}>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Pengguna
        </h2>
        <dl className="mt-5 space-y-2.5 text-slate-800 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Total</dt>
            <dd className="font-semibold tabular-nums">{data.users.total}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Pasien</dt>
            <dd className="tabular-nums">{data.users.patients}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Fisioterapis</dt>
            <dd className="tabular-nums">{data.users.physiotherapists}</dd>
          </div>
        </dl>
      </section>

      <section className={`${cardBase} border-l-4 border-l-amber-400`}>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Verifikasi fisioterapis
        </h2>
        <dl className="mt-5 space-y-2.5 text-slate-800 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Menunggu</dt>
            <dd className="font-semibold tabular-nums text-amber-700">
              {data.physiotherapistVerification.pending}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Disetujui</dt>
            <dd className="tabular-nums text-emerald-700">
              {data.physiotherapistVerification.approved}
            </dd>
          </div>
        </dl>
        <Link
          href="/admin/physiotherapists"
          className="mt-5 inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-600"
        >
          Kelola antrian verifikasi
          <span aria-hidden className="ml-1">
            →
          </span>
        </Link>
      </section>

      <section className={`${cardBase} border-l-4 border-l-sky-500`}>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Booking
        </h2>
        <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {data.bookings.total}
        </p>
        <p className="text-xs text-slate-500 mt-1">Total booking</p>
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
        className={`${cardBase} md:col-span-2 xl:col-span-2 border-l-4 border-l-emerald-500`}
      >
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Transaksi
        </h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-6">
          <div className="rounded-xl bg-teal-50/80 px-4 py-3 ring-1 ring-teal-900/5">
            <p className="text-xs font-medium text-slate-600">Pendapatan (PAID)</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-teal-800">
              {formatIdr(parseMoney(data.transactions.totalRevenuePaid))}
            </p>
          </div>
          <div className="rounded-xl bg-red-50/80 px-4 py-3 ring-1 ring-red-900/5">
            <p className="text-xs font-medium text-slate-600">Total refund</p>
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

      <section className={`${cardBase} border-l-4 border-l-violet-500`}>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Ulasan
        </h2>
        <dl className="mt-5 space-y-2.5 text-slate-800 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Total</dt>
            <dd className="font-semibold tabular-nums">{data.reviews.total}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Disembunyikan</dt>
            <dd className="tabular-nums">{data.reviews.hidden}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isReady } = useAuth();
  const [data, setData] = useState<AdminDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await getAdminDashboardOverview();
      setData(overview);
    } catch (err) {
      setData(null);
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal memuat ringkasan dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady || user?.role !== "ADMIN") return;
    void load();
  }, [isReady, user?.role, load]);

  if (!isReady) {
    return <PageLoading label="Memuat dashboard…" />;
  }

  if (!user) {
    return (
      <SignInRequired message="Silakan masuk sebagai admin untuk melihat ringkasan." />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className={adminPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader
            eyebrow="Admin"
            title="Akses ditolak"
            description="Halaman ini hanya untuk peran Admin."
          />
          <Link href="/" className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800">
            Kembali ke beranda
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
            title="Dashboard"
            description="Ringkasan pengguna, booking, transaksi, dan ulasan dari endpoint ringkasan admin."
          />
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className={btnOutline}
          >
            {loading ? "Memuat…" : "Muat ulang"}
          </button>
        </div>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading && !data ? (
        <DashboardSkeleton />
      ) : data ? (
        <>
          <OverviewCards data={data} />
          <div className="flex flex-wrap gap-3 sm:gap-4 border-t border-slate-200 pt-8">
            <Link
              href="/admin/physiotherapists"
              className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-teal-800 ring-1 ring-slate-200 hover:bg-teal-50 hover:ring-teal-200 transition-colors"
            >
              Verifikasi fisioterapis →
            </Link>
            <Link
              href="/admin/categories"
              className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-teal-800 ring-1 ring-slate-200 hover:bg-teal-50 hover:ring-teal-200 transition-colors"
            >
              Kelola kategori →
            </Link>
            <Link
              href="/admin/reviews"
              className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-teal-800 ring-1 ring-slate-200 hover:bg-teal-50 hover:ring-teal-200 transition-colors"
            >
              Moderasi ulasan →
            </Link>
            <Link
              href="/transactions"
              className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-teal-800 ring-1 ring-slate-200 hover:bg-teal-50 hover:ring-teal-200 transition-colors"
            >
              Transaksi &amp; refund →
            </Link>
            <Link
              href="/admin/notifications"
              className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-teal-800 ring-1 ring-slate-200 hover:bg-teal-50 hover:ring-teal-200 transition-colors"
            >
              Broadcast notifikasi →
            </Link>
          </div>
        </>
      ) : !error ? (
        <p className="text-slate-600">Tidak ada data.</p>
      ) : null}
    </main>
  );
}
