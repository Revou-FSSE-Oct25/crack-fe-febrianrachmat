"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  listMyBookings,
  updateBookingStatus,
  type UpdateBookingStatusBody,
} from "@/lib/api/bookings";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type BookingRow = {
  id: string;
  status: string;
  appointmentDate: string;
  appointmentType: string;
};

function asBookingRows(data: unknown): BookingRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      status: String(r.status ?? ""),
      appointmentDate: String(r.appointmentDate ?? ""),
      appointmentType: String(r.appointmentType ?? ""),
    };
  });
}

export default function BookingsPage() {
  const { user, isReady } = useAuth();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listMyBookings({ page: 1, limit: 50 });
      setRows(asBookingRows(list));
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memuat booking.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady || !user) return;
    void load();
  }, [isReady, user, load]);

  async function patchStatus(id: string, status: UpdateBookingStatusBody["status"]) {
    setError(null);
    try {
      await updateBookingStatus(id, { status });
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memperbarui booking.",
      );
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
        <p>Silakan masuk untuk melihat booking.</p>
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  const terminal = new Set(["COMPLETED", "CANCELLED"]);

  return (
    <main className="max-w-4xl mx-auto py-16 px-6 space-y-6">
      <h1 className="text-3xl font-bold">Booking</h1>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-600">Memuat…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-600">Belum ada booking.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((b) => (
            <li key={b.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium">{b.status}</span>
                <span className="text-sm text-gray-600">
                  {new Date(b.appointmentDate).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{b.appointmentType}</p>
              <p className="text-xs text-gray-500 font-mono">{b.id}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {user.role === "PATIENT" && !terminal.has(b.status) && (
                  <button
                    type="button"
                    onClick={() => void patchStatus(b.id, "CANCELLED")}
                    className="text-sm border px-3 py-1.5 rounded"
                  >
                    Batalkan booking
                  </button>
                )}
                {user.role === "PHYSIOTHERAPIST" && b.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => void patchStatus(b.id, "CONFIRMED")}
                    className="text-sm bg-teal-50 text-teal-800 px-3 py-1.5 rounded border border-teal-200"
                  >
                    Konfirmasi
                  </button>
                )}
                {user.role === "PHYSIOTHERAPIST" &&
                  b.status === "CONFIRMED" && (
                    <button
                      type="button"
                      onClick={() => void patchStatus(b.id, "IN_PROGRESS")}
                      className="text-sm bg-blue-50 px-3 py-1.5 rounded border border-blue-200"
                    >
                      Mulai sesi
                    </button>
                  )}
                {user.role === "PHYSIOTHERAPIST" &&
                  b.status === "IN_PROGRESS" && (
                    <button
                      type="button"
                      onClick={() => void patchStatus(b.id, "COMPLETED")}
                      className="text-sm bg-gray-100 px-3 py-1.5 rounded border"
                    >
                      Selesai
                    </button>
                  )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
