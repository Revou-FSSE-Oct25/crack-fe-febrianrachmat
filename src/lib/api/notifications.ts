import type { PaginationMeta } from "./types";
import { apiFetch, apiFetchPaginated } from "./client";

/** Selaras `CreateNotificationDto` */
export type CreateNotificationBody = {
  title: string;
  body: string;
};

function paginationQuery(params: { page?: number; limit?: number }): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function listMyNotifications(params?: {
  page?: number;
  limit?: number;
}): Promise<{ items: unknown[]; meta: PaginationMeta }> {
  const { data, meta } = await apiFetchPaginated<unknown>(
    `/notifications/me${paginationQuery(params ?? {})}`,
  );
  return { items: data, meta };
}

export async function markNotificationRead(
  notificationId: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead(): Promise<unknown> {
  return apiFetch<unknown>("/notifications/read-all", {
    method: "PATCH",
  });
}

/** Admin: POST /admin/notifications/users/:userId */
export async function sendNotificationToUser(
  userId: string,
  body: CreateNotificationBody,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/notifications/users/${userId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Admin: POST /admin/notifications/broadcast */
export async function broadcastNotification(
  body: CreateNotificationBody,
): Promise<unknown> {
  return apiFetch<unknown>("/admin/notifications/broadcast", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
