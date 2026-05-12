"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
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

function OverviewCards({ data }: { data: AdminDashboardOverview }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <section className="border rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Pengguna
        </h2>
        <dl className="mt-4 space-y-2 text-gray-900">
          <div className="flex justify-between">
            <dt>Total</dt>
            <dd className="font-semibold">{data.users.total}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Pasien</dt>
            <dd>{data.users.patients}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Fisioterapis</dt>
            <dd>{data.users.physiotherapists}</dd>
          </div>
        </dl>
      </section>

      <section className="border rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Verifikasi fisioterapis
        </h2>
        <dl className="mt-4 space-y-2 text-gray-900">
          <div className="flex justify-between">
            <dt>Menunggu</dt>
            <dd className="font-semibold text-amber-700">
              {data.physiotherapistVerification.pending}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Disetujui</dt>
            <dd className="text-green-700">
              {data.physiotherapistVerification.approved}
            </dd>
          </div>
        </dl>
        <Link
          href="/admin/physiotherapists"
          className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline"
        >
          Kelola antrian verifikasi →
        </Link>
      </section>

      <section className="border rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Booking
        </h2>
        <p className="mt-4 text-3xl font-bold text-gray-900">{data.bookings.total}</p>
        <p className="text-xs text-gray-500 mt-1">Total booking</p>
        <ul className="mt-4 space-y-1 text-sm border-t pt-3">
          {data.bookings.byStatus.map((row) => (
            <li key={row.status} className="flex justify-between gap-2">
              <span className="text-gray-600">{row.status}</span>
              <span>{row._count._all}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border rounded-xl p-6 bg-white shadow-sm md:col-span-2 xl:col-span-2">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Transaksi
        </h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Pendapatan (PAID)</p>
            <p className="text-xl font-semibold text-teal-700">
              {formatIdr(parseMoney(data.transactions.totalRevenuePaid))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total refund</p>
            <p className="text-xl font-semibold text-red-700">
              {formatIdr(parseMoney(data.transactions.totalRefundAmount))}
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-1 text-sm border-t pt-3">
          {data.transactions.byStatus.map((row) => (
            <li key={row.status} className="flex justify-between gap-2">
              <span className="text-gray-600">{row.status}</span>
              <span>{row._count._all}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Ulasan
        </h2>
        <dl className="mt-4 space-y-2 text-gray-900">
          <div className="flex justify-between">
            <dt>Total</dt>
            <dd className="font-semibold">{data.reviews.total}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Disembunyikan</dt>
            <dd>{data.reviews.hidden}</dd>
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
    return (
      <main className="max-w-6xl mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-6xl mx-auto py-16 px-6 text-center space-y-4">
        <p>Silakan masuk sebagai admin.</p>
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className="max-w-6xl mx-auto py-16 px-6 space-y-4">
        <h1 className="text-2xl font-bold">Akses ditolak</h1>
        <p className="text-gray-700">
          Halaman ini hanya untuk peran Admin.
        </p>
        <Link href="/" className="text-teal-600 underline">
          Kembali ke beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto py-12 px-6 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-teal-700 font-medium">Admin</p>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Ringkasan analytics dari endpoint{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">
              GET /admin/dashboard/overview
            </code>
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Muat ulang
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {loading && !data ? (
        <p className="text-gray-600">Memuat data ringkasan…</p>
      ) : data ? (
        <>
          <OverviewCards data={data} />
          <div className="flex flex-wrap gap-6 border-t border-gray-200 pt-8 text-sm">
            <Link
              href="/admin/physiotherapists"
              className="font-medium text-teal-700 hover:underline"
            >
              Verifikasi fisioterapis →
            </Link>
            <Link
              href="/admin/categories"
              className="font-medium text-teal-700 hover:underline"
            >
              Kelola kategori →
            </Link>
            <Link
              href="/admin/reviews"
              className="font-medium text-teal-700 hover:underline"
            >
              Moderasi ulasan →
            </Link>
            <Link
              href="/transactions"
              className="font-medium text-teal-700 hover:underline"
            >
              Transaksi &amp; refund →
            </Link>
            <Link
              href="/admin/notifications"
              className="font-medium text-teal-700 hover:underline"
            >
              Broadcast notifikasi →
            </Link>
          </div>
        </>
      ) : !error ? (
        <p className="text-gray-600">Tidak ada data.</p>
      ) : null}
    </main>
  );
}
