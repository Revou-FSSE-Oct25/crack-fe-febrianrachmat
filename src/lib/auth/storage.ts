import type { AuthUserResponse } from "@/lib/api/types";

export const ACCESS_TOKEN_KEY = "kinova_access_token";
export const AUTH_USER_KEY = "kinova_auth_user";

const ACCESS_TOKEN_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

/** Cookie mirror untuk verifikasi JWT di `src/proxy.ts` (route terlindungi). */
function syncAccessTokenCookie(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${ACCESS_TOKEN_COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
  } else {
    document.cookie = `${ACCESS_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  syncAccessTokenCookie(token);
}

export function clearStoredAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  syncAccessTokenCookie(null);
}

/** Sinkronkan cookie dari localStorage (mis. setelah upgrade atau tab baru). */
export function syncAccessTokenCookieFromStorage(): void {
  syncAccessTokenCookie(getStoredAccessToken());
}

export function getStoredAuthUser(): AuthUserResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUserResponse;
  } catch {
    return null;
  }
}

export function setStoredAuthUser(user: AuthUserResponse): void {
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearStoredAuthUser(): void {
  window.localStorage.removeItem(AUTH_USER_KEY);
}
