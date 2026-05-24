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
import { actionSuccessWithNotify } from "@/lib/notifications/action-feedback";
import { ApiRequestError } from "@/lib/api/client";
import {
  listMyBookings,
  updateBookingStatus,
  type UpdateBookingStatusBody,
} from "@/lib/api/bookings";
import type { Booking } from "@/lib/api/contract";
import { listTransactions } from "@/lib/api/transactions";
import {
  bookingHasOpenTransaction,
  bookingPatientActionHint,
  bookingTherapistActionHint,
} from "@/lib/booking-flow";
import { formatIdr } from "@/lib/format/currency";
import {
  bookingStatusMeta,
  formatAppointmentType,
} from "@/lib/status-meta";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const btnTealSoft = `${btnOutline} min-h-[44px] items-center justify-center border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100/80`;
const btnSkySoft = `${btnOutline} min-h-[44px] items-center justify-center border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100/80`;

function bookingVisitAddress(b: Booking): string | null {
  if (b.appointmentType === "HOME_VISIT") {
    return b.homeVisitAddress;
  }
  return b.clinicAddress;
}

export default function BookingsPage() {
  const { user, isReady } = useAuth();
  const toast = useToast();
  const [rows, setRows] = useState<Booking[]>([]);
  const [openTxBookingIds, setOpenTxBookingIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listMyBookings({ page: 1, limit: 50 });
      setRows(list);
      if (user?.role === "PATIENT") {
        const transactions = await listTransactions({ page: 1, limit: 50 });
        const ids = new Set<string>();
        for (const b of list) {
          if (bookingHasOpenTransaction(b.id, transactions)) {
            ids.add(b.id);
          }
        }
        setOpenTxBookingIds(ids);
      } else {
        setOpenTxBookingIds(new Set());
      }
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memuat booking.",
      );
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (!isReady || !user) return;
    void load();
  }, [isReady, user, load]);

  async function patchStatus(id: string, status: UpdateBookingStatusBody["status"]) {
    setError(null);
    try {
      await updateBookingStatus(id, { status });
      const labels: Record<string, string> = {
        CONFIRMED: "Booking dikonfirmasi. Pasien dapat membayar kunjungan.",
        IN_PROGRESS: "Sesi dimulai.",
        COMPLETED: "Booking ditandai selesai.",
      };
      if (labels[status]) actionSuccessWithNotify(toast, labels[status]);
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
      actionSuccessWithNotify(toast, "Booking dibatalkan.");
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
  const isPatient = user.role === "PATIENT";
  const isPt = user.role === "PHYSIOTHERAPIST";

  const pageDescription = isPatient
    ? "Alur kunjungan: buat janji → terapis konfirmasi → bayar dengan bukti di Transaksi → sesi kunjungan."
    : isPt
      ? "Konfirmasi permintaan pasien, lalu kelola sesi kunjungan. Pasien membayar setelah Anda mengonfirmasi."
      : "Kelola janji temu. Pasien dapat membatalkan sebelum selesai; fisioterapis memperbarui alur sesi.";

  return (
    <main className={`${widePageShell} space-y-6 pb-16`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Janji temu"
          title="Booking"
          description={pageDescription}
        />
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="/calendar"
            className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[10rem]`}
          >
            Kalender
          </Link>
          {isPatient ? (
            <>
              <Link
                href="/appointment"
                className={`${btnPrimary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
              >
                Janji baru
              </Link>
              <Link
                href="/transactions"
                className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
              >
                Transaksi
              </Link>
              <Link
                href="/therapists"
                className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[11rem]`}
              >
                Cari terapis
              </Link>
            </>
          ) : isPt ? (
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
            isPatient
              ? "Buat janji temu baru atau cari fisioterapis yang sesuai kebutuhan Anda."
              : "Booking baru akan muncul ketika pasien menyelesaikan alur janji temu."
          }
          actions={
            isPatient
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
          {rows.map((b) => {
            const hasOpenTx = openTxBookingIds.has(b.id);
            const patientHint = isPatient
              ? bookingPatientActionHint(b.status, hasOpenTx)
              : null;
            const ptHint = isPt ? bookingTherapistActionHint(b.status) : null;
            const address = bookingVisitAddress(b);
            const canPatientPay =
              isPatient &&
              b.status === "CONFIRMED" &&
              !hasOpenTx;

            return (
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
                  <span className="text-slate-500">
                    {" "}
                    · {formatIdr(b.visitFeeSnapshot)}
                  </span>
                </p>
                {address ? (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-medium text-slate-700">Lokasi: </span>
                    {address}
                  </p>
                ) : null}
                {b.notes ? (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-medium text-slate-700">Catatan: </span>
                    {b.notes}
                  </p>
                ) : null}
                {patientHint || ptHint ? (
                  <p className="text-xs text-slate-600 leading-relaxed rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                    {patientHint ?? ptHint}
                  </p>
                ) : null}
                <p className="text-xs text-slate-500 font-mono break-all">{b.id}</p>
                <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:flex-wrap">
                  {isPatient && !terminal.has(b.status) && (
                    <button
                      type="button"
                      onClick={() => setCancelConfirmId(b.id)}
                      className={`${btnOutline} min-h-[44px] justify-center px-4`}
                    >
                      Batalkan booking
                    </button>
                  )}
                  {canPatientPay && (
                    <Link
                      href={`/transactions?bookingId=${encodeURIComponent(b.id)}`}
                      className={`${btnPrimary} min-h-[44px] justify-center px-5 text-center`}
                    >
                      Bayar kunjungan
                    </Link>
                  )}
                  {isPatient && hasOpenTx && b.status === "CONFIRMED" && (
                    <Link
                      href="/transactions"
                      className={`${btnSecondary} min-h-[44px] justify-center px-4 text-center`}
                    >
                      Lihat status pembayaran
                    </Link>
                  )}
                  {isPt && b.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => void patchStatus(b.id, "CONFIRMED")}
                      className={btnTealSoft}
                    >
                      Konfirmasi
                    </button>
                  )}
                  {isPt && b.status === "CONFIRMED" && (
                    <button
                      type="button"
                      onClick={() => void patchStatus(b.id, "IN_PROGRESS")}
                      className={btnSkySoft}
                    >
                      Mulai sesi
                    </button>
                  )}
                  {isPt && b.status === "IN_PROGRESS" && (
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
            );
          })}
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
