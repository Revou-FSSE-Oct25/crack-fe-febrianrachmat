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
import { buildLoginHref, safeNextPath } from "@/lib/auth-next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

const roleCardBase =
  "flex min-h-[52px] cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-[border-color,background,box-shadow] duration-150";

function RoleOption({
  id,
  name,
  checked,
  onChange,
  title,
  description,
}: {
  id: string;
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
}) {
  return (
    <label
      htmlFor={id}
      className={`${roleCardBase} ${
        checked
          ? "border-teal-300 bg-teal-50/80 ring-2 ring-teal-500/20"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
      }`}
    >
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 shrink-0 border-slate-300 text-teal-600 focus:ring-teal-500"
      />
      <span>
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
          {description}
        </span>
      </span>
    </label>
  );
}

function RegisterPageContent() {
  const { register, user, isReady } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterRegisterPath = safeNextPath(searchParams.get("next")) ?? "/profile";
  const loginHref = buildLoginHref(afterRegisterPath);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<"PATIENT" | "PHYSIOTHERAPIST">("PATIENT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      router.replace(afterRegisterPath);
    }
  }, [isReady, user, router, afterRegisterPath]);

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
      router.push(afterRegisterPath);
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
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Akun baru
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Daftar
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Sudah punya akun?{" "}
            <Link
              href={loginHref}
              className="font-semibold text-teal-700 hover:text-teal-600 underline-offset-2 hover:underline"
            >
              Masuk
            </Link>
          </p>
        </div>

        <div className={`${cardSurface} p-8 sm:p-9`}>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div aria-live="polite">
              {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}
            </div>

            <fieldset className="space-y-3">
              <legend className={labelClass}>Jenis akun</legend>
              <div className="grid gap-3 sm:grid-cols-1">
                <RoleOption
                  id="role-patient"
                  name="role"
                  checked={role === "PATIENT"}
                  onChange={() => setRole("PATIENT")}
                  title="Pasien"
                  description="Booking kunjungan dan konsultasi dengan fisioterapis."
                />
                <RoleOption
                  id="role-physio"
                  name="role"
                  checked={role === "PHYSIOTHERAPIST"}
                  onChange={() => setRole("PHYSIOTHERAPIST")}
                  title="Fisioterapis"
                  description="Kelola jadwal, konsultasi, dan profil praktik Anda."
                />
              </div>
            </fieldset>

            <div>
              <label htmlFor="register-fullName" className={labelClass}>
                Nama lengkap
              </label>
              <input
                id="register-fullName"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputBase}
              />
            </div>

            <div>
              <label htmlFor="register-email" className={labelClass}>
                Email
              </label>
              <input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
              />
            </div>

            <div>
              <label htmlFor="register-phone" className={labelClass}>
                Nomor telepon <span className="font-normal text-slate-500">(opsional)</span>
              </label>
              <input
                id="register-phone"
                type="tel"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={inputBase}
              />
            </div>

            <div>
              <label htmlFor="register-password" className={labelClass}>
                Kata sandi
              </label>
              <input
                id="register-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputBase}
              />
              <p className="mt-1.5 text-xs text-slate-500">Minimal 8 karakter.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimary} w-full min-h-[48px] py-3`}
            >
              {loading ? "Memproses…" : "Daftar"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          Dengan mendaftar, Anda menyetujui ringkasan{" "}
          <Link href="/kebijakan" className="text-teal-700 font-medium hover:underline">
            kebijakan produk & demo
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <RegisterPageContent />
    </Suspense>
  );
}