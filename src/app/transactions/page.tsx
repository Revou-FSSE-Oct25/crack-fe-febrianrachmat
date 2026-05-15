"use client";

import {
  AdminBreadcrumb,
  AlertBanner,
  btnDanger,
  btnOutline,
  btnPrimary,
  btnSecondary,
  cardSurface,
  EmptyState,
  inputBase,
  ListSkeleton,
  PageHeader,
  ConfirmDialog,
  PageLoading,
  StatusChip,
  widePageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
import { transactionStatusMeta } from "@/lib/status-meta";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { listMyBookings } from "@/lib/api/bookings";
import { transactionReferenceLabel } from "@/lib/api/contract";
import {
  confirmTransactionPaidByAdmin,
  createTransaction,
  listTransactions,
  refundTransaction,
  type CreateTransactionBody,
  type Transaction,
} from "@/lib/api/transactions";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type PendingBookingPay = {
  id: string;
  visitFeeSnapshot: string | number;
};

function proofDisplayHref(url: string | null | undefined): string | null {
  const u = (url ?? "").trim();
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  const base = getApiBaseUrl().replace(/\/$/, "");
  const path = u.startsWith("/") ? u : `/${u}`;
  return `${base}${path}`;
}

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

export default function TransactionsPage() {
  const { user, isReady } = useAuth();
  const toast = useToast();
  const [rows, setRows] = useState<Transaction[]>([]);
  const [pendingBookings, setPendingBookings] = useState<PendingBookingPay[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [bookingId, setBookingId] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<CreateTransactionBody["paymentMethod"]>("QRIS");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [refundReasonById, setRefundReasonById] = useState<
    Record<string, string>
  >({});
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [refundConfirmId, setRefundConfirmId] = useState<string | null>(null);
  const [confirmingPayId, setConfirmingPayId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listTransactions({ page: 1, limit: 50 });
      setRows(list);
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
    Promise.all([
      listMyBookings({ page: 1, limit: 50 }),
      listTransactions({ page: 1, limit: 50 }),
    ])
      .then(([bookings, transactions]) => {
        if (cancelled) return;
        const bookedWithOpenTx = new Set(
          transactions
            .filter((t) => t.bookingId && (t.status === "PENDING" || t.status === "PAID"))
            .map((t) => t.bookingId as string),
        );
        const opts: PendingBookingPay[] = bookings
          .filter(
            (b) =>
              b.status === "PENDING" &&
              !bookedWithOpenTx.has(b.id),
          )
          .map((b) => ({
            id: b.id,
            visitFeeSnapshot: b.visitFeeSnapshot,
          }));
        setPendingBookings(opts);
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
    const trimmedProofUrl = paymentProofUrl.trim();
    if (!proofFile && !trimmedProofUrl) {
      setError(
        "Lampirkan bukti pembayaran: unggah file atau isi URL bukti (https).",
      );
      return;
    }
    if (
      trimmedProofUrl &&
      !trimmedProofUrl.startsWith("https://")
    ) {
      setError("URL bukti harus memakai https://");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createTransaction({
        bookingId,
        paymentMethod,
        paymentProofUrl: trimmedProofUrl || undefined,
        proofFile: proofFile ?? undefined,
      });
      setBookingId("");
      setPaymentProofUrl("");
      setProofFile(null);
      toast.success("Transaksi dibuat. Menunggu konfirmasi admin.");
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
      toast.success("Pembayaran dikonfirmasi.");
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

  function requestRefundConfirm(id: string) {
    const reason = (refundReasonById[id] ?? "").trim();
    if (reason.length < 5) {
      setError("Alasan refund minimal 5 karakter.");
      return;
    }
    setError(null);
    setRefundConfirmId(id);
  }

  async function confirmRefund() {
    if (!refundConfirmId) return;
    const id = refundConfirmId;
    const reason = (refundReasonById[id] ?? "").trim();
    setRefundingId(id);
    setError(null);
    try {
      await refundTransaction(id, { reason });
      setRefundReasonById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setRefundConfirmId(null);
      toast.success("Refund berhasil diproses (dummy).");
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
      <main className={`${widePageShell} space-y-6 pb-16`}>
        <PageHeader
          eyebrow="Pembayaran"
          title="Transaksi"
          description="Daftar transaksi tersedia untuk Pasien dan Admin. Akun fisioterapis tidak menggunakan halaman ini."
        />
        <div className={`${cardSurface} space-y-4`}>
          <p className="text-sm leading-relaxed text-slate-700">
            Gunakan pintasan di bawah navbar untuk konsultasi, booking, dan chat.
            Pembayaran dilakukan oleh pasien melalui menu Transaksi di akun mereka.
          </p>
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap">
            <Link
              href="/bookings"
              className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
            >
              Daftar booking
            </Link>
            <Link
              href="/consultations"
              className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[11rem]`}
            >
              Konsultasi
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      {user.role === "ADMIN" ? <AdminBreadcrumb /> : null}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Pembayaran"
          title="Transaksi"
          description={
            user.role === "ADMIN"
              ? "Konfirmasi pembayaran dummy dan refund untuk transaksi yang memenuhi syarat."
              : "Buat permintaan pembayaran untuk booking Anda. Nominal mengikuti tarif visit terapis saat booking dibuat. Konfirmasi lunas oleh admin."
          }
        />
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          {user.role === "PATIENT" ? (
            <>
              <Link
                href="/bookings"
                className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
              >
                Daftar booking
              </Link>
              <Link
                href="/consultations"
                className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[11rem]`}
              >
                Konsultasi
              </Link>
            </>
          ) : null}
        </div>
      </div>

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
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Bukti pembayaran (wajib)
              </label>
              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                Unggah screenshot/struk, atau tautan https ke bukti di cloud
                storage. Salah satu wajib diisi sebelum transaksi dibuat.
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                className={`${inputBase} py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm`}
                onChange={(e) =>
                  setProofFile(e.target.files?.[0] ?? null)
                }
              />
              <input
                type="url"
                className={`${inputBase} mt-2`}
                placeholder="https://contoh.com/bukti-bayar.png"
                value={paymentProofUrl}
                onChange={(e) => setPaymentProofUrl(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className={`${btnPrimary} min-h-[44px]`}
            >
              {creating ? "Menyimpan…" : "Buat transaksi"}
            </button>
          </form>
          <p className="text-sm text-slate-600 max-w-md leading-relaxed">
            Pembayaran untuk <strong>konsultasi online</strong> dibuat dari halaman{" "}
            <Link href="/consultations" className="text-teal-700 underline font-medium">
              Konsultasi
            </Link>{" "}
            setelah terapis menerima. Formulir di atas hanya untuk transaksi{" "}
            <strong>booking kunjungan</strong>. Bukti bayar wajib; konfirmasi lunas
            oleh admin.
          </p>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Daftar transaksi
        </h2>
        {user.role === "ADMIN" && (
          <p className="text-sm text-slate-600 leading-relaxed">
            Transaksi <strong>PENDING</strong> dengan bukti terlampir: konfirmasi
            pembayaran dummy lewat tombol di bawah (
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
            hint={
              user.role === "PATIENT"
                ? "Setelah booking selesai, buat transaksi pembayaran dari formulir di atas."
                : "Transaksi dari pasien akan muncul di sini untuk dikonfirmasi."
            }
            actions={
              user.role === "PATIENT"
                ? [
                    { href: "/bookings", label: "Lihat booking saya" },
                    {
                      href: "/appointment",
                      label: "Buat janji baru",
                      variant: "secondary",
                    },
                  ]
                : [{ href: "/admin/dashboard", label: "Kembali ke dashboard" }]
            }
          />
        ) : (
          <ul className="space-y-4">
            {rows.map((t) => (
              <li key={t.id} className={`${cardSurface} space-y-3`}>
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <div className="min-w-0 flex-1 space-y-2">
                    <StatusChip
                      label={transactionStatusMeta(t.status).label}
                      tone={transactionStatusMeta(t.status).tone}
                    />
                    <p className="text-sm text-slate-600">
                      {t.paymentMethod} · {formatIdrSnapshot(t.amount)}
                    </p>
                    <p className="text-xs text-slate-600">
                      {transactionReferenceLabel(t)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-mono break-all">
                      {t.id}
                    </p>
                    {proofDisplayHref(t.paymentProofUrl) ? (
                      <p className="text-sm mt-2">
                        <a
                          href={proofDisplayHref(t.paymentProofUrl)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 underline font-medium"
                        >
                          Lihat bukti pembayaran
                        </a>
                      </p>
                    ) : (
                      <p className="text-xs text-amber-800 mt-2">
                        Belum ada bukti terlampir pada transaksi ini.
                      </p>
                    )}
                  </div>
                  {user.role === "PATIENT" && t.status === "PENDING" && (
                    <span className="text-sm text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-xl shrink-0 max-w-xs">
                      Menunggu konfirmasi pembayaran dari admin
                    </span>
                  )}
                </div>
                {user.role === "ADMIN" && t.status === "PENDING" && (
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    {!proofDisplayHref(t.paymentProofUrl) ? (
                      <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-xl">
                        Konfirmasi bayar dinonaktifkan sampai pasien melampirkan
                        bukti (URL atau unggahan).
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={
                        confirmingPayId === t.id ||
                        !proofDisplayHref(t.paymentProofUrl)
                      }
                      onClick={() => void confirmPaymentAsAdmin(t.id)}
                      className={`${btnPrimary} min-h-[44px] text-sm disabled:pointer-events-none disabled:opacity-50`}
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
                      onClick={() => requestRefundConfirm(t.id)}
                      className={`${btnDanger} min-h-[44px] text-sm`}
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

      <ConfirmDialog
        open={refundConfirmId !== null}
        title="Proses refund?"
        description="Transaksi akan ditandai refund (dummy). Pastikan alasan refund sudah benar — tindakan ini untuk keperluan demo admin."
        confirmLabel="Ya, refund"
        cancelLabel="Tidak jadi"
        variant="danger"
        loading={refundConfirmId !== null && refundingId === refundConfirmId}
        onConfirm={() => void confirmRefund()}
        onCancel={() => {
          if (refundingId === null) setRefundConfirmId(null);
        }}
      />
    </main>
  );
}
