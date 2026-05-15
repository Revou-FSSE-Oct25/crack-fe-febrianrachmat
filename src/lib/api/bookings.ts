import type { AppointmentType } from "./types";
import { apiFetch } from "./client";
import type { Booking, BookingStatus } from "./contract";
import { asBookings } from "./contract";

export type { Booking, BookingStatus };

/** Body selaras `CreateBookingDto` */
export type CreateBookingBody = {
  consultationId?: string;
  physiotherapistId: string;
  slotId?: string;
  appointmentType: AppointmentType;
  appointmentDate?: string;
  clinicAddress?: string;
  homeVisitAddress?: string;
  notes?: string;
};

export async function createBooking(body: CreateBookingBody): Promise<unknown> {
  return apiFetch<unknown>("/bookings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Selaras `UpdateBookingStatusDto` */
export type UpdateBookingStatusBody = {
  status: BookingStatus;
};

function paginationQuery(params: { page?: number; limit?: number }): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function listMyBookings(params?: {
  page?: number;
  limit?: number;
}): Promise<Booking[]> {
  const raw = await apiFetch<unknown[]>(
    `/bookings/me${paginationQuery(params ?? {})}`,
  );
  return asBookings(raw);
}

export async function updateBookingStatus(
  bookingId: string,
  body: UpdateBookingStatusBody,
): Promise<unknown> {
  return apiFetch<unknown>(`/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
