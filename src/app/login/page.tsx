"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { FieldError, inputWithFieldError } from "@/components/ui/field-error";
import { PasswordInput } from "@/components/ui/password-input";
import type { FieldErrors } from "@/lib/validation";
import { clearFieldError } from "@/lib/validation/form-helpers";
import { validateLogin } from "@/lib/validation";
import { buildRegisterHref, safeNextPath } from "@/lib/auth-next";
import {
  AlertBanner,
  btnPrimary,
  cardSurface,
  labelClass,
  PageLoading,
  pageShell,
} from "@/components/ui/page-shell";
import { DemoAccountPicker } from "@/components/auth/DemoAccountPicker";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginPageContent() {
  const { login, user, isReady } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const afterLoginPath = safeNextPath(searchParams.get("next")) ?? "/profile";
  const registerHref = buildRegisterHref(afterLoginPath);

  useEffect(() => {
    if (isReady && user) {
      router.replace(afterLoginPath);
    }
  }, [isReady, user, router, afterLoginPath]);

  if (!isReady) {
    return <PageLoading />;
  }

  if (user) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const validation = validateLogin({ email, password });
    if (!validation.ok) {
      setError(validation.message);
      setFieldErrors(validation.fieldErrors ?? {});
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.push(afterLoginPath);
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : "Login gagal. Periksa email dan kata sandi.";
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
            Selamat datang kembali
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Masuk
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Belum punya akun?{" "}
            <Link
              href={registerHref}
              className="font-semibold text-teal-700 hover:text-teal-600 underline-offset-2 hover:underline"
            >
              Daftar
            </Link>
          </p>
        </div>

        <div className={`${cardSurface} p-8 sm:p-9`}>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div aria-live="polite">
              {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}
            </div>
            <div>
              <label htmlFor="login-email" className={labelClass}>
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError(setFieldErrors, "email");
                }}
                className={inputWithFieldError(Boolean(fieldErrors.email))}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              <FieldError message={fieldErrors.email} />
            </div>
            <div>
              <label htmlFor="login-password" className={labelClass}>
                Kata sandi
              </label>
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                placeholder="Masukkan kata sandi Anda"
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  clearFieldError(setFieldErrors, "password");
                }}
                hasError={Boolean(fieldErrors.password)}
                errorMessage={fieldErrors.password}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimary} w-full min-h-[48px] py-3`}
            >
              {loading ? "Memproses…" : "Masuk"}
            </button>
          </form>
          <OAuthButtons nextPath={afterLoginPath} />
          <DemoAccountPicker
            onPick={(pickedEmail, pickedPassword) => {
              setEmail(pickedEmail);
              setPassword(pickedPassword);
              setError(null);
              setFieldErrors({});
            }}
          />
        </div>

        <p className="mt-6 text-center text-sm">
          <Link
            href="/demo"
            className="font-semibold text-teal-700 hover:underline dark:text-teal-300"
          >
            Panduan demo lengkap
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          Dengan masuk, Anda menyetujui ringkasan{" "}
          <Link href="/kebijakan" className="text-teal-700 font-medium hover:underline">
            kebijakan produk & demo
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}
