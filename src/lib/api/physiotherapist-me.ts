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
