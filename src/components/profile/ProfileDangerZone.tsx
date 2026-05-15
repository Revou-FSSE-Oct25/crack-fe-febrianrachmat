"use client";

import {
  AlertBanner,
  btnOutline,
  cardSurface,
} from "@/components/ui/page-shell";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import { deactivateMyAccount } from "@/lib/api/users";
import { useRouter } from "next/navigation";
import { useState } from "react";

const labelClass = "block text-sm font-medium mb-1 text-slate-700";

type ProfileDangerZoneProps = {
  enabled: boolean;
};

export function ProfileDangerZone({ enabled }: ProfileDangerZoneProps) {
  const { logout } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!enabled) return null;

  async function handleDeactivate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (confirmText.trim().toUpperCase() !== "NONAKTIFKAN") {
      setError('Ketik "NONAKTIFKAN" untuk melanjutkan.');
      return;
    }
    if (password.length < 8) {
      setError("Masukkan password saat ini (min. 8 karakter).");
      return;
    }

    setLoading(true);
    try {
      const res = await deactivateMyAccount({ currentPassword: password });
      toast.success(res.message);
      logout();
      router.replace("/login");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal menonaktifkan akun.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleDeactivate}
      className={`${cardSurface} mx-auto max-w-lg space-y-4 border-red-100`}
    >
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-red-900">
          Zona berbahaya
        </h2>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
          Menonaktifkan akun akan menghentikan akses login. Hubungi admin untuk
          mengaktifkan kembali.
        </p>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      <div>
        <label htmlFor="deactivate-password" className={labelClass}>
          Password saat ini
        </label>
        <PasswordInput
          id="deactivate-password"
          value={password}
          onChange={setPassword}
          placeholder="Konfirmasi dengan password Anda"
          autoComplete="current-password"
        />
      </div>
      <div>
        <label htmlFor="deactivate-confirm" className={labelClass}>
          Ketik NONAKTIFKAN
        </label>
        <input
          id="deactivate-confirm"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="NONAKTIFKAN"
          autoComplete="off"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`${btnOutline} min-h-[44px] w-full justify-center border-red-200 text-red-800 hover:bg-red-50 sm:w-auto`}
      >
        {loading ? "Memproses…" : "Nonaktifkan akun saya"}
      </button>
    </form>
  );
}
