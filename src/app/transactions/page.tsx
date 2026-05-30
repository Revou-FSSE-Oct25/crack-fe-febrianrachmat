"use client";

import {
  AdminBreadcrumb,
  AlertBanner,
  btnDanger,
  btnOutline,
  btnPrimary,
  btnSecondary,
  cardSurface,
  EmptyState,
  inputBase,
  ListSkeleton,
  PageHeader,
  ConfirmDialog,
  PageLoading,
  StatusChip,
  widePageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
import { LoadErrorCard } from "@/components/ui/load-error-card";
import { transactionStatusMeta } from "@/lib/status-meta";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/contexts/toast-context";
import { actionSuccessWithNotify } from "@/lib/notifications/action-feedback";
import { PaymentProofLink } from "@/components/PaymentProofLink";
import { ApiRequestError } from "@/lib/api/client";
import { friendlyFetchError } from "@/lib/api/fetch-reliable";
import { hasTransactionPaymentProof } from "@/lib/api/payment-proof";
import {
  bookingHasOpenTransaction,
  isBookingPayable,
} from "@/lib/booking-flow";
import { formatIdr } from "@/lib/format/currency";
import { validatePaymentProof, validateRefundReason } from "@/lib/validation";
import { listMyBookings } from "@/lib/api/bookings";
import { transactionReferenceLabel } from "@/lib/api/contract";
import {
  confirmTransactionPaidByAdmin,
  createTransaction,
  listTransactions,
  refundTransaction,
  type CreateTransactionBody,
  type Transaction,
} from "@/lib/api/transactions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

type PendingBookingPay = {
  id: string;
  visitFeeSnapshot: string | number;
};

export default function TransactionsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <TransactionsPageContent />
    </Suspense>
  );
}

