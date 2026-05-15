import { apiFetch } from "./client";
import type { PatientProfile } from "./types";

/** Selaras `UpdatePatientProfileDto` */
export type UpdatePatientProfileBody = {
  dateOfBirth?: string;
  gender?: "M" | "F" | "OTHER";
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
};

export async function getMyPatientProfile(): Promise<PatientProfile> {
  return apiFetch<PatientProfile>("/patients/me");
}

export async function updateMyPatientProfile(
  body: UpdatePatientProfileBody,
): Promise<PatientProfile> {
  return apiFetch<PatientProfile>("/patients/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
