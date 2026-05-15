import type { UserProfile } from "./types";
import { apiFetch } from "./client";

/** PATCH /users/me — selaras `UpdateMyProfileDto` */
export type UpdateMyProfileBody = {
  fullName?: string;
  phoneNumber?: string;
};

export async function getMyProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/users/me");
}

export async function updateMyProfile(
  body: UpdateMyProfileBody,
): Promise<UserProfile> {
  return apiFetch<UserProfile>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** PATCH /users/change-password — selaras `ChangePasswordDto` */
export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export async function changePassword(
  body: ChangePasswordBody,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/users/change-password", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
