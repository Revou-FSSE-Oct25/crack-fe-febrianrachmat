"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  AlertBanner,
  btnPrimary,
  cardSurface,
  inputBase,
  PageLoading,
  pageShell,
} from "@/components/ui/page-shell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export default function RegisterPage() {
  const { register, user, isReady } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<"PATIENT" | "PHYSIOTHERAPIST">("PATIENT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      router.replace("/profile");
    }
  }, [isReady, user, router]);

  if (!isReady) {
    return <PageLoading />;
  }

  if (user) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim() || undefined,
        role,
      });
      router.push("/profile");
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : "Pendaftaran gagal. Coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className={`${pageShell} flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center py-10 sm:py-14 pb-16`}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Akun baru
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Daftar
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-teal-700 hover:text-teal-600 underline-offset-2 hover:underline"
            >
              Masuk
            </Link>
          </p>
        </div>

        <div className={`${cardSurface} p-8 sm:p-9`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}
            <div>
              <label htmlFor="reg-name" className={labelClass}>
                Nama lengkap
              </label>
              <input
                id="reg-name"
                required
                minLength={3}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="reg-email" className={labelClass}>
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="reg-password" className={labelClass}>
                Kata sandi
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="reg-phone" className={labelClass}>
                Nomor telepon (opsional)
              </label>
              <input
                id="reg-phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="reg-role" className={labelClass}>
                Peran
              </label>
              <select
                id="reg-role"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "PATIENT" | "PHYSIOTHERAPIST")
                }
                className={inputBase}
              >
                <option value="PATIENT">Pasien</option>
                <option value="PHYSIOTHERAPIST">Fisioterapis</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimary} w-full py-3`}
            >
              {loading ? "Memproses…" : "Daftar"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          Lihat{" "}
          <Link href="/kebijakan" className="text-teal-700 font-medium hover:underline">
            kebijakan produk & demo
          </Link>{" "}
          sebelum menggunakan akun demo.
        </p>
      </div>
    </main>
  );
}
