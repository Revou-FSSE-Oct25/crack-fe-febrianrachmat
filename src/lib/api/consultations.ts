import { apiFetch } from "./client";
import type {
  Consultation,
  ConsultationSlaTier,
  PatchableConsultationStatus,
} from "./contract";
import { asConsultations } from "./contract";

export type { Consultation, ConsultationSlaTier, PatchableConsultationStatus };

/** Selaras `CreateConsultationDto` */
export type CreateConsultationBody = {
  physiotherapistId: string;
  complaint: string;
  /** STANDARD = 24h first reply SLA; FAST_ONLINE = 10 min, requires therapist online at create. */
  slaTier?: ConsultationSlaTier;
};

/**
 * Selaras `UpdateConsultationStatusDto` + aturan service:
 * `IN_PROGRESS` hanya lewat admin konfirmasi pembayaran, bukan PATCH status.
 */
export type UpdateConsultationStatusBody = {
  status: PatchableConsultationStatus;
};

function paginationQuery(params: { page?: number; limit?: number }): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function createConsultation(
  body: CreateConsultationBody,
): Promise<unknown> {
  return apiFetch<unknown>("/consultations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listMyConsultations(params?: {
  page?: number;
  limit?: number;
}): Promise<Consultation[]> {
  const raw = await apiFetch<unknown[]>(
    `/consultations/me${paginationQuery(params ?? {})}`,
  );
  return asConsultations(raw);
}

export async function updateConsultationStatus(
  consultationId: string,
  body: UpdateConsultationStatusBody,
): Promise<unknown> {
  return apiFetch<unknown>(`/consultations/${consultationId}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
