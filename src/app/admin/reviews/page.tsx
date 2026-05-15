"use client";

import {
  adminPageShell,
  AlertBanner,
  btnOutline,
  btnPrimary,
  cardSurface,
  EmptyState,
  inputBase,
  ListSkeleton,
  PageHeader,
  PageLoading,
  SignInRequired,
} from "@/components/ui/page-shell";
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

const hideBtn =
  "inline-flex items-center justify-center rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 transition-[transform,colors] duration-150";

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
    return <PageLoading label="Memuat ulasan…" />;
  }

  if (!user) {
    return (
      <SignInRequired message="Silakan masuk sebagai admin untuk moderasi ulasan." />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className={adminPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader
            eyebrow="Admin"
            title="Akses ditolak"
            description="Hanya admin yang dapat membuka halaman ini."
          />
          <Link
            href="/"
            className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            Kembali ke beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={adminPageShell}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <Link
            href="/admin/dashboard"
            className="inline-flex text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            ← Dashboard
          </Link>
          <PageHeader
            eyebrow="Admin"
            title="Moderasi ulasan"
            description="Sembunyikan ulasan yang melanggar kebijakan atau tampilkan kembali setelah koreksi. Catatan moderasi opsional namun disarankan saat menyembunyikan."
          />
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className={btnOutline}
        >
          Muat ulang
        </button>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <ListSkeleton rows={2} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Belum ada ulasan"
          hint="Ulasan dari pasien akan muncul di sini setelah booking selesai dan ulasan dikirim."
        />
      ) : (
        <ul className="space-y-6">
          {rows.map((rev) => (
            <li key={rev.id} className={`${cardSurface} space-y-4`}>
              <div className="flex flex-wrap justify-between gap-2 items-start">
                <div>
                  <p className="text-amber-700 font-semibold">
                    Rating: {rev.rating}/5
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-mono break-all">
                    {rev.id}
                  </p>
                  <p className="text-xs text-slate-500">
                    Booking:{" "}
                    <span className="font-mono break-all">{rev.bookingId}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(rev.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                    rev.isHidden
                      ? "bg-slate-200 text-slate-800"
                      : "bg-emerald-100 text-emerald-900"
                  }`}
                >
                  {rev.isHidden ? "Disembunyikan" : "Tampil publik"}
                </span>
              </div>

              {rev.comment ? (
                <blockquote className="text-slate-800 border-l-4 border-teal-200 pl-4 whitespace-pre-wrap text-sm leading-relaxed">
                  {rev.comment}
                </blockquote>
              ) : null}

              {rev.moderationNote ? (
                <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 ring-1 ring-slate-100">
                  <span className="font-medium text-slate-800">
                    Catatan moderasi:{" "}
                  </span>
                  {rev.moderationNote}
                </p>
              ) : null}

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-800">
                  Catatan moderasi (opsional, min. 3 karakter jika diisi)
                </label>
                <textarea
                  className={`${inputBase} min-h-[72px] resize-y`}
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
                      className={hideBtn}
                    >
                      Sembunyikan
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionId === rev.id}
                      onClick={() => void applyModeration(rev.id, false, "")}
                      className={btnPrimary}
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
