"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import {
  AlertBanner,
  btnOutline,
  btnSecondary,
  cardSurface,
  EmptyState,
  ListSkeleton,
  PageHeader,
  PageLoading,
  widePageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type NotifRow = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

function asRows(items: unknown[]): NotifRow[] {
  return items.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      title: String(r.title ?? ""),
      body: String(r.body ?? ""),
      isRead: Boolean(r.isRead),
      createdAt: String(r.createdAt ?? ""),
    };
  });
}

export default function NotificationsPage() {
  const { user, isReady } = useAuth();
  const [rows, setRows] = useState<NotifRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const { items, meta } = await listMyNotifications({
        page: p,
        limit: 20,
      });
      setRows(asRows(items));
      setTotalPages(meta.totalPages);
      setPage(meta.page);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memuat notifikasi.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady || !user) return;
    void load(1);
  }, [isReady, user, load]);

  async function markOne(id: string) {
    try {
      await markNotificationRead(id);
      await load(page);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal menandai dibaca.",
      );
    }
  }

  async function markAll() {
    try {
      await markAllNotificationsRead();
      await load(page);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal menandai semua.",
      );
    }
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message="Silakan masuk untuk melihat notifikasi." />;
  }

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Kotak masuk"
          title="Notifikasi"
          description="Pemberitahan dari sistem dan admin. Notifikasi yang belum dibaca ditandai dengan latar berbeda."
        />
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <Link
            href="/bookings"
            className={`${btnOutline} min-h-[44px] justify-center text-center sm:min-w-[9rem]`}
          >
            Booking
          </Link>
          <Link
            href="/consultations"
            className={`${btnOutline} min-h-[44px] justify-center text-center sm:min-w-[9rem]`}
          >
            Konsultasi
          </Link>
          <button
            type="button"
            onClick={() => void markAll()}
            className={`${btnSecondary} min-h-[44px] justify-center px-5 text-center sm:min-w-[12rem]`}
          >
            Tandai semua dibaca
          </button>
        </div>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <ListSkeleton rows={3} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Tidak ada notifikasi"
          hint="Notifikasi akan muncul ketika ada pembaruan pada booking, konsultasi, atau transaksi Anda."
          actions={[
            { href: "/bookings", label: "Lihat booking" },
            {
              href: "/consultations",
              label: "Lihat konsultasi",
              variant: "secondary",
            },
          ]}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {rows.map((n) => (
              <li
                key={n.id}
                className={`${cardSurface} ${
                  n.isRead ? "" : "border-teal-200/80 bg-teal-50/25"
                }`}
              >
                <div className="flex justify-between gap-3 items-start">
                  <h2 className="font-semibold text-slate-900">{n.title}</h2>
                  {!n.isRead ? (
                    <button
                      type="button"
                      onClick={() => void markOne(n.id)}
                      className={`${btnOutline} min-h-[36px] shrink-0 px-3 py-1.5 text-xs font-semibold text-teal-800`}
                    >
                      Tandai dibaca
                    </button>
                  ) : null}
                </div>
                <p className="text-slate-700 mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {n.body}
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  {new Date(n.createdAt).toLocaleString("id-ID")}
                </p>
              </li>
            ))}
          </ul>
          {totalPages > 1 ? (
            <div className="flex flex-wrap gap-3 justify-center items-center pt-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => void load(page - 1)}
                className={`${btnOutline} min-h-[44px] px-5`}
              >
                Sebelumnya
              </button>
              <span className="text-sm text-slate-600 tabular-nums">
                Halaman {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => void load(page + 1)}
                className={`${btnOutline} min-h-[44px] px-5`}
              >
                Berikutnya
              </button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
