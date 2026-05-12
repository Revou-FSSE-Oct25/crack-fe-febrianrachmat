import { apiFetch } from "./client";

/** Selaras `VerifyPhysiotherapistDto` — admin hanya mengirim APPROVED atau REJECTED */
export type VerifyPhysiotherapistBody = {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
};

export async function listPendingPhysiotherapists(): Promise<unknown[]> {
  return apiFetch<unknown[]>("/admin/physiotherapists/pending");
}

export async function verifyPhysiotherapist(
  profileId: string,
  body: VerifyPhysiotherapistBody,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/physiotherapists/${profileId}/verify`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
