import { notifyUnauthorized } from "@/lib/auth/session";
import { getStoredAccessToken } from "@/lib/auth/storage";
import { getApiBaseUrl } from "./config";
import type { PaginationMeta } from "./types";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type SuccessEnvelope<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

type ErrorEnvelope = {
  success: false;
  error?: { message?: string; code?: number };
};

function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export type ApiFetchOptions = RequestInit & {
  /** Jangan kirim Authorization (untuk /auth/register, /auth/login, /health) */
  skipAuth?: boolean;
};

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function messageFromErrorBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const err = (body as ErrorEnvelope).error;
  if (err?.message && typeof err.message === "string") return err.message;
  return undefined;
}

function buildAuthHeaders(options: ApiFetchOptions): {
  headers: Headers;
  rest: Omit<ApiFetchOptions, "headers" | "skipAuth">;
} {
  const { skipAuth, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);
  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;
  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (!skipAuth) {
    const token = getStoredAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return { headers, rest };
}

/**
 * Memanggil API REST dan mengembalikan `data` dari envelope sukses backend
 * (`TransformResponseInterceptor`: `{ success, data }`).
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { headers, rest } = buildAuthHeaders(options);

  const res = await fetch(buildUrl(path), {
    ...rest,
    headers,
  });

  const body = await parseJson(res);

  if (
    res.ok &&
    body &&
    typeof body === "object" &&
    "success" in body &&
    (body as { success: unknown }).success === false
  ) {
    throw new ApiRequestError(
      messageFromErrorBody(body) ?? "Permintaan gagal",
      res.status,
    );
  }

  if (!res.ok) {
    if (res.status === 401 && !options.skipAuth) {
      notifyUnauthorized();
    }
    const msg =
      messageFromErrorBody(body) ??
      (typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : undefined) ??
      `Permintaan gagal (${res.status})`;
    throw new ApiRequestError(msg, res.status);
  }

  if (
    body &&
    typeof body === "object" &&
    "success" in body &&
    (body as SuccessEnvelope<T>).success === true &&
    "data" in body
  ) {
    return (body as SuccessEnvelope<T>).data;
  }

  return body as T;
}

export async function apiFetchPaginated<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<{ data: T[]; meta: PaginationMeta }> {
  const body = await fetchWithFullResponse(path, options);
  if (
    body &&
    typeof body === "object" &&
    "success" in body &&
    (body as { success: unknown }).success === false
  ) {
    throw new ApiRequestError(
      messageFromErrorBody(body) ?? "Permintaan gagal",
      500,
    );
  }
  if (
    body &&
    typeof body === "object" &&
    "success" in body &&
    (body as SuccessEnvelope<T[]>).success === true
  ) {
    const env = body as SuccessEnvelope<T[]>;
    if (!env.meta) {
      throw new ApiRequestError("Respons paginasi tidak memuat meta", 500);
    }
    return { data: env.data, meta: env.meta };
  }
  throw new ApiRequestError("Format respons tidak dikenali", 500);
}

async function fetchWithFullResponse(
  path: string,
  options: ApiFetchOptions,
): Promise<unknown> {
  const { headers, rest } = buildAuthHeaders(options);

  const res = await fetch(buildUrl(path), {
    ...rest,
    headers,
  });

  const body = await parseJson(res);

  if (!res.ok) {
    if (res.status === 401 && !options.skipAuth) {
      notifyUnauthorized();
    }
    const msg = messageFromErrorBody(body) ?? `Permintaan gagal (${res.status})`;
    throw new ApiRequestError(msg, res.status);
  }

  if (
    body &&
    typeof body === "object" &&
    "success" in body &&
    (body as { success: unknown }).success === false
  ) {
    throw new ApiRequestError(
      messageFromErrorBody(body) ?? "Permintaan gagal",
      res.status,
    );
  }

  return body;
}
