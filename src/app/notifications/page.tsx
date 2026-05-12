"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
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
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-center space-y-4">
        <p>Silakan masuk untuk melihat notifikasi.</p>
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Notifikasi</h1>
        <button
          type="button"
          onClick={() => void markAll()}
          className="text-sm border px-4 py-2 rounded"
        >
          Tandai semua dibaca
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-600">Memuat…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-600">Tidak ada notifikasi.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {rows.map((n) => (
              <li
                key={n.id}
                className={`border rounded-lg p-4 ${n.isRead ? "bg-white" : "bg-teal-50/40"}`}
              >
                <div className="flex justify-between gap-2">
                  <h2 className="font-semibold">{n.title}</h2>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => void markOne(n.id)}
                      className="text-xs text-teal-700 shrink-0"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{n.body}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex gap-3 justify-center items-center pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => void load(page - 1)}
                className="border px-4 py-2 rounded disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-sm text-gray-600">
                Halaman {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => void load(page + 1)}
                className="border px-4 py-2 rounded disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
