import type { BookingStatus, Transaction, TransactionStatus } from "./api/contract";
import { translate } from "@/lib/i18n/dictionary";
import type { Language } from "@/lib/i18n/storage";

/** Status booking yang boleh dibayar pasien (selaras backend `bookings.service`). */
export const BOOKING_PAYABLE_STATUSES: readonly BookingStatus[] = [
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
];

const OPEN_TX_STATUSES: readonly TransactionStatus[] = ["PENDING", "PAID"];

export function isBookingPayable(status: string): boolean {
  return BOOKING_PAYABLE_STATUSES.includes(status as BookingStatus);
}

export function bookingHasOpenTransaction(
  bookingId: string,
  transactions: Transaction[],
): boolean {
  return transactions.some(
    (t) =>
      t.bookingId === bookingId &&
      OPEN_TX_STATUSES.includes(t.status),
  );
}

export function consultationHasOpenTransaction(
  consultationId: string,
  transactions: Transaction[],
): boolean {
  return transactions.some(
    (t) =>
      t.consultationId === consultationId &&
      OPEN_TX_STATUSES.includes(t.status),
  );
}

export function getOpenTransactionForConsultation(
  consultationId: string,
  transactions: Transaction[],
): Transaction | undefined {
  return transactions.find(
    (t) =>
      t.consultationId === consultationId &&
      OPEN_TX_STATUSES.includes(t.status),
  );
}

export function bookingPatientActionHint(
  status: string,
  hasOpenTransaction: boolean,
  language: Language = "id",
): string | null {
  if (status === "PENDING") {
    return translate(language, "booking.flow.bookingPatient.pending");
  }
  if (status === "CONFIRMED" && !hasOpenTransaction) {
    return translate(
      language,
      "booking.flow.bookingPatient.confirmedAttachProof",
    );
  }
  if (status === "CONFIRMED" && hasOpenTransaction) {
    return translate(language, "booking.flow.bookingPatient.confirmedWaiting");
  }
  if (
    (status === "IN_PROGRESS" || status === "COMPLETED") &&
    !hasOpenTransaction
  ) {
    return translate(language, "booking.flow.bookingPatient.sessionRunning");
  }
  return null;
}

export function bookingTherapistActionHint(
  status: string,
  language: Language = "id",
): string | null {
  if (status === "PENDING") {
    return translate(language, "booking.flow.bookingTherapist.pending");
  }
  if (status === "CONFIRMED") {
    return translate(language, "booking.flow.bookingTherapist.confirmed");
  }
  if (status === "IN_PROGRESS") {
    return translate(language, "booking.flow.bookingTherapist.inProgress");
  }
  return null;
}

export function consultationPatientActionHint(
  status: string,
  openTx: Transaction | undefined,
  language: Language = "id",
): string | null {
  if (status === "REQUESTED") {
    return translate(language, "booking.flow.consultationPatient.requested");
  }
  if (status === "ACCEPTED" && !openTx) {
    return translate(
      language,
      "booking.flow.consultationPatient.acceptedAttach",
    );
  }
  if (status === "ACCEPTED" && openTx?.status === "PENDING") {
    return translate(
      language,
      "booking.flow.consultationPatient.acceptedWaiting",
    );
  }
  if (status === "IN_PROGRESS") {
    return translate(language, "booking.flow.consultationPatient.inProgress");
  }
  return null;
}

export function consultationTherapistActionHint(
  status: string,
  openTx: Transaction | undefined,
  language: Language = "id",
): string | null {
  if (status === "REQUESTED") {
    return translate(language, "booking.flow.consultationTherapist.requested");
  }
  if (status === "ACCEPTED" && !openTx) {
    return translate(
      language,
      "booking.flow.consultationTherapist.acceptedWaiting",
    );
  }
  if (status === "ACCEPTED" && openTx?.status === "PENDING") {
    return translate(
      language,
      "booking.flow.consultationTherapist.acceptedProofSent",
    );
  }
  if (status === "IN_PROGRESS") {
    return translate(language, "booking.flow.consultationTherapist.inProgress");
  }
  return null;
}

export function consultationStatusLabelForPatient(
  status: string,
  openTx: Transaction | undefined,
  language: Language = "id",
): string {
  if (status === "ACCEPTED" && openTx?.status === "PENDING") {
    return translate(language, "booking.flow.consultationLabel.waitingAdmin");
  }
  if (status === "ACCEPTED" && !openTx) {
    return translate(language, "booking.flow.consultationLabel.readyToPay");
  }
  const map: Record<string, string> = {
    REQUESTED: translate(language, "booking.status.consultation.requested"),
    ACCEPTED: translate(language, "booking.status.consultation.accepted"),
    IN_PROGRESS: translate(language, "booking.status.consultation.inProgress"),
    COMPLETED: translate(language, "booking.status.consultation.completed"),
    CANCELLED: translate(language, "booking.status.consultation.cancelled"),
  };
  return map[status] ?? status.replaceAll("_", " ");
}
