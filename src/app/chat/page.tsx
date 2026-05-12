"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { listMyConversations } from "@/lib/api/chat";
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
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-center space-y-4">
        <p>Silakan masuk untuk chat.</p>
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-6 space-y-6">
      <h1 className="text-3xl font-bold">Chat</h1>
      <p className="text-gray-600 text-sm">
        Buka percakapan dari halaman Konsultasi (tombol Chat). Daftar di bawah
        memuat percakapan yang sudah pernah dibuat.
      </p>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-600">Memuat…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-600">Belum ada percakapan.</p>
      ) : (
        <ul className="divide-y border rounded-lg overflow-hidden bg-white">
          {rows.map((c) => (
            <li key={c.id}>
              <Link
                href={`/chat/${c.id}`}
                className="block p-4 hover:bg-gray-50 transition"
              >
                <span className="font-mono text-sm">{c.id}</span>
                <p className="text-xs text-gray-500 mt-1">
                  Terbaru: {new Date(c.updatedAt).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
