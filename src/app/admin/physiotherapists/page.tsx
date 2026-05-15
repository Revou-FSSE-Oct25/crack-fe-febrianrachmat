"use client";

import {
  adminPageShell,
  adminScrollWrap,
  AdminBreadcrumb,
  AlertBanner,
  btnOutline,
  btnPrimary,
  cardSurface,
  EmptyState,
  inputBase,
  ListSkeleton,
  PageHeader,
  ConfirmDialog,
  PageLoading,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
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

const rejectBtn =
  "inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-800 shadow-sm hover:bg-red-50 active:scale-[0.98] disabled:opacity-50 transition-[transform,colors] duration-150";

export default function AdminPhysiotherapistsPage() {
  const { user, isReady } = useAuth();
  const toast = useToast();
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null);

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
      toast.success("Profil fisioterapis disetujui.");
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal menyetujui.",
      );
    } finally {
      setActionId(null);
    }
  }

  function requestReject(profileId: string) {
    const reason = (rejectReason[profileId] ?? "").trim();
    if (reason.length < 5) {
      setError("Alasan penolakan minimal 5 karakter.");
      return;
    }
    setError(null);
    setRejectConfirmId(profileId);
  }

  async function confirmReject() {
    if (!rejectConfirmId) return;
    const profileId = rejectConfirmId;
    const reason = (rejectReason[profileId] ?? "").trim();
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
      setRejectConfirmId(null);
      toast.success("Profil fisioterapis ditolak.");
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
    return <PageLoading label="Memuat antrian verifikasi…" />;
  }

  if (!user) {
    return (
      <SignInRequired message="Silakan masuk sebagai admin untuk memverifikasi fisioterapis." />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className={adminPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader
            eyebrow="Admin"
            title="Akses ditolak"
            description="Hanya admin yang dapat membuka halaman ini."
          />
          <Link
            href="/"
            className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            Kembali ke beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={adminPageShell}>
      <AdminBreadcrumb />

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow="Admin"
            title="Verifikasi fisioterapis"
            description="Tinjau profil yang menunggu persetujuan, lalu setujui atau tolak dengan alasan yang jelas."
          />
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className={`${btnOutline} min-h-[44px] shrink-0 px-5`}
        >
          Muat ulang
        </button>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <ListSkeleton rows={2} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Tidak ada profil PENDING"
          hint="Semua permohonan verifikasi sudah diproses, atau belum ada pendaftar fisioterapis baru."
          actions={[
            { href: "/admin/dashboard", label: "Kembali ke dashboard" },
            {
              href: "/register",
              label: "Halaman daftar (demo)",
              variant: "secondary",
            },
          ]}
        />
      ) : (
        <ul className="space-y-6">
          {rows.map((row) => (
            <li key={row.id} className={`${cardSurface} space-y-4`}>
              <div className="flex flex-wrap justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {row.user.fullName}
                  </h2>
                  <p className="text-sm text-slate-600">{row.user.email}</p>
                  {row.user.phoneNumber ? (
                    <p className="text-sm text-slate-600">{row.user.phoneNumber}</p>
                  ) : null}
                  {row.category ? (
                    <p className="text-sm mt-1 text-slate-700">
                      Kategori:{" "}
                      <span className="font-medium">{row.category.name}</span>
                    </p>
                  ) : null}
                </div>
                <span className="text-xs font-mono text-slate-400 break-all">
                  {row.id}
                </span>
              </div>

              {row.bio ? (
                <p className="text-sm text-slate-800 whitespace-pre-wrap border-l-2 border-teal-200 pl-3 leading-relaxed">
                  {row.bio}
                </p>
              ) : null}
              <dl className={`${adminScrollWrap} grid gap-2 text-sm sm:grid-cols-2 min-w-[16rem]`}>
                {row.licenseNumber ? (
                  <div>
                    <dt className="text-slate-500">Nomor lisensi</dt>
                    <dd className="text-slate-900">{row.licenseNumber}</dd>
                  </div>
                ) : null}
                {row.certificationUrl ? (
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">Sertifikasi</dt>
                    <dd>
                      <a
                        href={row.certificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 font-medium underline break-all"
                      >
                        {row.certificationUrl}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div className="flex flex-col gap-4 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={actionId === row.id}
                    onClick={() => void approve(row.id)}
                    className={`${btnPrimary} min-h-[44px]`}
                  >
                    Setujui
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-800">
                    Tolak — alasan (min. 5 karakter)
                  </label>
                  <textarea
                    className={`${inputBase} min-h-[80px] resize-y`}
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
                    onClick={() => requestReject(row.id)}
                    className={`${rejectBtn} min-h-[44px]`}
                  >
                    Tolak
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={rejectConfirmId !== null}
        title="Tolak verifikasi fisioterapis?"
        description="Profil akan ditandai ditolak dan alasan yang Anda tulis akan disimpan. Fisioterapis dapat memperbaiki dokumen dan mendaftar ulang sesuai alur produk."
        confirmLabel="Ya, tolak"
        cancelLabel="Tidak jadi"
        variant="danger"
        loading={rejectConfirmId !== null && actionId === rejectConfirmId}
        onConfirm={() => void confirmReject()}
        onCancel={() => {
          if (actionId === null) setRejectConfirmId(null);
        }}
      />
    </main>
  );
}