function TransactionsPageContent() {
  const { user, isReady } = useAuth();
  const { t, language } = useLanguage();
  const toast = useToast();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<Transaction[]>([]);
  const [pendingBookings, setPendingBookings] = useState<PendingBookingPay[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [bookingId, setBookingId] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<CreateTransactionBody["paymentMethod"]>("QRIS");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [refundReasonById, setRefundReasonById] = useState<
    Record<string, string>
  >({});
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [refundConfirmId, setRefundConfirmId] = useState<string | null>(null);
  const [confirmingPayId, setConfirmingPayId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await listTransactions({ page: 1, limit: 50 });
      setRows(list);
      if (user?.role === "PATIENT") {
        const bookings = await listMyBookings({ page: 1, limit: 50 });
        const opts: PendingBookingPay[] = bookings
          .filter(
            (b) =>
              isBookingPayable(b.status) &&
              !bookingHasOpenTransaction(b.id, list),
          )
          .map((b) => ({
            id: b.id,
            visitFeeSnapshot: b.visitFeeSnapshot,
          }));
        setPendingBookings(opts);
      }
    } catch (err) {
      setLoadError(
        err instanceof ApiRequestError
          ? err.message
          : friendlyFetchError(err),
      );
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (!isReady || !user) return;
    if (user.role === "PHYSIOTHERAPIST") {
      setLoading(false);
      return;
    }
    void load();
  }, [isReady, user, load]);

  useEffect(() => {
    const fromQuery = searchParams.get("bookingId");
    if (fromQuery) {
      setBookingId(fromQuery);
    }
  }, [searchParams]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingId) {
      setError(t("booking.tx.error.pickBooking"));
      return;
    }
    const trimmedProofUrl = paymentProofUrl.trim();
    const proofValidation = validatePaymentProof({
      proofFile,
      paymentProofUrl: trimmedProofUrl,
    });
    if (!proofValidation.ok) {
      setError(proofValidation.message);
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createTransaction({
        bookingId,
        paymentMethod,
        paymentProofUrl: trimmedProofUrl || undefined,
        proofFile: proofFile ?? undefined,
      });
      setBookingId("");
      setPaymentProofUrl("");
      setProofFile(null);
      actionSuccessWithNotify(toast, t("booking.tx.toast.created"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("booking.tx.error.create"),
      );
    } finally {
      setCreating(false);
    }
  }

  async function confirmPaymentAsAdmin(id: string) {
    setConfirmingPayId(id);
    setError(null);
    try {
      await confirmTransactionPaidByAdmin(id);
      actionSuccessWithNotify(toast, t("booking.tx.toast.paymentConfirmed"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("booking.tx.error.confirm"),
      );
    } finally {
      setConfirmingPayId(null);
    }
  }

  function requestRefundConfirm(id: string) {
    const reason = (refundReasonById[id] ?? "").trim();
    const refundValidation = validateRefundReason(reason);
    if (!refundValidation.ok) {
      setError(refundValidation.message);
      return;
    }
    setError(null);
    setRefundConfirmId(id);
  }

  async function confirmRefund() {
    if (!refundConfirmId) return;
    const id = refundConfirmId;
    const reason = (refundReasonById[id] ?? "").trim();
    setRefundingId(id);
    setError(null);
    try {
      await refundTransaction(id, { reason });
      setRefundReasonById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setRefundConfirmId(null);
      toast.success(t("booking.tx.toast.refunded"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("booking.tx.error.refund"),
      );
    } finally {
      setRefundingId(null);
    }
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message={t("booking.tx.signIn")} />;
  }

  if (user.role === "PHYSIOTHERAPIST") {
    return (
      <main className={`${widePageShell} space-y-6 pb-16`}>
        <PageHeader
          eyebrow={t("booking.tx.eyebrow")}
          title={t("booking.tx.title")}
          description={t("booking.tx.pt.desc")}
        />
        <div className={`${cardSurface} space-y-4`}>
          <p className="text-sm leading-relaxed text-slate-700">
            {t("booking.tx.pt.note")}
          </p>
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap">
            <Link
              href="/bookings"
              className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
            >
              {t("booking.tx.link.bookings")}
            </Link>
            <Link
              href="/consultations"
              className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[11rem]`}
            >
              {t("booking.tx.link.consultations")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      {user.role === "ADMIN" ? <AdminBreadcrumb /> : null}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow={t("booking.tx.eyebrow")}
          title={t("booking.tx.title")}
          description={
            user.role === "ADMIN"
              ? t("booking.tx.desc.admin")
              : t("booking.tx.desc.patient")
          }
        />
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          {user.role === "PATIENT" ? (
            <>
              <Link
                href="/bookings"
                className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
              >
                {t("booking.tx.link.bookings")}
              </Link>
              <Link
                href="/consultations"
                className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[11rem]`}
              >
                {t("booking.tx.link.consultations")}
              </Link>
            </>
          ) : null}
        </div>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}
      {loadError && !loading ? (
        <LoadErrorCard message={loadError} onRetry={() => void load()} />
      ) : null}

      {user.role === "PATIENT" && (
        <section className={`${cardSurface} space-y-4`}>
          <h2 className="text-lg font-semibold text-slate-900">
            {t("booking.tx.create.title")}
          </h2>
          <form onSubmit={handleCreate} className="space-y-3 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                {t("booking.tx.create.bookingLabel")}
              </label>
              <select
                required
                className={inputBase}
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
              >
                <option value="">{t("booking.tx.create.chooseBooking")}</option>
                {pendingBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id.slice(0, 8)}… · {formatIdr(b.visitFeeSnapshot)}
                  </option>
                ))}
              </select>
              {pendingBookings.length === 0 ? (
                <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 mt-2 leading-relaxed">
                  {t("booking.tx.create.noPendingBefore")}{" "}
                  <Link href="/bookings" className="font-medium underline">
                    {t("booking.tx.link.bookings")}
                  </Link>
                  .
                </p>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                {t("booking.tx.create.methodLabel")}
              </label>
              <select
                className={inputBase}
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as CreateTransactionBody["paymentMethod"],
                  )
                }
              >
                <option value="QRIS">QRIS</option>
                <option value="BANK_TRANSFER">
                  {t("booking.tx.method.bankTransfer")}
                </option>
                <option value="E_WALLET">{t("booking.tx.method.eWallet")}</option>
                <option value="CREDIT_CARD">
                  {t("booking.tx.method.creditCard")}
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                {t("booking.tx.create.proofLabel")}
              </label>
              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                {t("booking.tx.create.proofHint")}
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                className={`${inputBase} py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm`}
                onChange={(e) =>
                  setProofFile(e.target.files?.[0] ?? null)
                }
              />
              <input
                type="url"
                className={`${inputBase} mt-2`}
                placeholder={t("booking.tx.create.proofPlaceholder")}
                value={paymentProofUrl}
                onChange={(e) => setPaymentProofUrl(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className={`${btnPrimary} min-h-[44px]`}
            >
              {creating
                ? t("booking.tx.create.saving")
                : t("booking.tx.create.submit")}
            </button>
          </form>
          <p className="text-sm text-slate-600 max-w-md leading-relaxed">
            {t("booking.tx.create.footer1")}{" "}
            <strong>{t("booking.tx.create.footerOnline")}</strong>{" "}
            {t("booking.tx.create.footer2")}{" "}
            <Link href="/consultations" className="text-teal-700 underline font-medium">
              {t("booking.tx.link.consultations")}
            </Link>{" "}
            {t("booking.tx.create.footer3")}{" "}
            <strong>{t("booking.tx.create.footerBooking")}</strong>.{" "}
            {t("booking.tx.create.footer4")}
          </p>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {t("booking.tx.list.title")}
        </h2>
        {user.role === "ADMIN" && (
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("booking.tx.admin.seg1")} <strong>PENDING</strong>{" "}
            {t("booking.tx.admin.seg2")}
            <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono">
              PATCH /admin/transactions/:transactionId/pay
            </code>
            {t("booking.tx.admin.seg3")} <strong>PAID</strong>
            {t("booking.tx.admin.seg4")}{" "}
            <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono">
              PATCH /admin/transactions/:transactionId/refund
            </code>{" "}
            {t("booking.tx.admin.seg5")}
          </p>
        )}
        {loading ? (
          <ListSkeleton rows={3} />
        ) : loadError ? null : rows.length === 0 ? (
          <EmptyState
            title={t("booking.tx.empty.title")}
            hint={
              user.role === "PATIENT"
                ? t("booking.tx.empty.hintPatient")
                : t("booking.tx.empty.hintAdmin")
            }
            actions={
              user.role === "PATIENT"
                ? [
                    {
                      href: "/bookings",
                      label: t("booking.tx.action.myBookings"),
                    },
                    {
                      href: "/appointment",
                      label: t("booking.tx.action.newAppointment"),
                      variant: "secondary",
                    },
                  ]
                : [
                    {
                      href: "/admin/dashboard",
                      label: t("booking.tx.action.backDashboard"),
                    },
                  ]
            }
          />
        ) : (
          <ul className="space-y-4">
            {rows.map((tx) => (
              <li key={tx.id} className={`${cardSurface} space-y-3`}>
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <div className="min-w-0 flex-1 space-y-2">
                    <StatusChip
                      label={transactionStatusMeta(tx.status, language).label}
                      tone={transactionStatusMeta(tx.status, language).tone}
                    />
                    <p className="text-sm text-slate-600">
                      {tx.paymentMethod} · {formatIdr(tx.amount)}
                    </p>
                    <p className="text-xs text-slate-600">
                      {transactionReferenceLabel(tx)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-mono break-all">
                      {tx.id}
                    </p>
                    <PaymentProofLink
                      transactionId={tx.id}
                      paymentProofUrl={tx.paymentProofUrl}
                    />
                  </div>
                  {user.role === "PATIENT" && tx.status === "PENDING" && (
                    <span className="text-sm text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-xl shrink-0 max-w-xs">
                      {t("booking.tx.item.waitingAdmin")}
                    </span>
                  )}
                </div>
                {user.role === "ADMIN" && tx.status === "PENDING" && (
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    {!hasTransactionPaymentProof(tx.paymentProofUrl) ? (
                      <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-xl">
                        {t("booking.tx.item.confirmDisabled")}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={
                        confirmingPayId === tx.id ||
                        !hasTransactionPaymentProof(tx.paymentProofUrl)
                      }
                      onClick={() => void confirmPaymentAsAdmin(tx.id)}
                      className={`${btnPrimary} min-h-[44px] text-sm disabled:pointer-events-none disabled:opacity-50`}
                    >
                      {confirmingPayId === tx.id
                        ? t("booking.tx.item.processing")
                        : t("booking.tx.item.confirmPay")}
                    </button>
                  </div>
                )}
                {user.role === "ADMIN" && tx.status === "PAID" && (
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <label className="block text-sm text-slate-700">
                      {t("booking.tx.item.refundReasonLabel")}
                    </label>
                    <textarea
                      className={`${inputBase} min-h-[72px]`}
                      placeholder={t("booking.tx.item.refundPlaceholder")}
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
                      onClick={() => requestRefundConfirm(tx.id)}
                      className={`${btnDanger} min-h-[44px] text-sm`}
                    >
                      {refundingId === tx.id
                        ? t("booking.tx.item.processing")
                        : t("booking.tx.item.refundBtn")}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={refundConfirmId !== null}
        title={t("booking.tx.confirm.title")}
        description={t("booking.tx.confirm.desc")}
        confirmLabel={t("booking.tx.confirm.yes")}
        cancelLabel={t("booking.tx.confirm.no")}
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
