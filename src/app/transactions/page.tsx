"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { listMyBookings } from "@/lib/api/bookings";
import {
  confirmTransactionPaidByAdmin,
  createTransaction,
  listTransactions,
  refundTransaction,
  type CreateTransactionBody,
} from "@/lib/api/transactions";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type TxRow = {
  id: string;
  bookingId: string;
  status: string;
  amount: string | number;
  paymentMethod: string;
  createdAt: string;
};

function asTxRows(data: unknown): TxRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      bookingId: String(r.bookingId ?? ""),
      status: String(r.status ?? ""),
      amount: r.amount as string | number,
      paymentMethod: String(r.paymentMethod ?? ""),
      createdAt: String(r.createdAt ?? ""),
    };
  });
}

export default function TransactionsPage() {
  const { user, isReady } = useAuth();
  const [rows, setRows] = useState<TxRow[]>([]);
  const [bookingIds, setBookingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<CreateTransactionBody["paymentMethod"]>("QRIS");

  const [refundReasonById, setRefundReasonById] = useState<
    Record<string, string>
  >({});
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [confirmingPayId, setConfirmingPayId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listTransactions({ page: 1, limit: 50 });
      setRows(asTxRows(list));
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memuat transaksi.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady || !user) return;
    if (user.role === "PHYSIOTHERAPIST") {
      setLoading(false);
      return;
    }
    void load();
  }, [isReady, user, load]);

  useEffect(() => {
    if (!isReady || user?.role !== "PATIENT") return;
    let cancelled = false;
    listMyBookings({ page: 1, limit: 50 })
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          const ids = data.map((b) => String((b as { id: string }).id ?? ""));
          setBookingIds(ids);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.role]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(amount);
    if (!bookingId || Number.isNaN(num) || num < 0) {
      setError("Booking dan jumlah harus valid.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createTransaction({
        bookingId,
        amount: num,
        paymentMethod,
      });
      setAmount("");
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal membuat transaksi.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function confirmPaymentAsAdmin(id: string) {
    setConfirmingPayId(id);
    setError(null);
    try {
      await confirmTransactionPaidByAdmin(id);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal mengonfirmasi pembayaran.",
      );
    } finally {
      setConfirmingPayId(null);
    }
  }

  async function refund(id: string) {
    const reason = (refundReasonById[id] ?? "").trim();
    if (reason.length < 5) {
      setError("Alasan refund minimal 5 karakter.");
      return;
    }
    setRefundingId(id);
    setError(null);
    try {
      await refundTransaction(id, { reason });
      setRefundReasonById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal refund.",
      );
    } finally {
      setRefundingId(null);
    }
  }

  if (!isReady) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6 text-center space-y-4">
        <p>Silakan masuk.</p>
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  if (user.role === "PHYSIOTHERAPIST") {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-bold mb-4">Transaksi</h1>
        <p className="text-gray-700">
          Daftar transaksi tersedia untuk peran Pasien dan Admin. Akun
          fisioterapis tidak memakai endpoint ini.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-16 px-6 space-y-8">
      <h1 className="text-3xl font-bold">Transaksi</h1>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
          {error}
        </p>
      )}

      {user.role === "PATIENT" && (
        <section className="border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Buat transaksi (dummy)</h2>
          <form onSubmit={handleCreate} className="space-y-3 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Booking</label>
              <select
                required
                className="border rounded w-full p-3"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
              >
                <option value="">— Pilih booking —</option>
                {bookingIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jumlah</label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                className="border rounded w-full p-3"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Metode bayar
              </label>
              <select
                className="border rounded w-full p-3"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as CreateTransactionBody["paymentMethod"],
                  )
                }
              >
                <option value="QRIS">QRIS</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
                <option value="E_WALLET">E-wallet</option>
                <option value="CREDIT_CARD">Kartu kredit</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-teal-500 text-white px-6 py-2 rounded disabled:opacity-60"
            >
              {creating ? "Menyimpan…" : "Buat transaksi"}
            </button>
          </form>
          <p className="text-sm text-gray-600 max-w-md">
            Setelah transaksi berstatus <strong>PENDING</strong>, konfirmasi
            pembayaran dilakukan oleh <strong>admin</strong> (bukan dari akun
            pasien). Silakan tunggu atau hubungi admin.
          </p>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">Daftar transaksi</h2>
        {user.role === "ADMIN" && (
          <p className="text-sm text-gray-600 mb-4">
            Transaksi <strong>PENDING</strong>: konfirmasi pembayaran dummy
            lewat tombol di bawah (
            <code className="bg-gray-100 px-1 rounded text-xs">
              PATCH /admin/transactions/:transactionId/pay
            </code>
            ). Transaksi <strong>PAID</strong>: refund dummy lewat{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">
              PATCH /admin/transactions/:transactionId/refund
            </code>{" "}
            (alasan min. 5 karakter).
          </p>
        )}
        {loading ? (
          <p className="text-gray-600">Memuat…</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-600">Belum ada transaksi.</p>
        ) : (
          <ul className="space-y-4">
            {rows.map((t) => (
              <li key={t.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <div>
                    <p className="font-medium">{t.status}</p>
                    <p className="text-sm text-gray-600">
                      {t.paymentMethod} ·{" "}
                      {typeof t.amount === "string"
                        ? t.amount
                        : t.amount.toFixed?.(2) ?? t.amount}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {t.id}
                    </p>
                  </div>
                  {user.role === "PATIENT" && t.status === "PENDING" && (
                    <span className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded shrink-0 max-w-xs">
                      Menunggu konfirmasi pembayaran dari admin
                    </span>
                  )}
                </div>
                {user.role === "ADMIN" && t.status === "PENDING" && (
                  <div className="border-t pt-3">
                    <button
                      type="button"
                      disabled={confirmingPayId === t.id}
                      onClick={() => void confirmPaymentAsAdmin(t.id)}
                      className="bg-teal-600 text-white text-sm px-4 py-2 rounded disabled:opacity-50"
                    >
                      {confirmingPayId === t.id
                        ? "Memproses…"
                        : "Konfirmasi pembayaran (dummy)"}
                    </button>
                  </div>
                )}
                {user.role === "ADMIN" && t.status === "PAID" && (
                  <div className="border-t pt-3 space-y-2">
                    <label className="block text-sm text-gray-700">
                      Alasan refund (min. 5 karakter)
                    </label>
                    <textarea
                      className="w-full border rounded-lg p-3 text-sm min-h-[72px]"
                      placeholder="Contoh: Permintaan pembatalan dari pasien."
                      value={refundReasonById[t.id] ?? ""}
                      onChange={(e) =>
                        setRefundReasonById((prev) => ({
                          ...prev,
                          [t.id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      disabled={refundingId === t.id}
                      onClick={() => void refund(t.id)}
                      className="bg-red-700 text-white text-sm px-4 py-2 rounded disabled:opacity-50"
                    >
                      {refundingId === t.id ? "Memproses…" : "Refund (dummy)"}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
