"use client";

import {
  AlertBanner,
  btnPrimary,
  cardSurface,
  EmptyState,
  inputBase,
  PageHeader,
  PageLoading,
  SignInRequired,
  formPageShell,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import { listMyBookings } from "@/lib/api/bookings";
import { createReview } from "@/lib/api/reviews";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type BookingOption = { id: string; status: string };

function asBookings(data: unknown): BookingOption[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      status: String(r.status ?? ""),
    };
  });
}

export default function WriteReviewPage() {
  const { user, isReady } = useAuth();
  const toast = useToast();
  const [completed, setCompleted] = useState<BookingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [bookingId, setBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listMyBookings({ page: 1, limit: 100 });
      const all = asBookings(list);
      setCompleted(all.filter((b) => b.status === "COMPLETED"));
    } catch (err) {
      setCompleted([]);
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memuat booking.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady || user?.role !== "PATIENT") return;
    void load();
  }, [isReady, user?.role, load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingId) {
      setError("Pilih booking.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createReview({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Ulasan terkirim. Terima kasih atas masukan Anda.");
      setComment("");
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal mengirim ulasan.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message="Silakan masuk untuk menulis ulasan." />;
  }

  if (user.role !== "PATIENT") {
    return (
      <main className={formPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader
            title="Ulasan"
            description="Hanya pasien yang dapat menulis ulasan setelah sesi selesai."
          />
          <Link href="/" className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800">
            Kembali ke beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={formPageShell}>
      <PageHeader
        eyebrow="Feedback"
        title="Beri ulasan"
        description="Pilih booking yang sudah selesai, beri rating 1–5, dan tambahkan komentar jika perlu. Satu booking hanya boleh satu ulasan."
      />

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}
      {loading ? (
        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
            aria-hidden
          />
          Memuat booking…
        </p>
      ) : completed.length === 0 ? (
        <EmptyState
          title="Belum ada booking selesai"
          hint="Ulasan bisa ditulis setelah fisioterapis menandai sesi booking sebagai selesai."
          actions={[
            { href: "/bookings", label: "Lihat status booking" },
            {
              href: "/appointment",
              label: "Buat janji baru",
              variant: "secondary",
            },
          ]}
        />
      ) : (
        <form onSubmit={handleSubmit} className={`${cardSurface} space-y-5`}>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Booking
            </label>
            <select
              required
              className={inputBase}
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            >
              <option value="">— Pilih —</option>
              {completed.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id.slice(0, 8)}…
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Rating (1–5)
            </label>
            <select
              className={inputBase}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Komentar (opsional)
            </label>
            <textarea
              className={`${inputBase} min-h-[100px] resize-y`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`${btnPrimary} w-full`}
          >
            {submitting ? "Mengirim…" : "Kirim ulasan"}
          </button>
        </form>
      )}
    </main>
  );
}
