import { apiFetch } from "./client";

/** Selaras `UpdatePhysiotherapistProfileDto` */
export type UpdatePhysiotherapistProfileBody = {
  categoryId?: string;
  bio?: string;
  education?: string;
  experienceYears?: number;
  certificationUrl?: string;
  licenseNumber?: string;
  consultationFee?: number;
  visitFee?: number;
  clinicAddress?: string;
};

export async function getMyPhysiotherapistProfile(): Promise<unknown> {
  return apiFetch<unknown>("/physiotherapists/me");
}

export async function updateMyPhysiotherapistProfile(
  body: UpdatePhysiotherapistProfileBody,
): Promise<unknown> {
  return apiFetch<unknown>("/physiotherapists/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** Heartbeat: marks therapist as "online" for browse filter (~5 min TTL). */
export async function postPhysiotherapistOnlineHeartbeat(): Promise<unknown> {
  return apiFetch<unknown>("/physiotherapists/me/online", {
    method: "POST",
  });
}
