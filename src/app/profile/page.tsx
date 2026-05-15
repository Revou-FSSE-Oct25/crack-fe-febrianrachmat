"use client";

import {
  AlertBanner,
  btnOutline,
  btnPrimary,
  btnSecondary,
  cardSurface,
  inputBase,
  PageHeader,
  PageLoading,
  widePageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  validateChangePassword,
  validateProfileUpdate,
} from "@/lib/validation";
import type { UserProfile } from "@/lib/api/types";
import {
  changePassword,
  getMyProfile,
  updateMyProfile,
} from "@/lib/api/users";
import Link from "next/link";
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
  const toast = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

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

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    setError(null);
    const validation = validateChangePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    setChangingPassword(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg(res.message || "Password berhasil diubah.");
      toast.success("Password berhasil diubah.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal mengubah password.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedMsg(null);
    setError(null);
    const validation = validateProfileUpdate({ fullName, phoneNumber });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
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
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/bookings"
            className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[9rem]`}
          >
            Booking
          </Link>
          <Link
            href="/transactions"
            className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[9rem]`}
          >
            Transaksi
          </Link>
          {user.role === "PATIENT" ? (
            <Link
              href="/reviews"
              className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[9rem]`}
            >
              Ulasan saya
            </Link>
          ) : null}
          {user.role === "ADMIN" ? (
            <Link
              href="/admin/dashboard"
              className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[10rem]`}
            >
              Dashboard admin
            </Link>
          ) : user.role === "PHYSIOTHERAPIST" ? (
            <Link
              href="/physiotherapist/profile"
              className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[11rem]`}
            >
              Profil fisioterapis
            </Link>
          ) : null}
        </div>
      </div>

      {loading && !profile ? (
        <div className={`${cardSurface} mx-auto max-w-lg animate-pulse space-y-4`}>
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="h-10 rounded-xl bg-slate-100" />
        </div>
      ) : (
        <>
          {error ? (
            <AlertBanner variant="error" className="max-w-lg mx-auto">
              {error}
            </AlertBanner>
          ) : null}
          {savedMsg ? (
            <AlertBanner variant="success" className="max-w-lg mx-auto">
              {savedMsg}
            </AlertBanner>
          ) : null}
          {passwordMsg ? (
            <AlertBanner variant="success" className="max-w-lg mx-auto">
              {passwordMsg}
            </AlertBanner>
          ) : null}

          <form
            onSubmit={handleSave}
            className={`${cardSurface} mx-auto max-w-lg space-y-6`}
          >
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5">
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                Data diri
              </h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Nama tampil dan kontak opsional. Email tidak dapat diubah di sini.
              </p>
              <div className="mt-4 space-y-4">
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
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap">
              <button
                type="submit"
                disabled={saving || loading}
                className={`${btnPrimary} min-h-[44px] justify-center sm:min-w-[10rem]`}
              >
                {saving ? "Menyimpan…" : "Simpan perubahan"}
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className={`${btnSecondary} min-h-[44px] justify-center sm:min-w-[8rem]`}
              >
                Keluar
              </button>
            </div>
          </form>

          <form
            onSubmit={handleChangePassword}
            className={`${cardSurface} mx-auto max-w-lg space-y-6`}
          >
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5">
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                Ubah password
              </h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Password baru minimal 8 karakter. Anda perlu memasukkan password
                saat ini.
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    Password saat ini
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="current-password"
                    className={inputBase}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={changingPassword}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    Password baru
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={inputBase}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={changingPassword}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    Konfirmasi password baru
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={inputBase}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={changingPassword}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
              <button
                type="submit"
                disabled={changingPassword}
                className={`${btnOutline} min-h-[44px] justify-center sm:min-w-[10rem]`}
              >
                {changingPassword ? "Menyimpan…" : "Ubah password"}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
