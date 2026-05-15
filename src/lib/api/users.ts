import type { UserActivitySummary, UserProfile } from "./types";
import { ApiRequestError, apiFetch } from "./client";
import { getApiBaseUrl } from "./config";
import { notifyUnauthorized } from "@/lib/auth/session";
import { getStoredAccessToken } from "@/lib/auth/storage";

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

export async function getMyActivitySummary(): Promise<UserActivitySummary> {
  return apiFetch<UserActivitySummary>("/users/me/activity-summary");
}

export async function uploadMyAvatar(file: File): Promise<UserProfile> {
  const fd = new FormData();
  fd.append("avatar", file);
  return apiFetch<UserProfile>("/users/me/avatar", {
    method: "POST",
    body: fd,
  });
}

export async function deactivateMyAccount(body: {
  currentPassword: string;
}): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/users/me/deactivate", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function hasUserAvatar(avatarUrl: string | null | undefined): boolean {
  return Boolean((avatarUrl ?? "").trim());
}

export function isExternalAvatarUrl(url: string): boolean {
  const u = url.trim();
  return u.startsWith("http://") || u.startsWith("https://");
}

function buildMyAvatarUrl(): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  return `${base}/users/me/avatar`;
}

/** Muat foto profil upload (auth) atau URL eksternal langsung. */
export async function fetchMyAvatarObjectUrl(
  avatarUrl: string,
): Promise<string> {
  const url = avatarUrl.trim();
  if (!url) {
    throw new ApiRequestError("Foto profil tidak tersedia.", 404);
  }
  if (isExternalAvatarUrl(url)) {
    return url;
  }

  const token = getStoredAccessToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildMyAvatarUrl(), { headers });
  if (res.status === 401) {
    notifyUnauthorized();
    throw new ApiRequestError("Sesi berakhir. Silakan masuk lagi.", 401);
  }
  if (!res.ok) {
    throw new ApiRequestError(
      `Gagal memuat foto profil (${res.status}).`,
      res.status,
    );
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
