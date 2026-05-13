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
import type { PhysiotherapistBrowseItem } from "@/lib/api/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ConsultationRow = {
  id: string;
  complaint: string;
  status: string;
  createdAt: string;
};

function asConsultationRows(data: unknown): ConsultationRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      complaint: String(r.complaint ?? ""),
      status: String(r.status ?? ""),
      createdAt: String(r.createdAt ?? ""),
    };
  });
}

export default function ConsultationsPage() {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<ConsultationRow[]>([]);
  const [therapists, setTherapists] = useState<PhysiotherapistBrowseItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [physiotherapistId, setPhysiotherapistId] = useState("");
  const [complaint, setComplaint] = useState("");

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
    setSubmitting(true);
    setError(null);
    try {
      await createConsultation({
        physiotherapistId,
        complaint: complaint.trim(),
      });
      setComplaint("");
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
    try {
      await updateConsultationStatus(id, { status });
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memperbarui status.",
      );
    }
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
    <main className={`${pageShell} space-y-10`}>
      <PageHeader
        title="Konsultasi"
        description="Ajukan keluhan awal, pantau status, dan lanjut ke chat dengan fisioterapis."
      />

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {user.role === "PATIENT" && (
        <section className={`${cardSurface} space-y-4`}>
          <h2 className="text-lg font-semibold text-slate-900">
            Ajukan konsultasi baru
          </h2>
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
                  </option>
                ))}
              </select>
            </div>
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
            {rows.map((c) => (
              <li
                key={c.id}
                className={`${cardSurface} flex flex-col gap-3 md:flex-row md:justify-between md:items-start`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-500">
                    {new Date(c.createdAt).toLocaleString("id-ID")} ·{" "}
                    <span className="font-semibold text-slate-900">
                      {c.status}
                    </span>
                  </p>
                  <p className="mt-2 text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {c.complaint}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0 md:justify-end">
                  <button
                    type="button"
                    onClick={() => void openChat(c.id)}
                    className="inline-flex items-center rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-teal-100/80 transition-colors"
                  >
                    Chat
                  </button>
                  {user.role === "PATIENT" &&
                    !["CANCELLED", "COMPLETED", "REJECTED"].includes(
                      c.status,
                    ) && (
                      <button
                        type="button"
                        onClick={() =>
                          void patchStatus(c.id, "CANCELLED")
                        }
                        className={btnOutline}
                      >
                        Batalkan
                      </button>
                    )}
                  {user.role === "PHYSIOTHERAPIST" && c.status === "REQUESTED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => void patchStatus(c.id, "ACCEPTED")}
                        className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-100/80 transition-colors"
                      >
                        Terima
                      </button>
                      <button
                        type="button"
                        onClick={() => void patchStatus(c.id, "REJECTED")}
                        className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-900 hover:bg-red-100/80 transition-colors"
                      >
                        Tolak
                      </button>
                    </>
                  )}
                  {user.role === "PHYSIOTHERAPIST" &&
                    c.status === "ACCEPTED" && (
                      <button
                        type="button"
                        onClick={() => void patchStatus(c.id, "COMPLETED")}
                        className={`${btnOutline} bg-slate-50`}
                      >
                        Selesai
                      </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
