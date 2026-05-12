"use client";

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
import Link from "next/link";
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
    return (
      <main className="max-w-4xl mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6 text-center space-y-4">
        <p>Silakan masuk untuk melihat konsultasi.</p>
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-16 px-6 space-y-10">
      <h1 className="text-3xl font-bold">Konsultasi</h1>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
          {error}
        </p>
      )}

      {user.role === "PATIENT" && (
        <section className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Ajukan konsultasi baru</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Fisioterapis
              </label>
              <select
                required
                className="border rounded w-full p-3"
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
              <label className="block text-sm font-medium mb-1">
                Keluhan (min. 10 karakter)
              </label>
              <textarea
                required
                minLength={10}
                className="border rounded w-full p-3 min-h-[120px]"
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || loading}
              className="bg-teal-500 text-white px-6 py-2 rounded disabled:opacity-60"
            >
              {submitting ? "Mengirim…" : "Kirim"}
            </button>
          </form>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Daftar konsultasi</h2>
        {loading ? (
          <p className="text-gray-600">Memuat…</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-600">Belum ada konsultasi.</p>
        ) : (
          <ul className="space-y-4">
            {rows.map((c) => (
              <li
                key={c.id}
                className="border rounded-lg p-4 flex flex-col gap-3 md:flex-row md:justify-between md:items-start"
              >
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(c.createdAt).toLocaleString()} ·{" "}
                    <span className="font-medium text-gray-800">{c.status}</span>
                  </p>
                  <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                    {c.complaint}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => void openChat(c.id)}
                    className="text-sm bg-teal-50 text-teal-800 px-3 py-1.5 rounded border border-teal-200"
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
                        className="text-sm border px-3 py-1.5 rounded"
                      >
                        Batalkan
                      </button>
                    )}
                  {user.role === "PHYSIOTHERAPIST" && c.status === "REQUESTED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => void patchStatus(c.id, "ACCEPTED")}
                        className="text-sm bg-green-50 text-green-800 px-3 py-1.5 rounded border border-green-200"
                      >
                        Terima
                      </button>
                      <button
                        type="button"
                        onClick={() => void patchStatus(c.id, "REJECTED")}
                        className="text-sm bg-red-50 text-red-800 px-3 py-1.5 rounded border border-red-200"
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
                        className="text-sm bg-gray-100 px-3 py-1.5 rounded border"
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
