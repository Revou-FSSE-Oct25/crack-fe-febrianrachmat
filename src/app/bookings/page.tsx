"use client";

import {
  AlertBanner,
  btnOutline,
  btnPrimary,
  btnSecondary,
  cardSurface,
  EmptyState,
  ListSkeleton,
  PageHeader,
  ConfirmDialog,
  PageLoading,
  StatusChip,
  widePageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  listMyBookings,
  updateBookingStatus,
  type UpdateBookingStatusBody,
} from "@/lib/api/bookings";
import {
  bookingStatusMeta,
  formatAppointmentType,
} from "@/lib/status-meta";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const btnTealSoft = `${btnOutline} min-h-[44px] items-center justify-center border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100/80`;
const btnSkySoft = `${btnOutline} min-h-[44px] items-center justify-center border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100/80`;

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
  const toast = useToast();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
      const labels: Record<string, string> = {
        CONFIRMED: "Booking dikonfirmasi.",
        IN_PROGRESS: "Sesi dimulai.",
        COMPLETED: "Booking ditandai selesai.",
      };
      if (labels[status]) toast.success(labels[status]);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memperbarui booking.",
      );
    }
  }

  async function confirmCancelBooking() {
    if (!cancelConfirmId) return;
    setActionLoading(true);
    setError(null);
    try {
      await updateBookingStatus(cancelConfirmId, { status: "CANCELLED" });
      setCancelConfirmId(null);
      toast.success("Booking dibatalkan.");
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal membatalkan booking.",
      );
    } finally {
      setActionLoading(false);
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
    <main className={`${widePageShell} space-y-6 pb-16`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Janji temu"
          title="Booking"
          description="Kelola janji temu Anda. Pasien dapat membatalkan sebelum selesai; fisioterapis memperbarui alur sesi."
        />
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          {user.role === "PATIENT" ? (
            <>
              <Link
                href="/appointment"
                className={`${btnPrimary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
              >
                Janji baru
              </Link>
              <Link
                href="/therapists"
                className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
              >
                Cari terapis
              </Link>
            </>
          ) : user.role === "PHYSIOTHERAPIST" ? (
            <Link
              href="/physiotherapist/availability"
              className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[12rem]`}
            >
              Kelola jadwal slot
            </Link>
          ) : null}
        </div>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Belum ada booking"
          hint={
            user.role === "PATIENT"
              ? "Buat janji temu baru atau cari fisioterapis yang sesuai kebutuhan Anda."
              : "Booking baru akan muncul ketika pasien menyelesaikan alur janji temu."
          }
          actions={
            user.role === "PATIENT"
              ? [
                  { href: "/appointment", label: "Buat janji baru" },
                  {
                    href: "/therapists",
                    label: "Cari fisioterapis",
                    variant: "secondary",
                  },
                ]
              : [
                  {
                    href: "/physiotherapist/availability",
                    label: "Kelola jadwal slot",
                  },
                ]
          }
        />
      ) : (
        <ul className="space-y-4">
          {rows.map((b) => (
            <li key={b.id} className={`${cardSurface} space-y-3`}>
              <div className="flex flex-wrap justify-between gap-3 items-start">
                <StatusChip
                  label={bookingStatusMeta(b.status).label}
                  tone={bookingStatusMeta(b.status).tone}
                />
                <time
                  dateTime={b.appointmentDate}
                  className="text-sm text-slate-600 tabular-nums"
                >
                  {new Date(b.appointmentDate).toLocaleString("id-ID")}
                </time>
              </div>
              <p className="text-sm text-slate-700">
                {formatAppointmentType(b.appointmentType)}
              </p>
              <p className="text-xs text-slate-500 font-mono break-all">{b.id}</p>
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:flex-wrap">
                {user.role === "PATIENT" && !terminal.has(b.status) && (
                  <button
                    type="button"
                    onClick={() => setCancelConfirmId(b.id)}
                    className={`${btnOutline} min-h-[44px] justify-center px-4`}
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
                      className={`${btnOutline} min-h-[44px] justify-center bg-slate-50 px-4`}
                    >
                      Selesai
                    </button>
                  )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={cancelConfirmId !== null}
        title="Batalkan booking?"
        description="Janji temu akan dibatalkan. Anda tidak bisa mengembalikan status ini setelah dibatalkan."
        confirmLabel="Ya, batalkan"
        cancelLabel="Tidak jadi"
        variant="danger"
        loading={actionLoading}
        onConfirm={() => void confirmCancelBooking()}
        onCancel={() => {
          if (!actionLoading) setCancelConfirmId(null);
        }}
      />
    </main>
  );
}
