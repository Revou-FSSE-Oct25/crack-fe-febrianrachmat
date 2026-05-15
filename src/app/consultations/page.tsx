"use client";

import {
  AlertBanner,
  btnOutline,
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
import {
  createConsultation,
  listMyConsultations,
  updateConsultationStatus,
  type UpdateConsultationStatusBody,
} from "@/lib/api/consultations";
import { browsePhysiotherapists } from "@/lib/api/physiotherapists";
import { createOrGetConversation } from "@/lib/api/chat";
import { createTransaction } from "@/lib/api/transactions";
import type { PhysiotherapistBrowseItem } from "@/lib/api/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ConsultationStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

type ConsultationSlaTierUi = "STANDARD" | "FAST_ONLINE";

type ConsultationRow = {
  id: string;
  complaint: string;
  status: ConsultationStatus;
  createdAt: string;
  feeSnapshot: string | null;
  slaTier: ConsultationSlaTierUi;
};

function asConsultationRows(data: unknown): ConsultationRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      complaint: String(r.complaint ?? ""),
      status: String(r.status ?? "REQUESTED") as ConsultationStatus,
      createdAt: String(r.createdAt ?? ""),
      feeSnapshot:
        r.feeSnapshot != null && r.feeSnapshot !== ""
          ? String(r.feeSnapshot)
          : null,
      slaTier:
        r.slaTier === "FAST_ONLINE" ? "FAST_ONLINE" : "STANDARD",
    };
  });
}

