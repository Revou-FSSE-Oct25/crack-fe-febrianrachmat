"use client";

import { PaymentProofLink } from "@/components/PaymentProofLink";
import {
  adminPageShell,
  adminScrollWrap,
  AdminBreadcrumb,
  AlertBanner,
  btnDanger,
  btnOutline,
  btnPrimary,
  cardSurface,
  ConfirmDialog,
  EmptyState,
  inputBase,
  ListSkeleton,
  PageHeader,
  PageLoading,
  SignInRequired,
  StatusChip,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  adminOperationReferenceLabel,
  getAdminOperationsQueue,
  downloadAdminBookingsCsv,
  downloadAdminTransactionsCsv,
  listAdminOperationBookings,
  listAdminOperationTransactions,
  type AdminOperationBooking,
  type AdminOperationTransaction,
  type AdminOperationsQueue,
} from "@/lib/api/admin-operations";
import { ApiRequestError } from "@/lib/api/client";
import { hasTransactionPaymentProof } from "@/lib/api/payment-proof";
import {
  confirmTransactionPaidByAdmin,
  refundTransaction,
} from "@/lib/api/transactions";
import { formatIdr } from "@/lib/format/currency";
import {
  bookingStatusMeta,
  formatAppointmentType,
  transactionStatusMeta,
} from "@/lib/status-meta";
import { validateRefundReason } from "@/lib/validation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Tab = "payments" | "bookings";

