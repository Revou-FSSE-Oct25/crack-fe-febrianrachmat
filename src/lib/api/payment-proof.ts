import { notifyUnauthorized } from "@/lib/auth/session";
import { getStoredAccessToken } from "@/lib/auth/storage";
import { ApiRequestError } from "./client";
import { getApiBaseUrl } from "./config";

export function hasTransactionPaymentProof(
  url: string | null | undefined,
): boolean {
  return Boolean((url ?? "").trim());
}

export function isExternalPaymentProofUrl(url: string): boolean {
  const u = url.trim();
  return u.startsWith("http://") || u.startsWith("https://");
}

function buildPaymentProofUrl(transactionId: string): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  return `${base}/transactions/${transactionId}/payment-proof`;
}

/**
 * Buka bukti bayar: URL eksternal langsung; file upload lewat endpoint auth.
 */
export async function openTransactionPaymentProof(
  transactionId: string,
  paymentProofUrl: string,
): Promise<void> {
  const proof = paymentProofUrl.trim();
  if (!proof) {
    throw new ApiRequestError("Bukti pembayaran tidak tersedia.", 404);
  }

  if (isExternalPaymentProofUrl(proof)) {
    window.open(proof, "_blank", "noopener,noreferrer");
    return;
  }

  const token = getStoredAccessToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildPaymentProofUrl(transactionId), { headers });

  if (res.status === 401) {
    notifyUnauthorized();
    throw new ApiRequestError("Sesi berakhir. Silakan masuk lagi.", 401);
  }

  if (!res.ok) {
    throw new ApiRequestError(
      `Gagal memuat bukti pembayaran (${res.status}).`,
      res.status,
    );
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const opened = window.open(objectUrl, "_blank", "noopener,noreferrer");
  if (!opened) {
    URL.revokeObjectURL(objectUrl);
    throw new ApiRequestError(
      "Pop-up diblokir. Izinkan pop-up untuk situs ini lalu coba lagi.",
      0,
    );
  }
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}
