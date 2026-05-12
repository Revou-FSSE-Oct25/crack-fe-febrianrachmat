"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  broadcastNotification,
  sendNotificationToUser,
} from "@/lib/api/notifications";
import Link from "next/link";
import { useState } from "react";

export default function AdminNotificationsPage() {
  const { user, isReady } = useAuth();

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const [userId, setUserId] = useState("");
  const [userTitle, setUserTitle] = useState("");
  const [userBody, setUserBody] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setSuccess(null);
    try {
      await broadcastNotification({ title, body });
      setSuccess("Broadcast notifikasi berhasil dikirim.");
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
    setSuccess(null);
    try {
      await sendNotificationToUser(uid, { title, body });
      setSuccess("Notifikasi ke user berhasil dikirim.");
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
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-center space-y-4">
        <p>Silakan masuk sebagai admin.</p>
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 space-y-4">
        <h1 className="text-2xl font-bold">Akses ditolak</h1>
        <p className="text-gray-700">Hanya untuk admin.</p>
        <Link href="/" className="text-teal-600 underline">
          Beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-12 px-6 space-y-8">
      <div>
        <Link
          href="/admin/dashboard"
          className="text-sm text-teal-700 hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-2">Notifikasi admin</h1>
        <p className="text-sm text-gray-600 mt-1">
          Endpoint: <code className="text-xs bg-gray-100 px-1 rounded">POST /admin/notifications/users/:userId</code> dan{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">POST /admin/notifications/broadcast</code>.
        </p>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-800 text-sm bg-green-50 border border-green-100 rounded p-3">
          {success}
        </p>
      )}

      <section className="border rounded-xl p-6 bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Broadcast ke semua user aktif</h2>
        <form onSubmit={handleBroadcast} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Judul</label>
            <input
              className="border rounded-lg w-full p-3"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Isi</label>
            <textarea
              className="border rounded-lg w-full p-3 min-h-[90px]"
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <button
            type="submit"
            disabled={broadcastLoading}
            className="bg-teal-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {broadcastLoading ? "Mengirim…" : "Kirim broadcast"}
          </button>
        </form>
      </section>

      <section className="border rounded-xl p-6 bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Kirim ke user tertentu</h2>
        <form onSubmit={handleSendToUser} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <input
              className="border rounded-lg w-full p-3 font-mono text-sm"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="UUID user target"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Judul</label>
            <input
              className="border rounded-lg w-full p-3"
              value={userTitle}
              onChange={(e) => setUserTitle(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Isi</label>
            <textarea
              className="border rounded-lg w-full p-3 min-h-[90px]"
              value={userBody}
              onChange={(e) => setUserBody(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <button
            type="submit"
            disabled={sendLoading}
            className="bg-teal-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {sendLoading ? "Mengirim…" : "Kirim ke user"}
          </button>
        </form>
      </section>
    </main>
  );
}
