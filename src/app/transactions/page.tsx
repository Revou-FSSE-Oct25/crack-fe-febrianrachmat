"use client";

import {
  AlertBanner,
  btnDanger,
  btnPrimary,
  cardSurface,
  EmptyState,
  inputBase,
  ListSkeleton,
  PageHeader,
  PageLoading,
  pageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
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
import { useCallback, useEffect, useState } from "react";

type PendingBookingPay = {
  id: string;
  visitFeeSnapshot: string | number;
};

function formatIdrSnapshot(
  value: string | number | null | undefined,
): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

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
  const [pendingBookings, setPendingBookings] = useState<PendingBookingPay[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [bookingId, setBookingId] = useState("");
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
          const opts: PendingBookingPay[] = data.map((raw) => {
            const b = raw as Record<string, unknown>;
            return {
              id: String(b.id ?? ""),
              visitFeeSnapshot: b.visitFeeSnapshot as string | number,
            };
          });
          setPendingBookings(opts);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.role]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingId) {
      setError("Pilih booking.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createTransaction({
        bookingId,
        paymentMethod,
      });
      setBookingId("");
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
    return <PageLoading />;
  }

  if (!user) {
    return (
      <SignInRequired message="Silakan masuk untuk melihat transaksi." />
    );
  }

  if (user.role === "PHYSIOTHERAPIST") {
    return (
      <main className={`${pageShell} space-y-4`}>
        <PageHeader
          title="Transaksi"
          description="Daftar transaksi tersedia untuk Pasien dan Admin. Akun fisioterapis tidak menggunakan halaman ini."
        />
        <div className={cardSurface}>
          <p className="text-slate-700 text-sm leading-relaxed">
            Gunakan pintasan di bawah navbar untuk konsultasi, booking, dan chat.
            Pembayaran dilakukan oleh pasien melalui menu Transaksi di akun mereka.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={`${pageShell} space-y-8`}>
      <PageHeader
        title="Transaksi"
        description={
          user.role === "ADMIN"
            ? "Konfirmasi pembayaran dummy dan refund untuk transaksi yang memenuhi syarat."
            : "Buat permintaan pembayaran untuk booking Anda. Nominal mengikuti tarif visit terapis saat booking dibuat. Konfirmasi lunas oleh admin."
        }
      />

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {user.role === "PATIENT" && (
        <section className={`${cardSurface} space-y-4`}>
          <h2 className="text-lg font-semibold text-slate-900">
            Buat transaksi (dummy)
          </h2>
          <form onSubmit={handleCreate} className="space-y-3 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Booking &amp; tarif visit
              </label>
              <select
                required
                className={inputBase}
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
              >
                <option value="">— Pilih booking —</option>
                {pendingBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id.slice(0, 8)}… · {formatIdrSnapshot(b.visitFeeSnapshot)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Metode bayar
              </label>
              <select
                className={inputBase}
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
              className={btnPrimary}
            >
              {creating ? "Menyimpan…" : "Buat transaksi"}
            </button>
          </form>
          <p className="text-sm text-slate-600 max-w-md leading-relaxed">
            Setelah transaksi berstatus <strong>PENDING</strong>, konfirmasi
            pembayaran dilakukan oleh <strong>admin</strong> (bukan dari akun
            pasien). Silakan tunggu atau hubungi admin.
          </p>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Daftar transaksi
        </h2>
        {user.role === "ADMIN" && (
          <p className="text-sm text-slate-600 leading-relaxed">
            Transaksi <strong>PENDING</strong>: konfirmasi pembayaran dummy
            lewat tombol di bawah (
            <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono">
              PATCH /admin/transactions/:transactionId/pay
            </code>
            ). Transaksi <strong>PAID</strong>: refund dummy lewat{" "}
            <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono">
              PATCH /admin/transactions/:transactionId/refund
            </code>{" "}
            (alasan min. 5 karakter).
          </p>
        )}
        {loading ? (
          <ListSkeleton rows={3} />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Belum ada transaksi"
            hint="Buat transaksi dari booking yang sudah ada (pasien), atau tunggu data masuk (admin)."
          />
        ) : (
          <ul className="space-y-4">
            {rows.map((t) => (
              <li key={t.id} className={`${cardSurface} space-y-3`}>
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <div>
                    <p className="font-semibold text-slate-900">{t.status}</p>
                    <p className="text-sm text-slate-600">
                      {t.paymentMethod} ·{" "}
                      {typeof t.amount === "string"
                        ? t.amount
                        : t.amount.toFixed?.(2) ?? t.amount}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-mono break-all">
                      {t.id}
                    </p>
                  </div>
                  {user.role === "PATIENT" && t.status === "PENDING" && (
                    <span className="text-sm text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-xl shrink-0 max-w-xs">
                      Menunggu konfirmasi pembayaran dari admin
                    </span>
                  )}
                </div>
                {user.role === "ADMIN" && t.status === "PENDING" && (
                  <div className="border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      disabled={confirmingPayId === t.id}
                      onClick={() => void confirmPaymentAsAdmin(t.id)}
                      className={`${btnPrimary} text-sm`}
                    >
                      {confirmingPayId === t.id
                        ? "Memproses…"
                        : "Konfirmasi pembayaran (dummy)"}
                    </button>
                  </div>
                )}
                {user.role === "ADMIN" && t.status === "PAID" && (
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <label className="block text-sm text-slate-700">
                      Alasan refund (min. 5 karakter)
                    </label>
                    <textarea
                      className={`${inputBase} min-h-[72px]`}
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
                      className={`${btnDanger} text-sm`}
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
