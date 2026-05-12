import { apiFetch } from "./client";

/** Selaras `CreateConsultationDto` */
export type CreateConsultationBody = {
  physiotherapistId: string;
  complaint: string;
};

/** Selaras `UpdateConsultationStatusDto` */
export type UpdateConsultationStatusBody = {
  status:
    | "REQUESTED"
    | "ACCEPTED"
    | "REJECTED"
    | "COMPLETED"
    | "CANCELLED";
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
}): Promise<unknown[]> {
  return apiFetch<unknown[]>(
    `/consultations/me${paginationQuery(params ?? {})}`,
  );
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
