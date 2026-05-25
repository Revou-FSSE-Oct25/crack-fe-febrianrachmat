export type AuditAction =
  | "TRANSACTION_MARK_PAID"
  | "TRANSACTION_REFUND"
  | "TRANSACTION_SLA_AUTO_REFUND"
  | "REVIEW_MODERATE"
  | "PHYSIOTHERAPIST_VERIFY"
  | "NOTIFICATION_BROADCAST"
  | "NOTIFICATION_SEND_USER";

export type AuditEntityType =
  | "TRANSACTION"
  | "BOOKING"
  | "CONSULTATION"
  | "REVIEW"
  | "PHYSIOTHERAPIST"
  | "USER";

export const AUDIT_ACTION_OPTIONS: { value: AuditAction | ""; label: string }[] =
  [
    { value: "", label: "Semua aksi" },
    { value: "TRANSACTION_MARK_PAID", label: "Konfirmasi pembayaran" },
    { value: "TRANSACTION_REFUND", label: "Refund manual" },
    { value: "TRANSACTION_SLA_AUTO_REFUND", label: "Refund otomatis (SLA)" },
    { value: "REVIEW_MODERATE", label: "Moderasi ulasan" },
    { value: "PHYSIOTHERAPIST_VERIFY", label: "Verifikasi fisioterapis" },
    { value: "NOTIFICATION_BROADCAST", label: "Broadcast notifikasi" },
    { value: "NOTIFICATION_SEND_USER", label: "Notifikasi ke user" },
  ];

export const AUDIT_ENTITY_OPTIONS: {
  value: AuditEntityType | "";
  label: string;
}[] = [
  { value: "", label: "Semua entitas" },
  { value: "TRANSACTION", label: "Transaksi" },
  { value: "BOOKING", label: "Booking" },
  { value: "CONSULTATION", label: "Konsultasi" },
  { value: "REVIEW", label: "Ulasan" },
  { value: "PHYSIOTHERAPIST", label: "Profil fisioterapis" },
  { value: "USER", label: "User" },
];

export function auditActionLabel(action: string): string {
  const found = AUDIT_ACTION_OPTIONS.find((o) => o.value === action);
  return found?.label ?? action;
}

export function auditEntityLabel(entityType: string): string {
  const found = AUDIT_ENTITY_OPTIONS.find((o) => o.value === entityType);
  return found?.label ?? entityType;
}

/** Ringkasan metadata untuk tampilan daftar. */
export function formatAuditMetadataSummary(
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const parts: string[] = [];
  if (metadata.reason != null) {
    parts.push(`Alasan: ${String(metadata.reason)}`);
  }
  if (metadata.amount != null) {
    parts.push(`Nominal: ${String(metadata.amount)}`);
  }
  if (metadata.status != null) {
    parts.push(`Status: ${String(metadata.status)}`);
  }
  if (metadata.isHidden != null) {
    parts.push(metadata.isHidden ? "Disembunyikan" : "Ditampilkan");
  }
  if (metadata.title != null) {
    parts.push(`Judul: ${String(metadata.title)}`);
  }
  if (metadata.createdCount != null) {
    parts.push(`Jumlah: ${String(metadata.createdCount)}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
