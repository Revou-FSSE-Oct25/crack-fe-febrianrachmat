import { apiFetch } from "./client";
import type { BookingStatus } from "./contract";
import { downloadIcsExport } from "./download-ics";

export type CalendarBookingItem = {
  id: string;
  appointmentDate: string;
  appointmentType: string;
  status: BookingStatus;
  visitFeeSnapshot: string;
  clinicAddress: string | null;
  homeVisitAddress: string | null;
  notes: string | null;
  counterpartyName: string;
  locationLabel: string;
};

export type CalendarBookingsResponse = {
  from: string;
  to: string;
  items: CalendarBookingItem[];
};

export async function listCalendarBookings(params: {
  from: string;
  to: string;
}): Promise<CalendarBookingsResponse> {
  const q = new URLSearchParams({
    from: params.from,
    to: params.to,
  });
  return apiFetch<CalendarBookingsResponse>(`/bookings/calendar?${q.toString()}`);
}

/** Unduh janji temu dalam rentang bulan sebagai file .ics (Google/Apple/Outlook). */
export async function downloadCalendarIcsExport(params: {
  from: string;
  to: string;
}): Promise<void> {
  const q = new URLSearchParams({
    from: params.from,
    to: params.to,
  });
  await downloadIcsExport(
    `/bookings/calendar/export?${q.toString()}`,
    "janji-temu-kalender.ics",
  );
}
