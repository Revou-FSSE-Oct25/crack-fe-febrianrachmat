"use client";

import {
  AlertBanner,
  btnOutline,
  cardSurface,
  EmptyState,
  ListSkeleton,
  PageHeader,
  PageLoading,
  pageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  listMyBookings,
  updateBookingStatus,
  type UpdateBookingStatusBody,
} from "@/lib/api/bookings";
import { useCallback, useEffect, useState } from "react";

const btnTealSoft = `${btnOutline} border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100/80`;
const btnSkySoft = `${btnOutline} border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100/80`;

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
    return <PageLoading />;
  }

  if (!user) {
    return (
      <SignInRequired message="Silakan masuk untuk melihat booking Anda." />
    );
  }

  const terminal = new Set(["COMPLETED", "CANCELLED"]);

  return (
    <main className={`${pageShell} space-y-6 pb-16`}>
      <PageHeader
        eyebrow="Janji temu"
        title="Booking"
        description="Kelola janji temu Anda. Pasien dapat membatalkan sebelum selesai; fisioterapis memperbarui alur sesi."
      />

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Belum ada booking"
          hint={
            user.role === "PATIENT" ? (
              <>
                Buat janji dari menu{" "}
                <span className="font-medium text-slate-800">Booking</span> di
                pintasan atau halaman janji temu.
              </>
            ) : (
              "Booking baru akan muncul ketika pasien menyelesaikan alur janji temu."
            )
          }
        />
      ) : (
        <ul className="space-y-4">
          {rows.map((b) => (
            <li key={b.id} className={`${cardSurface} space-y-3`}>
              <div className="flex flex-wrap justify-between gap-2 items-start">
                <span className="font-semibold text-slate-900">{b.status}</span>
                <span className="text-sm text-slate-600 tabular-nums">
                  {new Date(b.appointmentDate).toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-sm text-slate-700">{b.appointmentType}</p>
              <p className="text-xs text-slate-500 font-mono break-all">{b.id}</p>
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                {user.role === "PATIENT" && !terminal.has(b.status) && (
                  <button
                    type="button"
                    onClick={() => void patchStatus(b.id, "CANCELLED")}
                    className={btnOutline}
                  >
                    Batalkan booking
                  </button>
                )}
                {user.role === "PHYSIOTHERAPIST" && b.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => void patchStatus(b.id, "CONFIRMED")}
                    className={btnTealSoft}
                  >
                    Konfirmasi
                  </button>
                )}
                {user.role === "PHYSIOTHERAPIST" &&
                  b.status === "CONFIRMED" && (
                    <button
                      type="button"
                      onClick={() => void patchStatus(b.id, "IN_PROGRESS")}
                      className={btnSkySoft}
                    >
                      Mulai sesi
                    </button>
                  )}
                {user.role === "PHYSIOTHERAPIST" &&
                  b.status === "IN_PROGRESS" && (
                    <button
                      type="button"
                      onClick={() => void patchStatus(b.id, "COMPLETED")}
                      className={`${btnOutline} bg-slate-50`}
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
