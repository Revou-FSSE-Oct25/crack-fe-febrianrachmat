/** Batas waktu fetch ke API (ms) — mencegah UI menggantung saat backend mati. */
export const API_FETCH_TIMEOUT_MS = 20_000;

export class FetchTimeoutError extends Error {
  constructor(message = "Permintaan ke API melebihi batas waktu.") {
    super(message);
    this.name = "FetchTimeoutError";
  }
}

/** Pesan ramah untuk demo saat jaringan/API tidak terjangkau. */
export function friendlyFetchError(err: unknown): string {
  if (err instanceof FetchTimeoutError) {
    return `${err.message} Periksa backend dan NEXT_PUBLIC_API_URL, lalu coba lagi.`;
  }
  if (err instanceof TypeError) {
    return "Tidak dapat terhubung ke API. Pastikan backend berjalan dan NEXT_PUBLIC_API_URL benar.";
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Terjadi kesalahan jaringan. Coba lagi.";
}

export function isRetryableFetchError(err: unknown): boolean {
  return err instanceof FetchTimeoutError || err instanceof TypeError;
}

/**
 * fetch dengan AbortSignal.timeout — selaras dukungan Node 18+ / browser modern.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = API_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const signal = AbortSignal.timeout(timeoutMs);
  try {
    return await fetch(input, { ...init, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new FetchTimeoutError();
    }
    throw err;
  }
}
