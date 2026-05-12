import type { AuthMePayload, LoginResponseData } from "./types";
import { apiFetch } from "./client";

/** POST /auth/register — body selaras `RegisterDto` */
export type RegisterBody = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: "PATIENT" | "PHYSIOTHERAPIST";
};

/** POST /auth/login — body selaras `LoginDto` */
export type LoginBody = {
  email: string;
  password: string;
};

export async function register(body: RegisterBody): Promise<LoginResponseData> {
  return apiFetch<LoginResponseData>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export async function login(body: LoginBody): Promise<LoginResponseData> {
  return apiFetch<LoginResponseData>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export async function getAuthMe(): Promise<AuthMePayload> {
  return apiFetch<AuthMePayload>("/auth/me");
}
