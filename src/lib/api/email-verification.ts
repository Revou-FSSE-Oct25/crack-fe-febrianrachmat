import { apiFetch } from "./client";

export async function verifyEmail(token: string): Promise<{ email: string }> {
  return apiFetch<{ email: string }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
    skipAuth: true,
  });
}

export async function resendVerificationEmail(
  email: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}
