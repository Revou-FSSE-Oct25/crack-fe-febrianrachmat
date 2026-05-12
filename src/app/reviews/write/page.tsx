"use client";

import { useAuth } from "@/contexts/auth-context";
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
  const [completed, setCompleted] = useState<BookingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

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
    setSuccess(null);
    try {
      await createReview({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      });
      setSuccess("Ulasan terkirim.");
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
    return (
      <main className="max-w-lg mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-lg mx-auto py-16 px-6 text-center">
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  if (user.role !== "PATIENT") {
    return (
      <main className="max-w-lg mx-auto py-16 px-6">
        <p>Hanya pasien yang dapat menulis ulasan.</p>
        <Link href="/" className="text-teal-600 underline">
          Beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto py-12 px-6 space-y-6">
      <h1 className="text-3xl font-bold">Beri ulasan</h1>
      <p className="text-sm text-gray-600">
        POST /reviews — booking harus berstatus COMPLETED dan belum ada ulasan
        untuk booking tersebut.
      </p>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-800 text-sm bg-green-50 border border-green-100 rounded p-3">
          {success}
        </p>
      )}

      {loading ? (
        <p className="text-gray-600">Memuat booking…</p>
      ) : completed.length === 0 ? (
        <p className="text-gray-600">
          Tidak ada booking selesai untuk diulas.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Booking</label>
            <select
              required
              className="border rounded-lg w-full p-3"
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
            <label className="block text-sm font-medium mb-1">Rating (1–5)</label>
            <select
              className="border rounded-lg w-full p-3"
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
            <label className="block text-sm font-medium mb-1">
              Komentar (opsional)
            </label>
            <textarea
              className="border rounded-lg w-full p-3 min-h-[100px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-600 text-white py-3 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Mengirim…" : "Kirim ulasan"}
          </button>
        </form>
      )}
    </main>
  );
}
