"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { listMyConversations } from "@/lib/api/chat";
import {
  AlertBanner,
  cardSurface,
  EmptyState,
  ListSkeleton,
  PageHeader,
  PageLoading,
  pageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ConvRow = {
  id: string;
  updatedAt: string;
};

function asConvRows(data: unknown): ConvRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      updatedAt: String(r.updatedAt ?? ""),
    };
  });
}

export default function ChatListPage() {
  const { user, isReady } = useAuth();
  const [rows, setRows] = useState<ConvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listMyConversations({ page: 1, limit: 50 });
      setRows(asConvRows(list));
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memuat percakapan.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady || !user) return;
    void load();
  }, [isReady, user, load]);

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message="Silakan masuk untuk melihat percakapan." />;
  }

  return (
    <main className={`${pageShell} space-y-8 pb-16`}>
      <PageHeader
        eyebrow="Pesan"
        title="Chat"
        description="Buka percakapan dari halaman Konsultasi (tombol Buka chat). Di bawah ini daftar percakapan yang pernah dibuat untuk akun Anda."
      />

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Belum ada percakapan"
          hint="Setelah konsultasi aktif, gunakan tombol chat di halaman Konsultasi untuk memulai obrolan."
        />
      ) : (
        <ul className={`${cardSurface} divide-y divide-slate-100 p-0 overflow-hidden`}>
          {rows.map((c) => (
            <li key={c.id}>
              <Link
                href={`/chat/${c.id}`}
                className="block px-5 py-4 hover:bg-teal-50/40 transition-colors"
              >
                <span className="font-mono text-xs text-slate-500 break-all">
                  {c.id}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Terbaru:{" "}
                  {new Date(c.updatedAt).toLocaleString("id-ID")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
