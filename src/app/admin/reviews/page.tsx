"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { listMyReviews, moderateReview } from "@/lib/api/reviews";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  moderationNote: string | null;
  bookingId: string;
  createdAt: string;
};

function asReviewRows(data: unknown): ReviewRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      rating: Number(r.rating ?? 0),
      comment: r.comment != null ? String(r.comment) : null,
      isHidden: Boolean(r.isHidden),
      moderationNote: r.moderationNote != null ? String(r.moderationNote) : null,
      bookingId: String(r.bookingId ?? ""),
      createdAt: String(r.createdAt ?? ""),
    };
  });
}

export default function AdminReviewsPage() {
  const { user, isReady } = useAuth();
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [noteById, setNoteById] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listMyReviews({ page: 1, limit: 100 });
      setRows(asReviewRows(list));
    } catch (err) {
      setRows([]);
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memuat ulasan.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady || user?.role !== "ADMIN") return;
    void load();
  }, [isReady, user?.role, load]);

  async function applyModeration(
    reviewId: string,
    isHidden: boolean,
    noteRaw: string,
  ) {
    const note = noteRaw.trim();
    if (note.length > 0 && note.length < 3) {
      setError("Catatan moderasi minimal 3 karakter jika diisi.");
      return;
    }
    setActionId(reviewId);
    setError(null);
    try {
      await moderateReview(reviewId, {
        isHidden,
        moderationNote: note.length >= 3 ? note : undefined,
      });
      setNoteById((prev) => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal memperbarui moderasi.",
      );
    } finally {
      setActionId(null);
    }
  }

  if (!isReady) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6 text-center space-y-4">
        <p>Silakan masuk sebagai admin.</p>
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6 space-y-4">
        <h1 className="text-2xl font-bold">Akses ditolak</h1>
        <p className="text-gray-700">Hanya untuk admin.</p>
        <Link href="/" className="text-teal-600 underline">
          Beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-teal-700 hover:underline"
          >
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Moderasi ulasan
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Daftar:{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">GET /reviews/me</code>{" "}
            · aksi:{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">
              PATCH /admin/reviews/:reviewId/moderate
            </code>{" "}
            (
            <code className="text-xs">ModerateReviewDto</code>:{" "}
            <code className="text-xs">isHidden</code>,{" "}
            <code className="text-xs">moderationNote?</code>)
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="text-sm border px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Muat ulang
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Memuat…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-600 border rounded-lg p-8 text-center bg-gray-50">
          Belum ada ulasan.
        </p>
      ) : (
        <ul className="space-y-6">
          {rows.map((rev) => (
            <li
              key={rev.id}
              className="border rounded-xl p-6 bg-white shadow-sm space-y-4"
            >
              <div className="flex flex-wrap justify-between gap-2 items-start">
                <div>
                  <p className="text-amber-600 font-semibold">
                    Rating: {rev.rating}/5
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    {rev.id}
                  </p>
                  <p className="text-xs text-gray-500">
                    Booking: <span className="font-mono">{rev.bookingId}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(rev.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    rev.isHidden
                      ? "bg-gray-200 text-gray-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {rev.isHidden ? "Disembunyikan" : "Tampil publik"}
                </span>
              </div>

              {rev.comment && (
                <blockquote className="text-gray-800 border-l-4 border-teal-200 pl-4 whitespace-pre-wrap">
                  {rev.comment}
                </blockquote>
              )}

              {rev.moderationNote && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">
                  <span className="font-medium text-gray-700">
                    Catatan moderasi:{" "}
                  </span>
                  {rev.moderationNote}
                </p>
              )}

              <div className="space-y-2 pt-2 border-t">
                <label className="block text-sm text-gray-700">
                  Catatan moderasi (opsional, min. 3 karakter jika diisi — mis.
                  saat menyembunyikan)
                </label>
                <textarea
                  className="w-full border rounded-lg p-3 text-sm min-h-[72px]"
                  placeholder="Contoh: Mengandung bahasa tidak pantas."
                  value={noteById[rev.id] ?? ""}
                  onChange={(e) =>
                    setNoteById((prev) => ({
                      ...prev,
                      [rev.id]: e.target.value,
                    }))
                  }
                />
                <div className="flex flex-wrap gap-3">
                  {!rev.isHidden ? (
                    <button
                      type="button"
                      disabled={actionId === rev.id}
                      onClick={() =>
                        void applyModeration(
                          rev.id,
                          true,
                          noteById[rev.id] ?? "",
                        )
                      }
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      Sembunyikan
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionId === rev.id}
                      onClick={() =>
                        void applyModeration(rev.id, false, "")
                      }
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      Tampilkan lagi
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
