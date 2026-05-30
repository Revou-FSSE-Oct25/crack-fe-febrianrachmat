import { translate } from "@/lib/i18n/dictionary";
import type { Language } from "@/lib/i18n/storage";

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

const AUDIT_ACTION_KEYS: { value: AuditAction | ""; key: string }[] = [
  { value: "", key: "admin.auditAction.all" },
  { value: "TRANSACTION_MARK_PAID", key: "admin.auditAction.markPaid" },
  { value: "TRANSACTION_REFUND", key: "admin.auditAction.refundManual" },
  { value: "TRANSACTION_SLA_AUTO_REFUND", key: "admin.auditAction.refundAuto" },
  { value: "REVIEW_MODERATE", key: "admin.auditAction.reviewModerate" },
  { value: "PHYSIOTHERAPIST_VERIFY", key: "admin.auditAction.physioVerify" },
  { value: "NOTIFICATION_BROADCAST", key: "admin.auditAction.notifBroadcast" },
  { value: "NOTIFICATION_SEND_USER", key: "admin.auditAction.notifSendUser" },
];

const AUDIT_ENTITY_KEYS: { value: AuditEntityType | ""; key: string }[] = [
  { value: "", key: "admin.auditEntity.all" },
  { value: "TRANSACTION", key: "admin.auditEntity.transaction" },
  { value: "BOOKING", key: "admin.auditEntity.booking" },
  { value: "CONSULTATION", key: "admin.auditEntity.consultation" },
  { value: "REVIEW", key: "admin.auditEntity.review" },
  { value: "PHYSIOTHERAPIST", key: "admin.auditEntity.physiotherapist" },
  { value: "USER", key: "admin.auditEntity.user" },
];

export function auditActionOptions(
  language: Language = "id",
): { value: AuditAction | ""; label: string }[] {
  return AUDIT_ACTION_KEYS.map((o) => ({
    value: o.value,
    label: translate(language, o.key),
  }));
}

export function auditEntityOptions(
  language: Language = "id",
): { value: AuditEntityType | ""; label: string }[] {
  return AUDIT_ENTITY_KEYS.map((o) => ({
    value: o.value,
    label: translate(language, o.key),
  }));
}

export function auditActionLabel(
  action: string,
  language: Language = "id",
): string {
  const found = AUDIT_ACTION_KEYS.find((o) => o.value === action);
  return found ? translate(language, found.key) : action;
}

export function auditEntityLabel(
  entityType: string,
  language: Language = "id",
): string {
  const found = AUDIT_ENTITY_KEYS.find((o) => o.value === entityType);
  return found ? translate(language, found.key) : entityType;
}

/** Ringkasan metadata untuk tampilan daftar. */
export function formatAuditMetadataSummary(
  metadata: Record<string, unknown> | null | undefined,
  language: Language = "id",
): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const parts: string[] = [];
  if (metadata.reason != null) {
    parts.push(`${translate(language, "admin.auditMeta.reason")}: ${String(metadata.reason)}`);
  }
  if (metadata.amount != null) {
    parts.push(`${translate(language, "admin.auditMeta.amount")}: ${String(metadata.amount)}`);
  }
  if (metadata.status != null) {
    parts.push(`${translate(language, "admin.auditMeta.status")}: ${String(metadata.status)}`);
  }
  if (metadata.isHidden != null) {
    parts.push(
      metadata.isHidden
        ? translate(language, "admin.auditMeta.hidden")
        : translate(language, "admin.auditMeta.shown"),
    );
  }
  if (metadata.title != null) {
    parts.push(`${translate(language, "admin.auditMeta.title")}: ${String(metadata.title)}`);
  }
  if (metadata.createdCount != null) {
    parts.push(`${translate(language, "admin.auditMeta.count")}: ${String(metadata.createdCount)}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
