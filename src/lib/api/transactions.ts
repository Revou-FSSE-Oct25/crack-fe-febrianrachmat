import { apiFetch } from "./client";
import type { PaymentMethod, Transaction } from "./contract";
import { asTransactions } from "./contract";

export type { PaymentMethod, Transaction };

/**
 * Selaras `CreateTransactionDto`. Transaksi tertaut pada **salah satu**:
 * `bookingId` (visit fisik) ATAU `consultationId` (sesi chat online).
 * Nominal pembayaran selalu dari server (snapshot booking / konsultasi).
 */
export type CreateTransactionBody = {
  bookingId?: string;
  consultationId?: string;
  paymentMethod:
    | "BANK_TRANSFER"
    | "E_WALLET"
    | "CREDIT_CARD"
    | "QRIS";
  /** Bukti https (opsional jika mengunggah `proofFile`) */
  paymentProofUrl?: string;
  /** Multipart field `proof` — wajib salah satu dengan URL jika backend mensyaratkan bukti */
  proofFile?: File;
};

function paginationQuery(params: { page?: number; limit?: number }): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function createTransaction(
  body: CreateTransactionBody,
): Promise<unknown> {
  const hasFile = Boolean(body.proofFile);
  if (hasFile) {
    const fd = new FormData();
    if (body.bookingId) fd.append("bookingId", body.bookingId);
    if (body.consultationId) fd.append("consultationId", body.consultationId);
    fd.append("paymentMethod", body.paymentMethod);
    const url = body.paymentProofUrl?.trim();
    if (url) fd.append("paymentProofUrl", url);
    fd.append("proof", body.proofFile as File);
    return apiFetch<unknown>("/transactions", {
      method: "POST",
      body: fd,
    });
  }
  return apiFetch<unknown>("/transactions", {
    method: "POST",
    body: JSON.stringify({
      bookingId: body.bookingId,
      consultationId: body.consultationId,
      paymentMethod: body.paymentMethod,
      paymentProofUrl: body.paymentProofUrl?.trim() || undefined,
    }),
  });
}

/** Admin: PATCH /admin/transactions/:transactionId/pay */
export async function confirmTransactionPaidByAdmin(
  transactionId: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/transactions/${transactionId}/pay`, {
    method: "PATCH",
  });
}

export async function listTransactions(params?: {
  page?: number;
  limit?: number;
}): Promise<Transaction[]> {
  const raw = await apiFetch<unknown[]>(
    `/transactions${paginationQuery(params ?? {})}`,
  );
  return asTransactions(raw);
}

/** Selaras `RefundTransactionDto` — admin saja */
export type RefundTransactionBody = {
  reason: string;
};

export async function refundTransaction(
  transactionId: string,
  body: RefundTransactionBody,
): Promise<unknown> {
  return apiFetch<unknown>(
    `/admin/transactions/${transactionId}/refund`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}
