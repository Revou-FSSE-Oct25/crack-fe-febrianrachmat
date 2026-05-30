import { translate } from "@/lib/i18n/dictionary";
import type { Language } from "@/lib/i18n/storage";

export type StatusTone =
  | "neutral"
  | "warning"
  | "info"
  | "success"
  | "danger"
  | "brand";

export type StatusMeta = { label: string; tone: StatusTone };

export function bookingStatusMeta(
  status: string,
  language: Language = "id",
): StatusMeta {
  switch (status) {
    case "PENDING":
      return {
        label: translate(language, "booking.status.booking.pending"),
        tone: "warning",
      };
    case "CONFIRMED":
      return {
        label: translate(language, "booking.status.booking.confirmed"),
        tone: "brand",
      };
    case "IN_PROGRESS":
      return {
        label: translate(language, "booking.status.booking.inProgress"),
        tone: "info",
      };
    case "COMPLETED":
      return {
        label: translate(language, "booking.status.booking.completed"),
        tone: "success",
      };
    case "CANCELLED":
      return {
        label: translate(language, "booking.status.booking.cancelled"),
        tone: "danger",
      };
    default:
      return { label: status.replaceAll("_", " "), tone: "neutral" };
  }
}

/** Selaras Prisma `TransactionStatus` — tidak ada nilai CANCELLED. */
export function transactionStatusMeta(
  status: string,
  language: Language = "id",
): StatusMeta {
  switch (status) {
    case "PENDING":
      return {
        label: translate(language, "booking.status.transaction.pending"),
        tone: "warning",
      };
    case "PAID":
      return {
        label: translate(language, "booking.status.transaction.paid"),
        tone: "success",
      };
    case "REFUNDED":
      return {
        label: translate(language, "booking.status.transaction.refunded"),
        tone: "info",
      };
    case "FAILED":
      return {
        label: translate(language, "booking.status.transaction.failed"),
        tone: "danger",
      };
    default:
      return { label: status.replaceAll("_", " "), tone: "neutral" };
  }
}

export function therapistVerificationStatusMeta(
  status: string,
  language: Language = "id",
): StatusMeta {
  switch (status) {
    case "PENDING":
      return {
        label: translate(
          language,
          "booking.status.therapistVerification.pending",
        ),
        tone: "warning",
      };
    case "APPROVED":
      return {
        label: translate(
          language,
          "booking.status.therapistVerification.approved",
        ),
        tone: "success",
      };
    case "REJECTED":
      return {
        label: translate(
          language,
          "booking.status.therapistVerification.rejected",
        ),
        tone: "danger",
      };
    default:
      return { label: status.replaceAll("_", " "), tone: "neutral" };
  }
}

export function consultationStatusMetaForDisplay(
  status: string,
  options?: { patientLabel?: string },
  language: Language = "id",
): StatusMeta {
  if (options?.patientLabel) {
    const tone: StatusTone =
      status === "IN_PROGRESS"
        ? "brand"
        : status === "COMPLETED"
          ? "success"
          : status === "CANCELLED"
            ? "danger"
            : options.patientLabel.includes("admin")
              ? "warning"
              : "info";
    return { label: options.patientLabel, tone };
  }
  return consultationStatusMeta(status, language);
}

export function consultationStatusMeta(
  status: string,
  language: Language = "id",
): StatusMeta {
  switch (status) {
    case "REQUESTED":
      return {
        label: translate(language, "booking.status.consultation.requested"),
        tone: "warning",
      };
    case "ACCEPTED":
      return {
        label: translate(language, "booking.status.consultation.accepted"),
        tone: "info",
      };
    case "IN_PROGRESS":
      return {
        label: translate(language, "booking.status.consultation.inProgress"),
        tone: "brand",
      };
    case "COMPLETED":
      return {
        label: translate(language, "booking.status.consultation.completed"),
        tone: "success",
      };
    case "CANCELLED":
      return {
        label: translate(language, "booking.status.consultation.cancelled"),
        tone: "danger",
      };
    default:
      return { label: status.replaceAll("_", " "), tone: "neutral" };
  }
}

export function formatAppointmentType(
  type: string,
  language: Language = "id",
): string {
  if (type === "CLINIC_VISIT")
    return translate(language, "booking.appointmentType.clinicVisit");
  if (type === "HOME_VISIT")
    return translate(language, "booking.appointmentType.homeVisit");
  return type.replaceAll("_", " ");
}
