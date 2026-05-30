"use client";

import {
  AlertBanner,
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
import {
  consultationHasOpenTransaction,
  consultationPatientActionHint,
  consultationStatusLabelForPatient,
  consultationTherapistActionHint,
  getOpenTransactionForConsultation,
} from "@/lib/booking-flow";
import { formatIdr } from "@/lib/format/currency";
import { consultationStatusMetaForDisplay } from "@/lib/status-meta";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/contexts/toast-context";
import { actionSuccessWithNotify } from "@/lib/notifications/action-feedback";
import { ApiRequestError } from "@/lib/api/client";
import { friendlyFetchError } from "@/lib/api/fetch-reliable";
import { validateComplaint, validatePaymentProof } from "@/lib/validation";
import {
  createConsultation,
  listMyConsultations,
  updateConsultationStatus,
  type Consultation,
  type ConsultationSlaTier,
  type UpdateConsultationStatusBody,
} from "@/lib/api/consultations";
import { browsePhysiotherapists } from "@/lib/api/physiotherapists";
import { createOrGetConversation } from "@/lib/api/chat";
import type { Transaction } from "@/lib/api/contract";
import {
  createTransaction,
  listTransactions,
} from "@/lib/api/transactions";
import type { PhysiotherapistBrowseItem } from "@/lib/api/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ConsultationPayProof = { file: File | null; url: string };

export default function ConsultationsPage() {
  const { user, isReady } = useAuth();
  const { t, language } = useLanguage();
  const toast = useToast();
  const router = useRouter();
  const [rows, setRows] = useState<Consultation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [therapists, setTherapists] = useState<PhysiotherapistBrowseItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [proofByConsultationId, setProofByConsultationId] = useState<
    Record<string, ConsultationPayProof>
  >({});
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [physiotherapistId, setPhysiotherapistId] = useState("");
  const [complaint, setComplaint] = useState("");
  const [slaTier, setSlaTier] = useState<ConsultationSlaTier>("STANDARD");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await listMyConsultations({ page: 1, limit: 50 });
      setRows(list);
      if (user?.role === "PATIENT") {
        const [browse, txList] = await Promise.all([
          browsePhysiotherapists({ limit: 50, page: 1 }),
          listTransactions({ page: 1, limit: 50 }),
        ]);
        setTherapists(browse.items);
        setTransactions(txList);
      } else {
        setTransactions([]);
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
    void load();
  }, [isReady, user, load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const complaintValidation = validateComplaint(complaint);
    if (!complaintValidation.ok) {
      setError(complaintValidation.message);
      return;
    }
    if (!physiotherapistId) {
      setError(t("booking.cons.error.pickTherapist"));
      return;
    }
    if (slaTier === "FAST_ONLINE") {
      const selected = therapists.find((x) => x.id === physiotherapistId);
      const online =
        selected?.onlineUntil != null &&
        new Date(String(selected.onlineUntil)) > new Date();
      if (!online) {
        setError(t("booking.cons.error.fastOnline"));
        return;
      }
    }
    setSubmitting(true);
    setError(null);
    try {
      await createConsultation({
        physiotherapistId,
        complaint: complaint.trim(),
        slaTier: slaTier === "FAST_ONLINE" ? "FAST_ONLINE" : undefined,
      });
      setComplaint("");
      setSlaTier("STANDARD");
      actionSuccessWithNotify(toast, t("booking.cons.toast.requested"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("booking.cons.error.create"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function openChat(consultationId: string) {
    try {
      const conv = (await createOrGetConversation({
        consultationId,
      })) as { id: string };
      router.push(`/chat/${conv.id}`);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("booking.cons.error.openChat"),
      );
    }
  }

  async function patchStatus(
    id: string,
    status: UpdateConsultationStatusBody["status"],
  ) {
    setError(null);
    try {
      await updateConsultationStatus(id, { status });
      const labels: Record<string, string> = {
        ACCEPTED: t("booking.cons.toast.accepted"),
        COMPLETED: t("booking.cons.toast.completed"),
      };
      if (labels[status]) actionSuccessWithNotify(toast, labels[status]);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("booking.cons.error.update"),
      );
    }
  }

  async function confirmCancelConsultation() {
    if (!cancelConfirmId) return;
    setCancelLoading(true);
    setError(null);
    try {
      await updateConsultationStatus(cancelConfirmId, { status: "CANCELLED" });
      setCancelConfirmId(null);
      toast.success(t("booking.cons.toast.cancelled"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("booking.cons.error.cancel"),
      );
    } finally {
      setCancelLoading(false);
    }
  }

  // Patient initiates payment for an ACCEPTED consultation. The dummy
  // gateway is just a POST that lands in PENDING; admin will confirm.
  async function payConsultation(row: Consultation) {
    if (row.status !== "ACCEPTED") return;
    if (!row.feeSnapshot) {
      setError(t("booking.cons.error.unknownFee"));
      return;
    }
    const proof =
      proofByConsultationId[row.id] ?? ({ file: null, url: "" } satisfies ConsultationPayProof);
    const trimmedUrl = proof.url.trim();
    const proofValidation = validatePaymentProof({
      proofFile: proof.file,
      paymentProofUrl: trimmedUrl,
    });
    if (!proofValidation.ok) {
      setError(proofValidation.message);
      return;
    }
    setError(null);
    setPayingId(row.id);
    try {
      await createTransaction({
        consultationId: row.id,
        paymentMethod: "BANK_TRANSFER",
        paymentProofUrl: trimmedUrl || undefined,
        proofFile: proof.file ?? undefined,
      });
      setProofByConsultationId((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
      actionSuccessWithNotify(toast, t("booking.cons.toast.paid"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("booking.cons.error.pay"),
      );
    } finally {
      setPayingId(null);
    }
  }

  function setConsultationProof(
    consultationId: string,
    patch: Partial<ConsultationPayProof>,
  ) {
    setProofByConsultationId((prev) => {
      const cur = prev[consultationId] ?? { file: null, url: "" };
      return { ...prev, [consultationId]: { ...cur, ...patch } };
    });
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message={t("booking.cons.signIn")} />;
  }

  return (
    <main className={`${widePageShell} space-y-10 pb-16`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow={t("booking.cons.eyebrow")}
          title={t("booking.cons.title")}
          description={
            user.role === "PHYSIOTHERAPIST"
              ? t("booking.cons.desc.pt")
              : user.role === "ADMIN"
                ? t("booking.cons.desc.admin")
                : t("booking.cons.desc.patient")
          }
        />
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="/therapists"
            className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
          >
            {t("booking.cons.link.findTherapist")}
          </Link>
          <Link
            href="/chat"
            className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[10rem]`}
          >
            {t("booking.cons.link.chatList")}
          </Link>
        </div>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}
      {loadError && !loading ? (
        <LoadErrorCard message={loadError} onRetry={() => void load()} />
      ) : null}

      {user.role === "PATIENT" && (
        <section
          id="ajukan-konsultasi"
          className={`${cardSurface} space-y-4 scroll-mt-24`}
        >
          <h2 className="text-lg font-semibold text-slate-900">
            {t("booking.cons.form.title")}
          </h2>
          <p className="text-sm text-slate-600">
            {t("booking.cons.form.flowPrefix")}{" "}
            <strong>{t("booking.cons.form.flowAccept")}</strong> →{" "}
            {t("booking.cons.form.flowYou")}{" "}
            <strong>{t("booking.cons.form.flowAttach")}</strong>{" "}
            {t("booking.cons.form.flowThen")}{" "}
            <strong>{t("booking.cons.form.flowPay")}</strong> →{" "}
            {t("booking.cons.form.flowSuffix")}
          </p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                {t("booking.cons.form.therapistLabel")}
              </label>
              <select
                required
                className={inputBase}
                value={physiotherapistId}
                onChange={(e) => setPhysiotherapistId(e.target.value)}
              >
                <option value="">{t("booking.cons.form.choose")}</option>
                {therapists.map((therapist) => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.user.fullName}
                    {therapist.consultationFee != null &&
                    therapist.consultationFee !== ""
                      ? ` · online ${formatIdr(String(therapist.consultationFee))}`
                      : ""}
                    {therapist.visitFee != null && therapist.visitFee !== ""
                      ? ` · visit ${formatIdr(String(therapist.visitFee))}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-700">
                {t("booking.cons.form.slaLegend")}
              </legend>
              <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="slaTier"
                  checked={slaTier === "STANDARD"}
                  onChange={() => setSlaTier("STANDARD")}
                  className="mt-1"
                />
                <span>
                  <strong>{t("booking.cons.form.standardTitle")}</strong>{" "}
                  {t("booking.cons.form.standardDesc")}
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="slaTier"
                  checked={slaTier === "FAST_ONLINE"}
                  onChange={() => setSlaTier("FAST_ONLINE")}
                  className="mt-1"
                />
                <span>
                  <strong>{t("booking.cons.form.fastTitle")}</strong>{" "}
                  {t("booking.cons.form.fastDescBefore")}{" "}
                  <em>{t("booking.cons.form.fastOnlineWord")}</em>{" "}
                  {t("booking.cons.form.fastDescAfter")}
                </span>
              </label>
            </fieldset>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                {t("booking.cons.form.complaintLabel")}
              </label>
              <textarea
                required
                minLength={10}
                className={`${inputBase} min-h-[120px]`}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || loading}
              className={`${btnPrimary} min-h-[44px]`}
            >
              {submitting
                ? t("booking.cons.form.sending")
                : t("booking.cons.form.send")}
            </button>
          </form>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {t("booking.cons.list.title")}
        </h2>
        {loading ? (
          <ListSkeleton rows={3} />
        ) : loadError ? null : rows.length === 0 ? (
          <EmptyState
            title={t("booking.cons.empty.title")}
            hint={
              user.role === "PATIENT"
                ? t("booking.cons.empty.hintPatient")
                : t("booking.cons.empty.hintOther")
            }
            actions={
              user.role === "PATIENT"
                ? [
                    {
                      href: "#ajukan-konsultasi",
                      label: t("booking.cons.action.request"),
                    },
                    {
                      href: "/therapists",
                      label: t("booking.cons.action.findTherapist"),
                      variant: "secondary",
                    },
                  ]
                : [
                    {
                      href: "/physiotherapist/profile",
                      label: t("booking.cons.action.manageProfile"),
                      variant: "secondary",
                    },
                  ]
            }
          />
        ) : (
          <ul className="space-y-4">
            {rows.map((c) => {
              const isPatient = user.role === "PATIENT";
              const isPt = user.role === "PHYSIOTHERAPIST";
              const isAdmin = user.role === "ADMIN";
              const openTx = getOpenTransactionForConsultation(
                c.id,
                transactions,
              );
              const statusMeta = isPatient
                ? consultationStatusMetaForDisplay(
                    c.status,
                    {
                      patientLabel: consultationStatusLabelForPatient(
                        c.status,
                        openTx,
                        language,
                      ),
                    },
                    language,
                  )
                : consultationStatusMetaForDisplay(c.status, undefined, language);
              const actionHint = isPatient
                ? consultationPatientActionHint(c.status, openTx, language)
                : isPt
                  ? consultationTherapistActionHint(c.status, openTx, language)
                  : null;

              const canChat =
                c.status === "IN_PROGRESS" ||
                (isAdmin && c.status !== "CANCELLED");
              const canPay =
                isPatient &&
                c.status === "ACCEPTED" &&
                !consultationHasOpenTransaction(c.id, transactions);
              const waitingAdminPay =
                isPatient &&
                c.status === "ACCEPTED" &&
                openTx?.status === "PENDING";
              const canCancel =
                isPatient &&
                (c.status === "REQUESTED" || c.status === "ACCEPTED");
              const canComplete =
                (isPatient || isPt) && c.status === "IN_PROGRESS";
              const canAccept = isPt && c.status === "REQUESTED";

              return (
                <li
                  key={c.id}
                  className={`${cardSurface} flex flex-col gap-3 md:flex-row md:justify-between md:items-start`}
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusChip
                        label={statusMeta.label}
                        tone={statusMeta.tone}
                      />
                      <span className="text-xs text-slate-500">
                        {new Date(c.createdAt).toLocaleString("id-ID")}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-700">
                        {t("booking.cons.item.fee")}{" "}
                        <strong>{formatIdr(c.feeSnapshot)}</strong>
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-600">
                        {t("booking.cons.item.sla")}{" "}
                        {c.slaTier === "FAST_ONLINE"
                          ? t("booking.cons.item.slaFast")
                          : t("booking.cons.item.slaStandard")}
                      </span>
                    </div>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {c.complaint}
                    </p>
                    {actionHint ? (
                      <p className="text-xs text-slate-600 leading-relaxed rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                        {actionHint}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0 md:justify-end">
                    {waitingAdminPay && (
                      <Link
                        href="/transactions"
                        className={`${btnSecondary} min-h-[44px] justify-center px-4 text-center`}
                      >
                        {t("booking.cons.btn.viewPayment")}
                      </Link>
                    )}
                    {canPay && (
                      <div className="w-full md:w-auto md:max-w-xs space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                        <p className="text-xs font-medium text-slate-700">
                          {t("booking.cons.pay.proofLabel")}
                        </p>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          disabled={payingId === c.id}
                          className={`${inputBase} py-2 text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-white file:px-2 file:py-1 file:text-xs`}
                          onChange={(e) =>
                            setConsultationProof(c.id, {
                              file: e.target.files?.[0] ?? null,
                            })
                          }
                        />
                        <input
                          type="url"
                          disabled={payingId === c.id}
                          className={`${inputBase} text-sm`}
                          placeholder={t("booking.cons.pay.proofPlaceholder")}
                          value={
                            proofByConsultationId[c.id]?.url ?? ""
                          }
                          onChange={(e) =>
                            setConsultationProof(c.id, {
                              url: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => void payConsultation(c)}
                          disabled={payingId === c.id}
                          className={`${btnPrimary} min-h-[44px] w-full justify-center sm:w-auto`}
                        >
                          {payingId === c.id
                            ? t("booking.cons.pay.processing")
                            : `${t("booking.cons.pay.payPrefix")} ${formatIdr(c.feeSnapshot)}`}
                        </button>
                      </div>
                    )}
                    {canChat && (
                      <button
                        type="button"
                        onClick={() => void openChat(c.id)}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-900 transition-colors hover:bg-teal-100/80"
                      >
                        {t("booking.cons.btn.openChat")}
                      </button>
                    )}
                    {canAccept && (
                      <button
                        type="button"
                        onClick={() => void patchStatus(c.id, "ACCEPTED")}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-100/80"
                      >
                        {t("booking.cons.btn.accept")}
                      </button>
                    )}
                    {canComplete && (
                      <button
                        type="button"
                        onClick={() => void patchStatus(c.id, "COMPLETED")}
                        className={`${btnOutline} min-h-[44px] justify-center bg-slate-50 px-4`}
                      >
                        {t("booking.cons.btn.complete")}
                      </button>
                    )}
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => setCancelConfirmId(c.id)}
                        className={`${btnOutline} min-h-[44px] justify-center px-4`}
                      >
                        {t("booking.cons.btn.cancel")}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={cancelConfirmId !== null}
        title={t("booking.cons.confirm.title")}
        description={t("booking.cons.confirm.desc")}
        confirmLabel={t("booking.cons.confirm.yes")}
        cancelLabel={t("booking.cons.confirm.no")}
        variant="danger"
        loading={cancelLoading}
        onConfirm={() => void confirmCancelConsultation()}
        onCancel={() => {
          if (!cancelLoading) setCancelConfirmId(null);
        }}
      />
    </main>
  );
}