function QueueCard({
  label,
  value,
  href,
  tone = "default",
}: {
  label: string;
  value: number;
  href?: string;
  tone?: "default" | "urgent";
}) {
  const inner = (
    <div
      className={`${cardSurface} p-4 ${tone === "urgent" && value > 0 ? "ring-2 ring-amber-300/80" : ""}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-bold tabular-nums ${value > 0 && tone === "urgent" ? "text-amber-800" : "text-slate-900"}`}
      >
        {value}
      </p>
    </div>
  );
  if (href && value > 0) {
    return (
      <Link href={href} className="block transition hover:opacity-90">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default function AdminOperationsPage() {
  const { user, isReady } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("payments");
  const [queue, setQueue] = useState<AdminOperationsQueue | null>(null);
  const [transactions, setTransactions] = useState<AdminOperationTransaction[]>(
    [],
  );
  const [bookings, setBookings] = useState<AdminOperationBooking[]>([]);
  const [txStatus, setTxStatus] = useState<"PENDING" | "PAID" | "REFUNDED" | "">(
    "PENDING",
  );
  const [bookingStatus, setBookingStatus] = useState<
    "PENDING" | "CONFIRMED" | ""
  >("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingPayId, setConfirmingPayId] = useState<string | null>(null);
  const [refundReasonById, setRefundReasonById] = useState<
    Record<string, string>
  >({});
  const [refundConfirmId, setRefundConfirmId] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [exportingTx, setExportingTx] = useState(false);
  const [exportingBk, setExportingBk] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [q, txRes, bkRes] = await Promise.all([
        getAdminOperationsQueue(),
        listAdminOperationTransactions({
          page: 1,
          limit: 30,
          status: txStatus || undefined,
        }),
        listAdminOperationBookings({
          page: 1,
          limit: 30,
          status: bookingStatus || undefined,
        }),
      ]);
      setQueue(q);
      setTransactions(txRes.items);
      setBookings(bkRes.items);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal memuat data operasional.",
      );
    } finally {
      setLoading(false);
    }
  }, [txStatus, bookingStatus]);

  useEffect(() => {
    if (!isReady || user?.role !== "ADMIN") return;
    void load();
  }, [isReady, user?.role, load]);

  async function confirmPayment(id: string) {
    setConfirmingPayId(id);
    setError(null);
    try {
      await confirmTransactionPaidByAdmin(id);
      toast.success("Pembayaran dikonfirmasi.");
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal mengonfirmasi pembayaran.",
      );
    } finally {
      setConfirmingPayId(null);
    }
  }

  function requestRefund(id: string) {
    const reason = (refundReasonById[id] ?? "").trim();
    const v = validateRefundReason(reason);
    if (!v.ok) {
      setError(v.message);
      return;
    }
    setError(null);
    setRefundConfirmId(id);
  }

  async function handleExportTransactions() {
    setExportingTx(true);
    setError(null);
    try {
      await downloadAdminTransactionsCsv({
        status: txStatus || undefined,
      });
      toast.success("CSV transaksi diunduh.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal mengunduh CSV transaksi.",
      );
    } finally {
      setExportingTx(false);
    }
  }

  async function handleExportBookings() {
    setExportingBk(true);
    setError(null);
    try {
      await downloadAdminBookingsCsv({
        status: bookingStatus || undefined,
      });
      toast.success("CSV booking diunduh.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal mengunduh CSV booking.",
      );
    } finally {
      setExportingBk(false);
    }
  }

  async function confirmRefund() {
    if (!refundConfirmId) return;
    const id = refundConfirmId;
    const reason = (refundReasonById[id] ?? "").trim();
    setRefundingId(id);
    setError(null);
    try {
      await refundTransaction(id, { reason });
      setRefundConfirmId(null);
      toast.success("Refund berhasil diproses (dummy).");
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal refund.",
      );
    } finally {
      setRefundingId(null);
    }
  }

  if (!isReady) {
    return <PageLoading label="Memuat operasional…" />;
  }

  if (!user) {
    return (
      <SignInRequired message="Silakan masuk sebagai admin untuk mengelola operasional." />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className={adminPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader
            eyebrow="Admin"
            title="Akses ditolak"
            description="Halaman operasional hanya untuk peran Admin."
          />
          <Link href="/" className="text-sm font-semibold text-teal-700">
            Kembali ke beranda
          </Link>
        </div>
      </main>
    );
  }

  const counts = queue?.counts;

  return (
    <main className={adminPageShell}>
      <AdminBreadcrumb />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          eyebrow="Admin"
          title="Operasional"
          description="Antrian pembayaran, monitoring booking, dan pintasan ke tugas verifikasi. Konfirmasi bayar hanya jika bukti terlampir."
        />
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className={`${btnOutline} min-h-[44px] px-5`}
        >
          {loading ? "Memuat…" : "Muat ulang"}
        </button>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {counts ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QueueCard
            label="Transaksi menunggu konfirmasi"
            value={counts.pendingTransactions}
            tone="urgent"
          />
          <QueueCard
            label="Bayar booking (PENDING)"
            value={counts.pendingBookingPayments}
          />
          <QueueCard
            label="Bayar konsultasi (PENDING)"
            value={counts.pendingConsultationPayments}
          />
          <QueueCard
            label="Booking menunggu PT"
            value={counts.pendingBookings}
          />
          <QueueCard
            label="Verifikasi PT"
            value={counts.pendingPhysiotherapistVerifications}
            href="/admin/physiotherapists"
            tone="urgent"
          />
          <QueueCard
            label="Konsultasi diterima, belum lunas"
            value={counts.consultationsAcceptedAwaitingPayment}
          />
        </div>
      ) : loading ? (
        <ListSkeleton rows={2} />
      ) : null}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setTab("payments")}
          className={`min-h-[44px] rounded-full px-4 text-sm font-semibold ${
            tab === "payments"
              ? "bg-teal-600 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          Antrian pembayaran
        </button>
        <button
          type="button"
          onClick={() => setTab("bookings")}
          className={`min-h-[44px] rounded-full px-4 text-sm font-semibold ${
            tab === "bookings"
              ? "bg-teal-600 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          Monitoring booking
        </button>
        <Link
          href="/transactions"
          className={`${btnOutline} min-h-[44px] items-center px-4 text-sm`}
        >
          Semua transaksi →
        </Link>
      </div>

      {tab === "payments" ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-slate-700">
              Filter status
              <select
                className={`${inputBase} ml-2 mt-1 min-h-[40px]`}
                value={txStatus}
                onChange={(e) =>
                  setTxStatus(
                    e.target.value as "" | "PENDING" | "PAID" | "REFUNDED",
                  )
                }
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="REFUNDED">REFUNDED</option>
                <option value="">Semua</option>
              </select>
            </label>
            <button
              type="button"
              disabled={exportingTx || loading}
              onClick={() => void handleExportTransactions()}
              className={`${btnOutline} min-h-[40px] px-4 text-sm`}
            >
              {exportingTx ? "Mengekspor…" : "Unduh CSV"}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            CSV mengikuti filter status (maks. 10.000 baris). Cocok untuk laporan
            demo di Excel/Sheets.
          </p>

          {loading ? (
            <ListSkeleton rows={4} />
          ) : transactions.length === 0 ? (
            <EmptyState
              title="Tidak ada transaksi pada filter ini"
              hint="Ubah filter status atau tunggu pasien mengunggah bukti bayar."
            />
          ) : (
            <ul className="space-y-4">
              {transactions.map((t) => (
                <li key={t.id} className={`${cardSurface} space-y-3`}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <StatusChip
                        label={transactionStatusMeta(t.status).label}
                        tone={transactionStatusMeta(t.status).tone}
                      />
                      <p className="text-sm font-medium text-slate-900">
                        {t.patient.fullName}
                        <span className="font-normal text-slate-500">
                          {" "}
                          · {t.patient.email}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">
                        {t.paymentMethod} · {formatIdr(t.amount)}
                      </p>
                      <p className="text-xs text-slate-600">
                        {adminOperationReferenceLabel(t)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Dibuat{" "}
                        {new Date(t.createdAt).toLocaleString("id-ID")}
                      </p>
                      <PaymentProofLink
                        transactionId={t.id}
                        paymentProofUrl={t.paymentProofUrl}
                      />
                    </div>
                  </div>
                  {t.status === "PENDING" ? (
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      {!t.hasPaymentProof ? (
                        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-xl">
                          Tunggu bukti bayar dari pasien sebelum konfirmasi.
                        </p>
                      ) : null}
                      <button
                        type="button"
                        disabled={
                          confirmingPayId === t.id || !t.hasPaymentProof
                        }
                        onClick={() => void confirmPayment(t.id)}
                        className={`${btnPrimary} min-h-[44px] text-sm disabled:opacity-50`}
                      >
                        {confirmingPayId === t.id
                          ? "Memproses…"
                          : "Konfirmasi pembayaran"}
                      </button>
                    </div>
                  ) : null}
                  {t.status === "PAID" ? (
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <textarea
                        className={`${inputBase} min-h-[72px]`}
                        placeholder="Alasan refund (min. 5 karakter)"
                        value={refundReasonById[t.id] ?? ""}
                        onChange={(e) =>
                          setRefundReasonById((prev) => ({
                            ...prev,
                            [t.id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        disabled={refundingId === t.id}
                        onClick={() => requestRefund(t.id)}
                        className={`${btnDanger} min-h-[44px] text-sm`}
                      >
                        Refund (dummy)
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-slate-700">
              Filter status booking
              <select
                className={`${inputBase} ml-2 mt-1 min-h-[40px]`}
                value={bookingStatus}
                onChange={(e) =>
                  setBookingStatus(
                    e.target.value as "" | "PENDING" | "CONFIRMED",
                  )
                }
              >
                <option value="PENDING">PENDING (menunggu PT)</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="">Semua</option>
              </select>
            </label>
            <button
              type="button"
              disabled={exportingBk || loading}
              onClick={() => void handleExportBookings()}
              className={`${btnOutline} min-h-[40px] px-4 text-sm`}
            >
              {exportingBk ? "Mengekspor…" : "Unduh CSV"}
            </button>
          </div>
          <p className="text-sm text-slate-600">
            Admin memantau alur; konfirmasi booking dilakukan oleh fisioterapis di
            halaman Daftar booking. CSV mengikuti filter status di atas (maks. 10.000
            baris).
          </p>
          {loading ? (
            <ListSkeleton rows={4} />
          ) : bookings.length === 0 ? (
            <EmptyState title="Tidak ada booking pada filter ini" />
          ) : (
            <div className={adminScrollWrap}>
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Waktu</th>
                    <th className="py-2 pr-4">Pasien</th>
                    <th className="py-2 pr-4">Fisioterapis</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Tarif</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const meta = bookingStatusMeta(b.status);
                    return (
                      <tr
                        key={b.id}
                        className="border-b border-slate-100 align-top"
                      >
                        <td className="py-3 pr-4">
                          <p className="font-medium text-slate-900">
                            {new Date(b.appointmentDate).toLocaleString(
                              "id-ID",
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatAppointmentType(b.appointmentType)}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          <p>{b.patient.fullName}</p>
                          <p className="text-xs text-slate-500">
                            {b.patient.email}
                          </p>
                        </td>
                        <td className="py-3 pr-4">{b.physiotherapist.fullName}</td>
                        <td className="py-3 pr-4">
                          <StatusChip label={meta.label} tone={meta.tone} />
                        </td>
                        <td className="py-3 pr-4 tabular-nums">
                          {formatIdr(Number(b.visitFeeSnapshot))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <ConfirmDialog
        open={refundConfirmId !== null}
        title="Proses refund?"
        description="Transaksi akan ditandai refund (dummy)."
        confirmLabel="Ya, refund"
        cancelLabel="Batal"
        variant="danger"
        loading={refundConfirmId !== null && refundingId === refundConfirmId}
        onConfirm={() => void confirmRefund()}
        onCancel={() => {
          if (refundingId === null) setRefundConfirmId(null);
        }}
      />
    </main>
  );
}
