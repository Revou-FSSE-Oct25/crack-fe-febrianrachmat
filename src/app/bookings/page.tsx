"use client";

import {
  AlertBanner,
  btnOutline,
  btnPrimary,
  btnSecondary,
  cardSurface,
  inputBase,
  EmptyState,
  ListSkeleton,
  PageHeader,
  ConfirmDialog,
  PageLoading,
  StatusChip,
  widePageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
import { LoadErrorCard } from "@/components/ui/load-error-card";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/contexts/toast-context";
import { actionSuccessWithNotify } from "@/lib/notifications/action-feedback";
import { ApiRequestError } from "@/lib/api/client";
import { friendlyFetchError } from "@/lib/api/fetch-reliable";
import {
  listAvailabilitySlotsForProfile,
  type AvailabilitySlotItem,
} from "@/lib/api/availability-slots";
import {
  listMyBookings,
  rescheduleBooking,
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

function toLocalDatetimeInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function formatIdDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID");
}

export default function BookingsPage() {
  const { user, isReady } = useAuth();
  const { t, language } = useLanguage();
  const toast = useToast();
  const [rows, setRows] = useState<Booking[]>([]);
  const [openTxBookingIds, setOpenTxBookingIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(
    null,
  );
  const [rescheduleSlotId, setRescheduleSlotId] = useState("");
  const [rescheduleDateLocal, setRescheduleDateLocal] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<AvailabilitySlotItem[]>(
    [],
  );
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
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

  useEffect(() => {
    if (!rescheduleBookingId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !rescheduleLoading) {
        setRescheduleBookingId(null);
      }
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [rescheduleBookingId, rescheduleLoading]);

  async function patchStatus(id: string, status: UpdateBookingStatusBody["status"]) {
    setError(null);
    try {
      await updateBookingStatus(id, { status });
      const labels: Record<string, string> = {
        CONFIRMED: t("booking.bookings.toast.confirmed"),
        IN_PROGRESS: t("booking.bookings.toast.started"),
        COMPLETED: t("booking.bookings.toast.completed"),
      };
      if (labels[status]) actionSuccessWithNotify(toast, labels[status]);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("booking.bookings.error.update"),
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
      actionSuccessWithNotify(toast, t("booking.bookings.toast.cancelled"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("booking.bookings.error.cancel"),
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function startReschedule(booking: Booking) {
    setError(null);
    setRescheduleBookingId(booking.id);
    setRescheduleSlotId("");
    setRescheduleDateLocal(toLocalDatetimeInputValue(booking.appointmentDate));
    setRescheduleSlots([]);
    setRescheduleSlotsLoading(true);
    try {
      const resp = await listAvailabilitySlotsForProfile(booking.physiotherapistId, {
        page: 1,
        limit: 50,
      });
      setRescheduleSlots(resp.items);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("booking.bookings.error.loadRescheduleSlots"),
      );
    } finally {
      setRescheduleSlotsLoading(false);
    }
  }

  async function submitReschedule() {
    if (!rescheduleBookingId) return;
    setError(null);
    const selectedSlot = rescheduleSlots.find((s) => s.id === rescheduleSlotId);
    if (!selectedSlot && !rescheduleDateLocal) {
      setError(t("booking.bookings.error.pickSlotOrManual"));
      return;
    }
    let appointmentDate: string | undefined;
    if (!selectedSlot && rescheduleDateLocal) {
      const parsed = new Date(rescheduleDateLocal);
      if (Number.isNaN(parsed.getTime())) {
        setError(t("booking.bookings.error.invalidRescheduleTime"));
        return;
      }
      if (parsed <= new Date()) {
        setError(t("booking.bookings.error.rescheduleFuture"));
        return;
      }
      appointmentDate = parsed.toISOString();
    }

    setRescheduleLoading(true);
    try {
      await rescheduleBooking(rescheduleBookingId, {
        slotId: selectedSlot?.id,
        appointmentDate: selectedSlot ? undefined : appointmentDate,
      });
      actionSuccessWithNotify(toast, t("booking.bookings.toast.rescheduled"));
      setRescheduleBookingId(null);
      setRescheduleSlotId("");
      setRescheduleDateLocal("");
      setRescheduleSlots([]);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("booking.bookings.error.reschedule"),
      );
    } finally {
      setRescheduleLoading(false);
    }
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message={t("booking.bookings.signIn")} />;
  }

  const terminal = new Set(["COMPLETED", "CANCELLED"]);
  const isPatient = user.role === "PATIENT";
  const isPt = user.role === "PHYSIOTHERAPIST";
  const activeRescheduleBooking = rows.find((r) => r.id === rescheduleBookingId) ?? null;
  const selectedRescheduleSlot =
    rescheduleSlots.find((slot) => slot.id === rescheduleSlotId) ?? null;

  let rescheduleNextTimeLabel = t("booking.bookings.reschedule.notChosen");
  if (selectedRescheduleSlot) {
    rescheduleNextTimeLabel = formatIdDateTime(selectedRescheduleSlot.startTime);
  } else if (rescheduleDateLocal) {
    const parsedManual = new Date(rescheduleDateLocal);
    if (!Number.isNaN(parsedManual.getTime())) {
      rescheduleNextTimeLabel = parsedManual.toLocaleString("id-ID");
    } else {
      rescheduleNextTimeLabel = t("booking.bookings.reschedule.invalidFormat");
    }
  }

  const pageDescription = isPatient
    ? t("booking.bookings.desc.patient")
    : isPt
      ? t("booking.bookings.desc.pt")
      : t("booking.bookings.desc.admin");

  return (
    <main className={`${widePageShell} space-y-6 pb-16`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow={t("booking.bookings.eyebrow")}
          title={t("booking.bookings.title")}
          description={pageDescription}
        />
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="/calendar"
            className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[10rem]`}
          >
            {t("booking.bookings.link.calendar")}
          </Link>
          {isPatient ? (
            <>
              <Link
                href="/appointment"
                className={`${btnPrimary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
              >
                {t("booking.bookings.link.newAppointment")}
              </Link>
              <Link
                href="/transactions"
                className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
              >
                {t("booking.bookings.link.transactions")}
              </Link>
              <Link
                href="/therapists"
                className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[11rem]`}
              >
                {t("booking.bookings.link.findTherapist")}
              </Link>
            </>
          ) : isPt ? (
            <Link
              href="/physiotherapist/availability"
              className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[12rem]`}
            >
              {t("booking.bookings.link.manageSlots")}
            </Link>
          ) : null}
        </div>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loadError && !loading ? (
        <LoadErrorCard message={loadError} onRetry={() => void load()} />
      ) : null}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : loadError ? null : rows.length === 0 ? (
        <EmptyState
          title={t("booking.bookings.empty.title")}
          hint={
            isPatient
              ? t("booking.bookings.empty.hintPatient")
              : t("booking.bookings.empty.hintPt")
          }
          actions={
            isPatient
              ? [
                  {
                    href: "/appointment",
                    label: t("booking.bookings.action.newAppointment"),
                  },
                  {
                    href: "/therapists",
                    label: t("booking.bookings.action.findTherapist"),
                    variant: "secondary",
                  },
                ]
              : [
                  {
                    href: "/physiotherapist/availability",
                    label: t("booking.bookings.action.manageSlots"),
                  },
                ]
          }
        />
      ) : (
        <ul className="space-y-4">
          {rows.map((b) => {
            const hasOpenTx = openTxBookingIds.has(b.id);
            const patientHint = isPatient
              ? bookingPatientActionHint(b.status, hasOpenTx, language)
              : null;
            const ptHint = isPt
              ? bookingTherapistActionHint(b.status, language)
              : null;
            const address = bookingVisitAddress(b);
            const canPatientPay =
              isPatient &&
              b.status === "CONFIRMED" &&
              !hasOpenTx;
            const canReschedule =
              (b.status === "PENDING" || b.status === "CONFIRMED") && !hasOpenTx;

            return (
              <li key={b.id} className={`${cardSurface} space-y-3`}>
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <StatusChip
                    label={bookingStatusMeta(b.status, language).label}
                    tone={bookingStatusMeta(b.status, language).tone}
                  />
                  <time
                    dateTime={b.appointmentDate}
                    className="text-sm text-slate-600 tabular-nums"
                  >
                    {new Date(b.appointmentDate).toLocaleString("id-ID")}
                  </time>
                </div>
                <p className="text-sm text-slate-700">
                  {formatAppointmentType(b.appointmentType, language)}
                  <span className="text-slate-500">
                    {" "}
                    · {formatIdr(b.visitFeeSnapshot)}
                  </span>
                </p>
                {address ? (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-medium text-slate-700">
                      {t("booking.bookings.label.location")}
                    </span>
                    {address}
                  </p>
                ) : null}
                {b.notes ? (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-medium text-slate-700">
                      {t("booking.bookings.label.notes")}
                    </span>
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
                      {t("booking.bookings.btn.cancel")}
                    </button>
                  )}
                  {canReschedule && (
                    <button
                      type="button"
                      onClick={() => void startReschedule(b)}
                      className={`${btnOutline} min-h-[44px] justify-center px-4`}
                    >
                      {t("booking.bookings.btn.reschedule")}
                    </button>
                  )}
                  {isPatient &&
                    (b.status === "PENDING" || b.status === "CONFIRMED") &&
                    hasOpenTx && (
                      <p className="text-xs text-amber-700 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                        {t("booking.bookings.rescheduleDisabled")}
                      </p>
                    )}
                  {canPatientPay && (
                    <Link
                      href={`/transactions?bookingId=${encodeURIComponent(b.id)}`}
                      className={`${btnPrimary} min-h-[44px] justify-center px-5 text-center`}
                    >
                      {t("booking.bookings.btn.payVisit")}
                    </Link>
                  )}
                  {isPatient && hasOpenTx && b.status === "CONFIRMED" && (
                    <Link
                      href="/transactions"
                      className={`${btnSecondary} min-h-[44px] justify-center px-4 text-center`}
                    >
                      {t("booking.bookings.btn.viewPayment")}
                    </Link>
                  )}
                  {isPt && b.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => void patchStatus(b.id, "CONFIRMED")}
                      className={btnTealSoft}
                    >
                      {t("booking.bookings.btn.confirm")}
                    </button>
                  )}
                  {isPt && b.status === "CONFIRMED" && (
                    <button
                      type="button"
                      onClick={() => void patchStatus(b.id, "IN_PROGRESS")}
                      className={btnSkySoft}
                    >
                      {t("booking.bookings.btn.startSession")}
                    </button>
                  )}
                  {isPt && b.status === "IN_PROGRESS" && (
                    <button
                      type="button"
                      onClick={() => void patchStatus(b.id, "COMPLETED")}
                      className={`${btnOutline} min-h-[44px] justify-center bg-slate-50 px-4`}
                    >
                      {t("booking.bookings.btn.complete")}
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
        title={t("booking.bookings.confirm.title")}
        description={t("booking.bookings.confirm.desc")}
        confirmLabel={t("booking.bookings.confirm.yes")}
        cancelLabel={t("booking.bookings.confirm.no")}
        variant="danger"
        loading={actionLoading}
        onConfirm={() => void confirmCancelBooking()}
        onCancel={() => {
          if (!actionLoading) setCancelConfirmId(null);
        }}
      />
      {rescheduleBookingId ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            aria-label={t("booking.bookings.reschedule.closeAria")}
            disabled={rescheduleLoading}
            onClick={() => setRescheduleBookingId(null)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reschedule-title"
            className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xl ring-1 ring-slate-900/5"
          >
            <h2 id="reschedule-title" className="text-lg font-semibold text-slate-900">
              {t("booking.bookings.reschedule.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {t("booking.bookings.reschedule.subtitle")}
            </p>
            <div className="mt-4 space-y-3">
              {activeRescheduleBooking ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <p className="text-slate-600">
                    {t("booking.bookings.reschedule.oldSchedule")}{" "}
                    <span className="font-medium text-slate-900">
                      {formatIdDateTime(activeRescheduleBooking.appointmentDate)}
                    </span>
                  </p>
                  <p className="mt-1 text-slate-600">
                    {t("booking.bookings.reschedule.newSchedule")}{" "}
                    <span className="font-medium text-slate-900">
                      {rescheduleNextTimeLabel}
                    </span>
                  </p>
                </div>
              ) : null}
              {rescheduleSlotsLoading ? (
                <p className="text-sm text-slate-500">
                  {t("booking.bookings.reschedule.loadingSlots")}
                </p>
              ) : (
                <select
                  value={rescheduleSlotId}
                  onChange={(e) => setRescheduleSlotId(e.target.value)}
                  className={inputBase}
                >
                  <option value="">{t("booking.bookings.reschedule.noSlot")}</option>
                  {rescheduleSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {new Date(slot.startTime).toLocaleString("id-ID")} -{" "}
                      {new Date(slot.endTime).toLocaleTimeString("id-ID")}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="datetime-local"
                value={rescheduleDateLocal}
                onChange={(e) => setRescheduleDateLocal(e.target.value)}
                disabled={Boolean(rescheduleSlotId)}
                className={inputBase}
              />
            </div>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setRescheduleBookingId(null)}
                disabled={rescheduleLoading}
                className={`${btnSecondary} min-h-[44px] justify-center px-5`}
              >
                {t("booking.bookings.reschedule.cancel")}
              </button>
              <button
                type="button"
                onClick={() => void submitReschedule()}
                disabled={rescheduleLoading}
                className={`${btnPrimary} min-h-[44px] justify-center px-5`}
              >
                {rescheduleLoading
                  ? t("booking.bookings.reschedule.saving")
                  : t("booking.bookings.reschedule.save")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
