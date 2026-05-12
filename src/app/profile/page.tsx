"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import type { UserProfile } from "@/lib/api/types";
import { getMyProfile, updateMyProfile } from "@/lib/api/users";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, isReady, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMyProfile()
      .then((p) => {
        if (!cancelled) {
          setProfile(p);
          setFullName(p.fullName);
          setPhoneNumber(p.phoneNumber ?? "");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : "Gagal memuat profil.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isReady, user]);

  if (!isReady) {
    return (
      <main className="max-w-4xl mx-auto py-20 px-6 text-center text-gray-600">
        Memuat…
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto py-20 px-6 text-center space-y-4">
        <p className="text-gray-700">Anda belum masuk.</p>
        <Link href="/login" className="text-teal-600 font-medium underline">
          Masuk
        </Link>
      </main>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedMsg(null);
    setError(null);
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
      });
      setProfile(updated);
      setSavedMsg("Perubahan disimpan.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal menyimpan.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-2">Profil</h1>
      <p className="text-gray-600 mb-6">
        {profile?.email ?? user.email} · {user.role}
      </p>

      {loading && <p className="text-gray-600">Memuat data profil…</p>}
      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3 mb-4">
          {error}
        </p>
      )}
      {savedMsg && (
        <p className="text-green-700 text-sm bg-green-50 border border-green-100 rounded p-3 mb-4">
          {savedMsg}
        </p>
      )}

      <form onSubmit={handleSave} className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama lengkap</label>
          <input
            required
            minLength={3}
            className="border rounded w-full p-3"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Nomor telepon
          </label>
          <input
            className="border rounded w-full p-3"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Opsional"
            disabled={loading}
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            disabled={saving || loading}
            className="bg-teal-500 text-white px-6 py-3 rounded disabled:opacity-60"
          >
            {saving ? "Menyimpan…" : "Simpan perubahan"}
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="border border-gray-300 px-6 py-3 rounded"
          >
            Keluar
          </button>
        </div>
      </form>
    </main>
  );
}
