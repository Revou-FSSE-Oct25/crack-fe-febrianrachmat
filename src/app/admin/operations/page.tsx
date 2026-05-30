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
import { useLanguage } from "@/contexts/language-context";
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
  const { t } = useLanguage();
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
          : t("admin.operations.errLoad"),
      );
    } finally {
      setLoading(false);
    }
  }, [txStatus, bookingStatus, t]);

  useEffect(() => {
    if (!isReady || user?.role !== "ADMIN") return;
    void load();
  }, [isReady, user?.role, load]);

  async function confirmPayment(id: string) {
    setConfirmingPayId(id);
    setError(null);
    try {
      await confirmTransactionPaidByAdmin(id);
      toast.success(t("admin.operations.toastPaymentConfirmed"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("admin.operations.errConfirmPayment"),
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
      toast.success(t("admin.operations.toastCsvTx"));
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("admin.operations.errCsvTx"),
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
      toast.success(t("admin.operations.toastCsvBooking"));
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("admin.operations.errCsvBooking"),
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
      toast.success(t("admin.operations.toastRefund"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("admin.operations.errRefund"),
      );
    } finally {
      setRefundingId(null);
    }
  }

  if (!isReady) {
    return <PageLoading label={t("admin.operations.loading")} />;
  }

  if (!user) {
    return (
      <SignInRequired message={t("admin.operations.signIn")} />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className={adminPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader
            eyebrow="Admin"
            title={t("admin.common.accessDenied")}
            description={t("admin.operations.adminOnly")}
          />
          <Link href="/" className="text-sm font-semibold text-teal-700">
            {t("admin.common.backHome")}
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
          title={t("admin.operations.title")}
          description={t("admin.operations.description")}
        />
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className={`${btnOutline} min-h-[44px] px-5`}
        >
          {loading ? t("admin.common.loading") : t("admin.common.reload")}
        </button>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {counts ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QueueCard
            label={t("admin.operations.queueTxAwaiting")}
            value={counts.pendingTransactions}
            tone="urgent"
          />
          <QueueCard
            label={t("admin.operations.queueBookingPayment")}
            value={counts.pendingBookingPayments}
          />
          <QueueCard
            label={t("admin.operations.queueConsultationPayment")}
            value={counts.pendingConsultationPayments}
          />
          <QueueCard
            label={t("admin.operations.queueBookingAwaitingPt")}
            value={counts.pendingBookings}
          />
          <QueueCard
            label={t("admin.operations.queuePtVerification")}
            value={counts.pendingPhysiotherapistVerifications}
            href="/admin/physiotherapists"
            tone="urgent"
          />
          <QueueCard
            label={t("admin.operations.queueConsultationAccepted")}
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
          {t("admin.operations.tabPayments")}
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
          {t("admin.operations.tabBookings")}
        </button>
        <Link
          href="/transactions"
          className={`${btnOutline} min-h-[44px] items-center px-4 text-sm`}
        >
          {t("admin.operations.allTransactions")}
        </Link>
      </div>

      {tab === "payments" ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-slate-700">
              {t("admin.operations.filterStatus")}
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
                <option value="">{t("admin.operations.all")}</option>
              </select>
            </label>
            <button
              type="button"
              disabled={exportingTx || loading}
              onClick={() => void handleExportTransactions()}
              className={`${btnOutline} min-h-[40px] px-4 text-sm`}
            >
              {exportingTx ? t("admin.operations.exporting") : t("admin.operations.downloadCsv")}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {t("admin.operations.csvHintTx")}
          </p>

          {loading ? (
            <ListSkeleton rows={4} />
          ) : transactions.length === 0 ? (
            <EmptyState
              title={t("admin.operations.noTransactions")}
              hint={t("admin.operations.noTransactionsHint")}
            />
          ) : (
            <ul className="space-y-4">
              {transactions.map((tx) => (
                <li key={tx.id} className={`${cardSurface} space-y-3`}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <StatusChip
                        label={transactionStatusMeta(tx.status).label}
                        tone={transactionStatusMeta(tx.status).tone}
                      />
                      <p className="text-sm font-medium text-slate-900">
                        {tx.patient.fullName}
                        <span className="font-normal text-slate-500">
                          {" "}
                          · {tx.patient.email}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">
                        {tx.paymentMethod} · {formatIdr(tx.amount)}
                      </p>
                      <p className="text-xs text-slate-600">
                        {adminOperationReferenceLabel(tx)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t("admin.operations.createdWord")}{" "}
                        {new Date(tx.createdAt).toLocaleString("id-ID")}
                      </p>
                      <PaymentProofLink
                        transactionId={tx.id}
                        paymentProofUrl={tx.paymentProofUrl}
                      />
                    </div>
                  </div>
                  {tx.status === "PENDING" ? (
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      {!tx.hasPaymentProof ? (
                        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-xl">
                          {t("admin.operations.waitPaymentProof")}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        disabled={
                          confirmingPayId === tx.id || !tx.hasPaymentProof
                        }
                        onClick={() => void confirmPayment(tx.id)}
                        className={`${btnPrimary} min-h-[44px] text-sm disabled:opacity-50`}
                      >
                        {confirmingPayId === tx.id
                          ? t("admin.operations.processing")
                          : t("admin.operations.confirmPayment")}
                      </button>
                    </div>
                  ) : null}
                  {tx.status === "PAID" ? (
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <textarea
                        className={`${inputBase} min-h-[72px]`}
                        placeholder={t("admin.operations.refundReasonPlaceholder")}
                        value={refundReasonById[tx.id] ?? ""}
                        onChange={(e) =>
                          setRefundReasonById((prev) => ({
                            ...prev,
                            [tx.id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        disabled={refundingId === tx.id}
                        onClick={() => requestRefund(tx.id)}
                        className={`${btnDanger} min-h-[44px] text-sm`}
                      >
                        {t("admin.operations.refundDummy")}
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
              {t("admin.operations.filterBookingStatus")}
              <select
                className={`${inputBase} ml-2 mt-1 min-h-[40px]`}
                value={bookingStatus}
                onChange={(e) =>
                  setBookingStatus(
                    e.target.value as "" | "PENDING" | "CONFIRMED",
                  )
                }
              >
                <option value="PENDING">{t("admin.operations.bookingStatusPending")}</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="">{t("admin.operations.all")}</option>
              </select>
            </label>
            <button
              type="button"
              disabled={exportingBk || loading}
              onClick={() => void handleExportBookings()}
              className={`${btnOutline} min-h-[40px] px-4 text-sm`}
            >
              {exportingBk ? t("admin.operations.exporting") : t("admin.operations.downloadCsv")}
            </button>
          </div>
          <p className="text-sm text-slate-600">
            {t("admin.operations.bookingMonitorHint")}
          </p>
          {loading ? (
            <ListSkeleton rows={4} />
          ) : bookings.length === 0 ? (
            <EmptyState title={t("admin.operations.noBookings")} />
          ) : (
            <div className={adminScrollWrap}>
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">{t("admin.operations.colTime")}</th>
                    <th className="py-2 pr-4">{t("admin.operations.colPatient")}</th>
                    <th className="py-2 pr-4">{t("admin.operations.colPhysio")}</th>
                    <th className="py-2 pr-4">{t("admin.operations.colStatus")}</th>
                    <th className="py-2 pr-4">{t("admin.operations.colFee")}</th>
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
        title={t("admin.operations.refundConfirmTitle")}
        description={t("admin.operations.refundConfirmDesc")}
        confirmLabel={t("admin.operations.refundConfirmYes")}
        cancelLabel={t("admin.common.cancel")}
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
