"use client";

import { ApiRequestError } from "@/lib/api/client";
import {
  hasTransactionPaymentProof,
  openTransactionPaymentProof,
} from "@/lib/api/payment-proof";
import { useState } from "react";

type PaymentProofLinkProps = {
  transactionId: string;
  paymentProofUrl: string | null | undefined;
};

export function PaymentProofLink({
  transactionId,
  paymentProofUrl,
}: PaymentProofLinkProps) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hasTransactionPaymentProof(paymentProofUrl)) {
    return (
      <p className="text-xs text-amber-800 mt-2">
        Belum ada bukti terlampir pada transaksi ini.
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      <button
        type="button"
        disabled={opening}
        onClick={() => {
          setError(null);
          setOpening(true);
          void openTransactionPaymentProof(
            transactionId,
            paymentProofUrl as string,
          )
            .catch((err: unknown) => {
              const msg =
                err instanceof ApiRequestError
                  ? err.message
                  : err instanceof Error
                    ? err.message
                    : "Gagal membuka bukti pembayaran.";
              setError(msg);
            })
            .finally(() => setOpening(false));
        }}
        className="text-sm text-teal-700 underline font-medium disabled:opacity-60"
      >
        {opening ? "Membuka bukti…" : "Lihat bukti pembayaran"}
      </button>
      {error ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
