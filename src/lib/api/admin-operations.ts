import { apiFetch } from "./client";
import type { BookingStatus, TransactionStatus } from "./contract";

export type AdminOperationsQueue = {
  counts: {
    pendingTransactions: number;
    pendingBookingPayments: number;
    pendingConsultationPayments: number;
    pendingPhysiotherapistVerifications: number;
    pendingBookings: number;
    consultationsAcceptedAwaitingPayment: number;
  };
  recentPendingTransactions: AdminOperationTransaction[];
};

export type AdminOperationTransaction = {
  id: string;
  status: TransactionStatus;
  amount: string;
  paymentMethod: string;
  paymentProofUrl: string | null;
  hasPaymentProof: boolean;
  createdAt: string;
  paidAt: string | null;
  referenceType: "BOOKING" | "CONSULTATION" | "UNKNOWN";
  bookingId: string | null;
  consultationId: string | null;
  patient: {
    id: string;
    fullName: string;
    email: string;
  };
  booking: {
    id: string;
    appointmentType: string;
    appointmentDate: string;
    status: string;
  } | null;
  consultation: {
    id: string;
    complaint: string;
    status: string;
  } | null;
};

export type AdminOperationBooking = {
  id: string;
  status: BookingStatus;
  appointmentType: string;
  appointmentDate: string;
  visitFeeSnapshot: string;
  locationLabel: string;
  notes: string | null;
  createdAt: string;
  patient: { id: string; fullName: string; email: string };
  physiotherapist: { id: string; fullName: string };
};

type Paginated<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function paginationQuery(params: {
  page?: number;
  limit?: number;
  status?: string;
}): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.status) q.set("status", params.status);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function getAdminOperationsQueue(): Promise<AdminOperationsQueue> {
  return apiFetch<AdminOperationsQueue>("/admin/operations/queue");
}

export async function listAdminOperationTransactions(params?: {
  page?: number;
  limit?: number;
  status?: TransactionStatus;
}): Promise<Paginated<AdminOperationTransaction>> {
  return apiFetch<Paginated<AdminOperationTransaction>>(
    `/admin/operations/transactions${paginationQuery(params ?? {})}`,
  );
}

export async function listAdminOperationBookings(params?: {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}): Promise<Paginated<AdminOperationBooking>> {
  return apiFetch<Paginated<AdminOperationBooking>>(
    `/admin/operations/bookings${paginationQuery(params ?? {})}`,
  );
}

export function adminOperationReferenceLabel(
  tx: AdminOperationTransaction,
): string {
  if (tx.referenceType === "BOOKING" && tx.booking) {
    return `Booking kunjungan · ${new Date(tx.booking.appointmentDate).toLocaleString("id-ID")}`;
  }
  if (tx.referenceType === "CONSULTATION" && tx.consultation) {
    const snippet =
      tx.consultation.complaint.length > 48
        ? `${tx.consultation.complaint.slice(0, 48)}…`
        : tx.consultation.complaint;
    return `Konsultasi online · ${snippet}`;
  }
  return "Referensi tidak dikenal";
}
