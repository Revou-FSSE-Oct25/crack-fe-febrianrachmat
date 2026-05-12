import type { PaginationMeta } from "./types";
import { apiFetch, apiFetchPaginated } from "./client";
/** Query selaras `ListAvailabilitySlotsQueryDto` + path profile */
export type ListSlotsParams = {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
};

function toQuery(params: ListSlotsParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export type AvailabilitySlotItem = {
  id: string;
  physiotherapistId: string;
  slotDate?: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

/** Selaras `CreateAvailabilitySlotDto` */
export type CreateAvailabilitySlotBody = {
  slotDate: string;
  startTime: string;
  endTime: string;
};

/** Selaras `UpdateAvailabilitySlotDto` */
export type UpdateAvailabilitySlotBody = {
  slotDate?: string;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
};

export async function createMyAvailabilitySlot(
  body: CreateAvailabilitySlotBody,
): Promise<unknown> {
  return apiFetch<unknown>("/physiotherapists/me/availability-slots", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listMyAvailabilitySlots(
  params: ListSlotsParams = {},
): Promise<{ items: AvailabilitySlotItem[]; meta: PaginationMeta }> {
  const { data, meta } = await apiFetchPaginated<AvailabilitySlotItem>(
    `/physiotherapists/me/availability-slots${toQuery(params)}`,
  );
  return { items: data, meta };
}

export async function updateMyAvailabilitySlot(
  slotId: string,
  body: UpdateAvailabilitySlotBody,
): Promise<unknown> {
  return apiFetch<unknown>(
    `/physiotherapists/me/availability-slots/${slotId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function deleteMyAvailabilitySlot(slotId: string): Promise<unknown> {
  return apiFetch<unknown>(
    `/physiotherapists/me/availability-slots/${slotId}`,
    {
      method: "DELETE",
    },
  );
}

export async function listAvailabilitySlotsForProfile(
  profileId: string,
  params: ListSlotsParams = {},
): Promise<{ items: AvailabilitySlotItem[]; meta: PaginationMeta }> {
  const { data, meta } = await apiFetchPaginated<AvailabilitySlotItem>(
    `/physiotherapists/${profileId}/availability-slots${toQuery(params)}`,
  );
  return { items: data, meta };
}
