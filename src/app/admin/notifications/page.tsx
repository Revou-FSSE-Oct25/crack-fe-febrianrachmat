"use client";

import {
  adminPageShell,
  AdminBreadcrumb,
  AlertBanner,
  btnPrimary,
  cardSurface,
  inputBase,
  PageHeader,
  PageLoading,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  broadcastNotification,
  sendNotificationToUser,
} from "@/lib/api/notifications";
import Link from "next/link";
import { useState } from "react";

export default function AdminNotificationsPage() {
  const { user, isReady } = useAuth();
  const toast = useToast();

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const [userId, setUserId] = useState("");
  const [userTitle, setUserTitle] = useState("");
  const [userBody, setUserBody] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    const title = broadcastTitle.trim();
    const body = broadcastBody.trim();
    if (title.length < 3 || body.length < 3) {
      setError("Judul dan isi broadcast minimal 3 karakter.");
      return;
    }

    setBroadcastLoading(true);
    setError(null);
    try {
      await broadcastNotification({ title, body });
      toast.success("Broadcast notifikasi berhasil dikirim.");
      setBroadcastTitle("");
      setBroadcastBody("");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal broadcast.",
      );
    } finally {
      setBroadcastLoading(false);
    }
  }

  async function handleSendToUser(e: React.FormEvent) {
    e.preventDefault();
    const uid = userId.trim();
    const title = userTitle.trim();
    const body = userBody.trim();
    if (!uid) {
      setError("User ID wajib diisi.");
      return;
    }
    if (title.length < 3 || body.length < 3) {
      setError("Judul dan isi notifikasi minimal 3 karakter.");
      return;
    }

    setSendLoading(true);
    setError(null);
    try {
      await sendNotificationToUser(uid, { title, body });
      toast.success("Notifikasi ke user berhasil dikirim.");
      setUserTitle("");
      setUserBody("");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal mengirim notifikasi.",
      );
    } finally {
      setSendLoading(false);
    }
  }

  if (!isReady) {
    return <PageLoading label="Memuat…" />;
  }

  if (!user) {
    return (
      <SignInRequired message="Silakan masuk sebagai admin untuk mengirim notifikasi." />
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

      <PageHeader
        eyebrow="Admin"
        title="Notifikasi"
        description="Kirim broadcast ke semua pengguna aktif, atau kirim pesan sistem ke satu pengguna lewat ID penggunanya."
      />

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="text-lg font-semibold text-slate-900">
          Broadcast ke semua user aktif
        </h2>
        <form onSubmit={handleBroadcast} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Judul
            </label>
            <input
              className={inputBase}
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Isi
            </label>
            <textarea
              className={`${inputBase} min-h-[90px] resize-y`}
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <button
            type="submit"
            disabled={broadcastLoading}
            className={`${btnPrimary} min-h-[44px]`}
          >
            {broadcastLoading ? "Mengirim…" : "Kirim broadcast"}
          </button>
        </form>
      </section>

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="text-lg font-semibold text-slate-900">
          Kirim ke user tertentu
        </h2>
        <form onSubmit={handleSendToUser} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              User ID
            </label>
            <input
              className={`${inputBase} font-mono text-xs`}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="UUID user target"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Judul
            </label>
            <input
              className={inputBase}
              value={userTitle}
              onChange={(e) => setUserTitle(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Isi
            </label>
            <textarea
              className={`${inputBase} min-h-[90px] resize-y`}
              value={userBody}
              onChange={(e) => setUserBody(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <button type="submit" disabled={sendLoading} className={`${btnPrimary} min-h-[44px]`}>
            {sendLoading ? "Mengirim…" : "Kirim ke user"}
          </button>
        </form>
      </section>
    </main>
  );
}