const STATUS_LABEL: Record<ConsultationStatus, string> = {
  REQUESTED: "Menunggu terapis",
  ACCEPTED: "Menunggu pembayaran",
  IN_PROGRESS: "Sesi aktif",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const STATUS_CHIP: Record<ConsultationStatus, string> = {
  REQUESTED: "bg-amber-50 text-amber-800 border-amber-200",
  ACCEPTED: "bg-sky-50 text-sky-800 border-sky-200",
  IN_PROGRESS: "bg-emerald-50 text-emerald-800 border-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELLED: "bg-rose-50 text-rose-800 border-rose-200",
};

function formatRupiah(value: string | null): string {
  if (!value) return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

type ConsultationPayProof = { file: File | null; url: string };

export default function ConsultationsPage() {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<ConsultationRow[]>([]);
  const [therapists, setTherapists] = useState<PhysiotherapistBrowseItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [proofByConsultationId, setProofByConsultationId] = useState<
    Record<string, ConsultationPayProof>
  >({});

  const [physiotherapistId, setPhysiotherapistId] = useState("");
  const [complaint, setComplaint] = useState("");
  const [slaTier, setSlaTier] = useState<ConsultationSlaTierUi>("STANDARD");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listMyConsultations({ page: 1, limit: 50 });
      setRows(asConsultationRows(list));
      if (user?.role === "PATIENT") {
        const browse = await browsePhysiotherapists({ limit: 50, page: 1 });
        setTherapists(browse.items);
      }
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memuat data.",
      );
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (!isReady || !user) return;
    void load();
  }, [isReady, user, load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (complaint.trim().length < 10) {
      setError("Keluhan minimal 10 karakter.");
      return;
    }
    if (!physiotherapistId) {
      setError("Pilih fisioterapis.");
      return;
    }
    if (slaTier === "FAST_ONLINE") {
      const t = therapists.find((x) => x.id === physiotherapistId);
      const online =
        t?.onlineUntil != null && new Date(String(t.onlineUntil)) > new Date();
      if (!online) {
        setError(
          "Respons cepat (10 menit) hanya jika terapis sedang online. Pilih Standar atau pilih terapis dari daftar yang punya badge Online.",
        );
        return;
      }
    }
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      await createConsultation({
        physiotherapistId,
        complaint: complaint.trim(),
        slaTier: slaTier === "FAST_ONLINE" ? "FAST_ONLINE" : undefined,
      });
      setComplaint("");
      setSlaTier("STANDARD");
      setInfo(
        "Permintaan konsultasi terkirim. Tunggu terapis menerima, lalu kamu akan diminta membayar.",
      );
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal membuat konsultasi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function openChat(consultationId: string) {
    try {
      const conv = (await createOrGetConversation({
        consultationId,
      })) as { id: string };
      router.push(`/chat/${conv.id}`);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal membuka chat.",
      );
    }
  }

  async function patchStatus(
    id: string,
    status: UpdateConsultationStatusBody["status"],
  ) {
    setError(null);
    setInfo(null);
    try {
      await updateConsultationStatus(id, { status });
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memperbarui status.",
      );
    }
  }

  // Patient initiates payment for an ACCEPTED consultation. The dummy
  // gateway is just a POST that lands in PENDING; admin will confirm.
  async function payConsultation(row: ConsultationRow) {
    if (row.status !== "ACCEPTED") return;
    if (!row.feeSnapshot) {
      setError("Biaya konsultasi tidak diketahui untuk sesi ini.");
      return;
    }
    const proof =
      proofByConsultationId[row.id] ?? ({ file: null, url: "" } satisfies ConsultationPayProof);
    const trimmedUrl = proof.url.trim();
    if (!proof.file && !trimmedUrl) {
      setError(
        "Lampirkan bukti pembayaran: unggah file atau isi URL bukti (https).",
      );
      return;
    }
    if (trimmedUrl && !trimmedUrl.startsWith("https://")) {
      setError("URL bukti harus memakai https://");
      return;
    }
    setError(null);
    setInfo(null);
    setPayingId(row.id);
    try {
      await createTransaction({
        consultationId: row.id,
        paymentMethod: "BANK_TRANSFER",
        paymentProofUrl: trimmedUrl || undefined,
        proofFile: proof.file ?? undefined,
      });
      setProofByConsultationId((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
      setInfo(
        "Permintaan pembayaran terkirim. Admin akan mengonfirmasi sebentar lagi; chat akan terbuka otomatis setelahnya. Pantau di halaman Transaksi.",
      );
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal membuat pembayaran.",
      );
    } finally {
      setPayingId(null);
    }
  }

  function setConsultationProof(
    consultationId: string,
    patch: Partial<ConsultationPayProof>,
  ) {
    setProofByConsultationId((prev) => {
      const cur = prev[consultationId] ?? { file: null, url: "" };
      return { ...prev, [consultationId]: { ...cur, ...patch } };
    });
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return (
      <SignInRequired message="Silakan masuk untuk melihat konsultasi." />
    );
  }

  return (
    <main className={`${pageShell} space-y-10 pb-16`}>
      <PageHeader
        title="Konsultasi"
        description="Ajukan keluhan awal, bayar setelah terapis menerima, lalu mulai sesi chat profesional."
      />

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}
      {info ? <AlertBanner variant="success">{info}</AlertBanner> : null}

      {user.role === "PATIENT" && (
        <section className={`${cardSurface} space-y-4`}>
          <h2 className="text-lg font-semibold text-slate-900">
            Ajukan konsultasi baru
          </h2>
          <p className="text-sm text-slate-600">
            Alur: <strong>terapis menerima</strong> → kamu{" "}
            <strong>lampirkan bukti bayar</strong> lalu{" "}
            <strong>bayar</strong> → chat otomatis aktif setelah pembayaran
            dikonfirmasi admin.
          </p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Fisioterapis
              </label>
              <select
                required
                className={inputBase}
                value={physiotherapistId}
                onChange={(e) => setPhysiotherapistId(e.target.value)}
              >
                <option value="">— Pilih —</option>
                {therapists.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user.fullName}
                    {t.consultationFee != null && t.consultationFee !== ""
                      ? ` · online ${formatRupiah(String(t.consultationFee))}`
                      : ""}
                    {t.visitFee != null && t.visitFee !== ""
                      ? ` · visit ${formatRupiah(String(t.visitFee))}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-700">
                Batas waktu balasan terapis setelah bayar
              </legend>
              <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="slaTier"
                  checked={slaTier === "STANDARD"}
                  onChange={() => setSlaTier("STANDARD")}
                  className="mt-1"
                />
                <span>
                  <strong>Standar (24 jam)</strong> — cocok jika kamu memilih
                  terapis tertentu; balasan bisa lebih lama.
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="slaTier"
                  checked={slaTier === "FAST_ONLINE"}
                  onChange={() => setSlaTier("FAST_ONLINE")}
                  className="mt-1"
                />
                <span>
                  <strong>Respons cepat (~10 menit)</strong> — hanya jika terapis
                  sedang <em>online</em> (badge Online). Jika tidak ada balasan,
                  pembayaran dikembalikan otomatis oleh sistem.
                </span>
              </label>
            </fieldset>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Keluhan (min. 10 karakter)
              </label>
              <textarea
                required
                minLength={10}
                className={`${inputBase} min-h-[120px]`}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || loading}
              className={btnPrimary}
            >
              {submitting ? "Mengirim…" : "Kirim"}
            </button>
          </form>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Daftar konsultasi
        </h2>
        {loading ? (
          <ListSkeleton rows={3} />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Belum ada konsultasi"
            hint={
              user.role === "PATIENT"
                ? "Ajukan konsultasi baru dengan form di atas."
                : "Permintaan dari pasien akan muncul di sini."
            }
          />
        ) : (
          <ul className="space-y-4">
            {rows.map((c) => {
              const chip = STATUS_CHIP[c.status] ?? STATUS_CHIP.REQUESTED;
              const label = STATUS_LABEL[c.status] ?? c.status;
              const isPatient = user.role === "PATIENT";
              const isPt = user.role === "PHYSIOTHERAPIST";
              const isAdmin = user.role === "ADMIN";

              const canChat = c.status === "IN_PROGRESS" || isAdmin;
              const canPay = isPatient && c.status === "ACCEPTED";
              const canCancel =
                isPatient &&
                (c.status === "REQUESTED" || c.status === "ACCEPTED");
              const canComplete =
                (isPatient || isPt) && c.status === "IN_PROGRESS";
              const canAccept = isPt && c.status === "REQUESTED";

              return (
                <li
                  key={c.id}
                  className={`${cardSurface} flex flex-col gap-3 md:flex-row md:justify-between md:items-start`}
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${chip}`}
                      >
                        {label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(c.createdAt).toLocaleString("id-ID")}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-700">
                        Biaya: <strong>{formatRupiah(c.feeSnapshot)}</strong>
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-600">
                        SLA:{" "}
                        {c.slaTier === "FAST_ONLINE"
                          ? "cepat (~10 min)"
                          : "standar (~24 jam)"}
                      </span>
                    </div>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {c.complaint}
                    </p>
                    {c.status === "REQUESTED" && isPatient && (
                      <p className="text-xs text-slate-500">
                        Menunggu terapis menerima. Pembayaran dibuka setelah
                        diterima.
                      </p>
                    )}
                    {c.status === "ACCEPTED" && isPatient && (
                      <p className="text-xs text-slate-500">
                        Terapis sudah menerima. Unggah bukti transfer atau tautan
                        https, lalu bayar untuk membuka sesi chat.
                      </p>
                    )}
                    {c.status === "IN_PROGRESS" && (
                      <p className="text-xs text-emerald-700">
                        Pembayaran dikonfirmasi. Chat aktif.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0 md:justify-end">
                    {canPay && (
                      <div className="w-full md:w-auto md:max-w-xs space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                        <p className="text-xs font-medium text-slate-700">
                          Bukti pembayaran (wajib)
                        </p>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          disabled={payingId === c.id}
                          className={`${inputBase} py-2 text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-white file:px-2 file:py-1 file:text-xs`}
                          onChange={(e) =>
                            setConsultationProof(c.id, {
                              file: e.target.files?.[0] ?? null,
                            })
                          }
                        />
                        <input
                          type="url"
                          disabled={payingId === c.id}
                          className={`${inputBase} text-sm`}
                          placeholder="https://contoh.com/bukti.png"
                          value={
                            proofByConsultationId[c.id]?.url ?? ""
                          }
                          onChange={(e) =>
                            setConsultationProof(c.id, {
                              url: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => void payConsultation(c)}
                          disabled={payingId === c.id}
                          className={btnPrimary}
                        >
                          {payingId === c.id
                            ? "Memproses…"
                            : `Bayar ${formatRupiah(c.feeSnapshot)}`}
                        </button>
                      </div>
                    )}
                    {canChat && (
                      <button
                        type="button"
                        onClick={() => void openChat(c.id)}
                        className="inline-flex items-center rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-teal-100/80 transition-colors"
                      >
                        Buka chat
                      </button>
                    )}
                    {canAccept && (
                      <button
                        type="button"
                        onClick={() => void patchStatus(c.id, "ACCEPTED")}
                        className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-100/80 transition-colors"
                      >
                        Terima permintaan
                      </button>
                    )}
                    {canComplete && (
                      <button
                        type="button"
                        onClick={() => void patchStatus(c.id, "COMPLETED")}
                        className={`${btnOutline} bg-slate-50`}
                      >
                        Tandai selesai
                      </button>
                    )}
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => void patchStatus(c.id, "CANCELLED")}
                        className={btnOutline}
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
