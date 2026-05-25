import { apiFetchPaginated } from "./client";
import type { PaginationMeta } from "./types";
import type { AuditAction, AuditEntityType } from "@/lib/audit/labels";

export type AuditLogActor = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export type AuditLogItem = {
  id: string;
  action: AuditAction;
  actorUserId: string | null;
  actorRole: string | null;
  entityType: AuditEntityType;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: AuditLogActor | null;
};

export type ListAdminAuditLogsParams = {
  page?: number;
  limit?: number;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  actorUserId?: string;
  from?: string;
  to?: string;
};

function toQuery(params: ListAdminAuditLogsParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.action) q.set("action", params.action);
  if (params.entityType) q.set("entityType", params.entityType);
  if (params.entityId) q.set("entityId", params.entityId);
  if (params.actorUserId) q.set("actorUserId", params.actorUserId);
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  const s = q.toString();
  return s ? `?${s}` : "";
}

function asRecord(item: unknown): Record<string, unknown> {
  return item != null && typeof item === "object"
    ? (item as Record<string, unknown>)
    : {};
}

export function mapAuditLogItem(item: unknown): AuditLogItem {
  const r = asRecord(item);
  const actorRaw = r.actor;
  const actor =
    actorRaw != null && typeof actorRaw === "object"
      ? {
          id: String((actorRaw as Record<string, unknown>).id ?? ""),
          fullName: String(
            (actorRaw as Record<string, unknown>).fullName ?? "",
          ),
          email: String((actorRaw as Record<string, unknown>).email ?? ""),
          role: String((actorRaw as Record<string, unknown>).role ?? ""),
        }
      : null;
  const metadata =
    r.metadata != null && typeof r.metadata === "object"
      ? (r.metadata as Record<string, unknown>)
      : null;

  return {
    id: String(r.id ?? ""),
    action: String(r.action ?? "") as AuditAction,
    actorUserId: r.actorUserId != null ? String(r.actorUserId) : null,
    actorRole: r.actorRole != null ? String(r.actorRole) : null,
    entityType: String(r.entityType ?? "") as AuditEntityType,
    entityId: String(r.entityId ?? ""),
    metadata,
    createdAt: String(r.createdAt ?? ""),
    actor,
  };
}

export async function listAdminAuditLogs(
  params: ListAdminAuditLogsParams = {},
): Promise<{ items: AuditLogItem[]; meta: PaginationMeta }> {
  const { data, meta } = await apiFetchPaginated<unknown>(
    `/admin/audit-logs${toQuery(params)}`,
  );
  return {
    items: data.map(mapAuditLogItem),
    meta,
  };
}
