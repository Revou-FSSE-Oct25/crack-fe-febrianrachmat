"use client";

import {
  AlertBanner,
  btnPrimary,
  btnSecondary,
  cardSurface,
  inputBase,
  PageHeader,
  PageLoading,
  pageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import type { UserProfile } from "@/lib/api/types";
import { getMyProfile, updateMyProfile } from "@/lib/api/users";
import { useEffect, useState } from "react";

function roleLabel(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "PATIENT":
      return "Pasien";
    case "PHYSIOTHERAPIST":
      return "Fisioterapis";
    default:
      return role;
  }
}

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
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message="Anda belum masuk." />;
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
    <main className={`${pageShell} space-y-8`}>
      <PageHeader
        eyebrow="Akun"
        title="Profil"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-slate-600">
              {profile?.email ?? user.email}
            </span>
            <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-900 ring-1 ring-teal-100">
              {roleLabel(user.role)}
            </span>
          </span>
        }
      />

      {loading && !profile ? (
        <div className={`${cardSurface} animate-pulse space-y-4 max-w-lg`}>
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="h-10 rounded-xl bg-slate-100" />
        </div>
      ) : (
        <>
          {error ? (
            <AlertBanner variant="error" className="max-w-lg">
              {error}
            </AlertBanner>
          ) : null}
          {savedMsg ? (
            <AlertBanner variant="success" className="max-w-lg">
              {savedMsg}
            </AlertBanner>
          ) : null}

          <form
            onSubmit={handleSave}
            className={`${cardSurface} max-w-lg space-y-4`}
          >
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Nama lengkap
              </label>
              <input
                required
                minLength={3}
                className={inputBase}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Nomor telepon
              </label>
              <input
                className={inputBase}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Opsional"
                disabled={loading}
              />
            </div>
            <div className="flex gap-3 flex-wrap pt-2">
              <button
                type="submit"
                disabled={saving || loading}
                className={btnPrimary}
              >
                {saving ? "Menyimpan…" : "Simpan perubahan"}
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className={btnSecondary}
              >
                Keluar
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
