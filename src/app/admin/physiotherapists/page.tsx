"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  listPendingPhysiotherapists,
  verifyPhysiotherapist,
} from "@/lib/api/admin-physiotherapists";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type PendingRow = {
  id: string;
  bio: string | null;
  licenseNumber: string | null;
  certificationUrl: string | null;
  user: {
    fullName: string;
    email: string;
    phoneNumber: string | null;
  };
  category: { name: string } | null;
};

function asPendingRows(data: unknown): PendingRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    const user = r.user as Record<string, unknown> | undefined;
    const cat = r.category as Record<string, unknown> | null | undefined;
    return {
      id: String(r.id ?? ""),
      bio: r.bio != null ? String(r.bio) : null,
      licenseNumber: r.licenseNumber != null ? String(r.licenseNumber) : null,
      certificationUrl:
        r.certificationUrl != null ? String(r.certificationUrl) : null,
      user: {
        fullName: String(user?.fullName ?? ""),
        email: String(user?.email ?? ""),
        phoneNumber:
          user?.phoneNumber != null ? String(user.phoneNumber) : null,
      },
      category: cat ? { name: String(cat.name ?? "") } : null,
    };
  });
}

export default function AdminPhysiotherapistsPage() {
  const { user, isReady } = useAuth();
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listPendingPhysiotherapists();
      setRows(asPendingRows(list));
    } catch (err) {
      setRows([]);
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memuat daftar.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady || user?.role !== "ADMIN") return;
    void load();
  }, [isReady, user?.role, load]);

  async function approve(profileId: string) {
    setActionId(profileId);
    setError(null);
    try {
      await verifyPhysiotherapist(profileId, { status: "APPROVED" });
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal menyetujui.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function reject(profileId: string) {
    const reason = (rejectReason[profileId] ?? "").trim();
    if (reason.length < 5) {
      setError("Alasan penolakan minimal 5 karakter.");
      return;
    }
    setActionId(profileId);
    setError(null);
    try {
      await verifyPhysiotherapist(profileId, {
        status: "REJECTED",
        rejectionReason: reason,
      });
      setRejectReason((prev) => {
        const next = { ...prev };
        delete next[profileId];
        return next;
      });
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal menolak.",
      );
    } finally {
      setActionId(null);
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
        <p>Silakan masuk sebagai admin.</p>
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6 space-y-4">
        <h1 className="text-2xl font-bold">Akses ditolak</h1>
        <p className="text-gray-700">Hanya untuk admin.</p>
        <Link href="/" className="text-teal-600 underline">
          Beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-teal-700 hover:underline"
          >
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Verifikasi fisioterapis
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Daftar dari{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">
              GET /admin/physiotherapists/pending
            </code>
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="text-sm border px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Muat ulang
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Memuat…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-600 border rounded-lg p-8 text-center bg-gray-50">
          Tidak ada profil dengan status PENDING.
        </p>
      ) : (
        <ul className="space-y-8">
          {rows.map((row) => (
            <li
              key={row.id}
              className="border rounded-xl p-6 bg-white shadow-sm space-y-4"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {row.user.fullName}
                  </h2>
                  <p className="text-sm text-gray-600">{row.user.email}</p>
                  {row.user.phoneNumber && (
                    <p className="text-sm text-gray-600">{row.user.phoneNumber}</p>
                  )}
                  {row.category && (
                    <p className="text-sm mt-1">
                      Kategori:{" "}
                      <span className="font-medium">{row.category.name}</span>
                    </p>
                  )}
                </div>
                <span className="text-xs font-mono text-gray-400">{row.id}</span>
              </div>

              {row.bio && (
                <p className="text-sm text-gray-800 whitespace-pre-wrap border-l-2 border-teal-200 pl-3">
                  {row.bio}
                </p>
              )}
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                {row.licenseNumber && (
                  <div>
                    <dt className="text-gray-500">Nomor lisensi</dt>
                    <dd>{row.licenseNumber}</dd>
                  </div>
                )}
                {row.certificationUrl && (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">Sertifikasi</dt>
                    <dd>
                      <a
                        href={row.certificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 underline break-all"
                      >
                        {row.certificationUrl}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              <div className="flex flex-col gap-4 pt-2 border-t">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={actionId === row.id}
                    onClick={() => void approve(row.id)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    Setujui
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tolak — alasan (min. 5 karakter)
                  </label>
                  <textarea
                    className="w-full border rounded-lg p-3 text-sm min-h-[80px]"
                    placeholder="Contoh: Dokumen tidak lengkap."
                    value={rejectReason[row.id] ?? ""}
                    onChange={(e) =>
                      setRejectReason((prev) => ({
                        ...prev,
                        [row.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    disabled={actionId === row.id}
                    onClick={() => void reject(row.id)}
                    className="border border-red-300 text-red-800 px-4 py-2 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
