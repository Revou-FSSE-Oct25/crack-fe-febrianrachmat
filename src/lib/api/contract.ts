/**
 * Shared API contract types — selaras Prisma enums & response shapes di backend.
 */

export type TransactionStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";

export type ConsultationStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

/** Status yang boleh di-PATCH lewat /consultations/:id/status (bukan admin). */
export type PatchableConsultationStatus = Exclude<
  ConsultationStatus,
  "IN_PROGRESS"
>;

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type TherapistVerificationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type ConsultationSlaTier = "STANDARD" | "FAST_ONLINE";

export type PaymentMethod =
  | "BANK_TRANSFER"
  | "E_WALLET"
  | "CREDIT_CARD"
  | "QRIS";

/** GET /transactions — Prisma Transaction (Decimal → string di JSON). */
export type Transaction = {
  id: string;
  bookingId: string | null;
  consultationId: string | null;
  patientId: string;
  amount: string | number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  paidAt: string | null;
  refundedAt: string | null;
  refundReason: string | null;
  paymentProofUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Consultation = {
  id: string;
  patientId: string;
  physiotherapistId: string;
  complaint: string;
  status: ConsultationStatus;
  feeSnapshot: string | number;
  slaTier: ConsultationSlaTier;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Booking = {
  id: string;
  consultationId: string | null;
  patientId: string;
  physiotherapistId: string;
  slotId: string | null;
  appointmentType: "HOME_VISIT" | "CLINIC_VISIT";
  appointmentDate: string;
  visitFeeSnapshot: string | number;
  clinicAddress: string | null;
  homeVisitAddress: string | null;
  notes: string | null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

function asRecord(item: unknown): Record<string, unknown> {
  return item != null && typeof item === "object"
    ? (item as Record<string, unknown>)
    : {};
}

export function asTransactions(data: unknown): Transaction[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = asRecord(item);
    return {
      id: String(r.id ?? ""),
      bookingId: r.bookingId != null ? String(r.bookingId) : null,
      consultationId:
        r.consultationId != null ? String(r.consultationId) : null,
      patientId: String(r.patientId ?? ""),
      amount: r.amount as string | number,
      paymentMethod: String(r.paymentMethod ?? "") as PaymentMethod,
      status: String(r.status ?? "PENDING") as TransactionStatus,
      paidAt: r.paidAt != null ? String(r.paidAt) : null,
      refundedAt: r.refundedAt != null ? String(r.refundedAt) : null,
      refundReason:
        r.refundReason != null ? String(r.refundReason) : null,
      paymentProofUrl:
        r.paymentProofUrl != null && r.paymentProofUrl !== ""
          ? String(r.paymentProofUrl)
          : null,
      createdAt: String(r.createdAt ?? ""),
      updatedAt: String(r.updatedAt ?? ""),
    };
  });
}

export function asConsultations(data: unknown): Consultation[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = asRecord(item);
    return {
      id: String(r.id ?? ""),
      patientId: String(r.patientId ?? ""),
      physiotherapistId: String(r.physiotherapistId ?? ""),
      complaint: String(r.complaint ?? ""),
      status: String(r.status ?? "REQUESTED") as ConsultationStatus,
      feeSnapshot: r.feeSnapshot as string | number,
      slaTier:
        r.slaTier === "FAST_ONLINE" ? "FAST_ONLINE" : "STANDARD",
      acceptedAt: r.acceptedAt != null ? String(r.acceptedAt) : null,
      startedAt: r.startedAt != null ? String(r.startedAt) : null,
      completedAt: r.completedAt != null ? String(r.completedAt) : null,
      createdAt: String(r.createdAt ?? ""),
      updatedAt: String(r.updatedAt ?? ""),
    };
  });
}

export function asBookings(data: unknown): Booking[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = asRecord(item);
    return {
      id: String(r.id ?? ""),
      consultationId:
        r.consultationId != null ? String(r.consultationId) : null,
      patientId: String(r.patientId ?? ""),
      physiotherapistId: String(r.physiotherapistId ?? ""),
      slotId: r.slotId != null ? String(r.slotId) : null,
      appointmentType: String(
        r.appointmentType ?? "CLINIC_VISIT",
      ) as Booking["appointmentType"],
      appointmentDate: String(r.appointmentDate ?? ""),
      visitFeeSnapshot: r.visitFeeSnapshot as string | number,
      clinicAddress:
        r.clinicAddress != null ? String(r.clinicAddress) : null,
      homeVisitAddress:
        r.homeVisitAddress != null ? String(r.homeVisitAddress) : null,
      notes: r.notes != null ? String(r.notes) : null,
      status: String(r.status ?? "PENDING") as BookingStatus,
      createdAt: String(r.createdAt ?? ""),
      updatedAt: String(r.updatedAt ?? ""),
    };
  });
}

/** GET /reviews/me, POST /reviews — Prisma Review. */
export type Review = {
  id: string;
  bookingId: string;
  patientId: string;
  physiotherapistId: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  moderationNote: string | null;
  createdAt: string;
  updatedAt: string;
};

/** GET /physiotherapists/:id/reviews — ulasan publik. */
export type PublicReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  patientName: string;
};

export function asReviews(data: unknown): Review[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = asRecord(item);
    return {
      id: String(r.id ?? ""),
      bookingId: String(r.bookingId ?? ""),
      patientId: String(r.patientId ?? ""),
      physiotherapistId: String(r.physiotherapistId ?? ""),
      rating: Number(r.rating ?? 0),
      comment: r.comment != null ? String(r.comment) : null,
      isHidden: Boolean(r.isHidden),
      moderationNote:
        r.moderationNote != null ? String(r.moderationNote) : null,
      createdAt: String(r.createdAt ?? ""),
      updatedAt: String(r.updatedAt ?? ""),
    };
  });
}

export function asPublicReviews(data: unknown): PublicReview[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = asRecord(item);
    const patient = r.patient as
      | { user?: { fullName?: string } }
      | undefined;
    return {
      id: String(r.id ?? ""),
      rating: Number(r.rating ?? 0),
      comment: r.comment != null ? String(r.comment) : null,
      createdAt: String(r.createdAt ?? ""),
      patientName: String(patient?.user?.fullName ?? "Pasien"),
    };
  });
}

/** Label referensi transaksi (booking XOR consultation). */
export function transactionReferenceLabel(tx: Transaction): string {
  if (tx.consultationId) {
    return `Konsultasi · ${tx.consultationId.slice(0, 8)}…`;
  }
  if (tx.bookingId) {
    return `Booking · ${tx.bookingId.slice(0, 8)}…`;
  }
  return "—";
}
