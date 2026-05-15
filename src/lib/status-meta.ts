export type StatusTone =
  | "neutral"
  | "warning"
  | "info"
  | "success"
  | "danger"
  | "brand";

export type StatusMeta = { label: string; tone: StatusTone };

export function bookingStatusMeta(status: string): StatusMeta {
  switch (status) {
    case "PENDING":
      return { label: "Menunggu", tone: "warning" };
    case "CONFIRMED":
      return { label: "Dikonfirmasi", tone: "brand" };
    case "IN_PROGRESS":
      return { label: "Berlangsung", tone: "info" };
    case "COMPLETED":
      return { label: "Selesai", tone: "success" };
    case "CANCELLED":
      return { label: "Dibatalkan", tone: "danger" };
    default:
      return { label: status.replaceAll("_", " "), tone: "neutral" };
  }
}

export function transactionStatusMeta(status: string): StatusMeta {
  switch (status) {
    case "PENDING":
      return { label: "Menunggu konfirmasi", tone: "warning" };
    case "PAID":
      return { label: "Lunas", tone: "success" };
    case "REFUNDED":
      return { label: "Direfund", tone: "info" };
    case "FAILED":
      return { label: "Gagal", tone: "danger" };
    case "CANCELLED":
      return { label: "Dibatalkan", tone: "danger" };
    default:
      return { label: status.replaceAll("_", " "), tone: "neutral" };
  }
}

export function consultationStatusMeta(status: string): StatusMeta {
  switch (status) {
    case "REQUESTED":
      return { label: "Menunggu terapis", tone: "warning" };
    case "ACCEPTED":
      return { label: "Menunggu pembayaran", tone: "info" };
    case "IN_PROGRESS":
      return { label: "Sesi aktif", tone: "brand" };
    case "COMPLETED":
      return { label: "Selesai", tone: "success" };
    case "CANCELLED":
      return { label: "Dibatalkan", tone: "danger" };
    default:
      return { label: status.replaceAll("_", " "), tone: "neutral" };
  }
}

export function formatAppointmentType(type: string): string {
  if (type === "CLINIC_VISIT") return "Kunjungan klinik";
  if (type === "HOME_VISIT") return "Home visit";
  return type.replaceAll("_", " ");
}
