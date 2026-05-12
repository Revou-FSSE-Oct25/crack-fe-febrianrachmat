import { apiFetch } from "./client";

/** Selaras `CreateTransactionDto` */
export type CreateTransactionBody = {
  bookingId: string;
  amount: number;
  paymentMethod:
    | "BANK_TRANSFER"
    | "E_WALLET"
    | "CREDIT_CARD"
    | "QRIS";
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
  return apiFetch<unknown>("/transactions", {
    method: "POST",
    body: JSON.stringify(body),
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
}): Promise<unknown[]> {
  return apiFetch<unknown[]>(
    `/transactions${paginationQuery(params ?? {})}`,
  );
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
