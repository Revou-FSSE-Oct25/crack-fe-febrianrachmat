"use client";

import {
  AlertBanner,
  btnOutline,
  btnPrimary,
  btnSecondary,
  cardSurface,
  ConfirmDialog,
  EmptyState,
  ListSkeleton,
  PageHeader,
  PageLoading,
  SignInRequired,
  widePageShell,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  deleteMyReview,
  listMyReviews,
  type Review,
} from "@/lib/api/reviews";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function MyReviewsPage() {
  const { user, isReady } = useAuth();
  const toast = useToast();
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listMyReviews({ page: 1, limit: 50 });
      setRows(list);
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
    if (!isReady || user?.role !== "PATIENT") return;
    void load();
  }, [isReady, user?.role, load]);

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    setDeletingId(deleteConfirmId);
    setError(null);
    try {
      await deleteMyReview(deleteConfirmId);
      setDeleteConfirmId(null);
      toast.success("Ulasan dihapus.");
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal menghapus ulasan.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message="Masuk untuk melihat ulasan Anda." />;
  }

  if (user.role !== "PATIENT") {
    return (
      <main className={`${widePageShell} space-y-6 pb-16`}>
        <PageHeader
          eyebrow="Ulasan"
          title="Ulasan saya"
          description="Halaman ini hanya untuk akun pasien."
        />
        <div className={cardSurface}>
          <Link href="/profile" className={`${btnSecondary} min-h-[44px]`}>
            Kembali ke profil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Ulasan"
          title="Ulasan saya"
          description="Kelola ulasan yang Anda kirim setelah booking selesai."
        />
        <Link
          href="/reviews/write"
          className={`${btnPrimary} min-h-[44px] justify-center text-center sm:min-w-[10rem]`}
        >
          Tulis ulasan baru
        </Link>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <ListSkeleton rows={2} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Belum ada ulasan"
          hint="Setelah booking selesai, Anda dapat menulis ulasan dari menu Tulis ulasan."
          actions={[
            { href: "/reviews/write", label: "Tulis ulasan" },
            { href: "/bookings", label: "Lihat booking", variant: "secondary" },
          ]}
        />
      ) : (
        <ul className="space-y-4">
          {rows.map((rev) => (
            <li key={rev.id} className={`${cardSurface} space-y-3`}>
              <div className="flex flex-wrap justify-between gap-2">
                <p className="text-amber-700 font-semibold">
                  Rating: {rev.rating}/5
                </p>
                <span className="text-xs text-slate-500">
                  {new Date(rev.createdAt).toLocaleString("id-ID")}
                </span>
              </div>
              {rev.isHidden ? (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2">
                  Ulasan disembunyikan oleh admin moderasi.
                  {rev.moderationNote ? ` Catatan: ${rev.moderationNote}` : ""}
                </p>
              ) : null}
              {rev.comment ? (
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {rev.comment}
                </p>
              ) : (
                <p className="text-sm text-slate-500 italic">Tanpa komentar.</p>
              )}
              <p className="text-xs text-slate-500 font-mono break-all">
                Booking: {rev.bookingId}
              </p>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(rev.id)}
                disabled={deletingId === rev.id}
                className={`${btnOutline} min-h-[44px] text-sm text-red-800 border-red-200 hover:bg-red-50`}
              >
                Hapus ulasan
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleteConfirmId !== null}
        title="Hapus ulasan?"
        description="Ulasan akan dihapus permanen. Anda masih bisa menulis ulasan baru untuk booking lain yang memenuhi syarat."
        confirmLabel="Ya, hapus"
        cancelLabel="Tidak jadi"
        variant="danger"
        loading={deleteConfirmId !== null && deletingId === deleteConfirmId}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (deletingId === null) setDeleteConfirmId(null);
        }}
      />
    </main>
  );
}
