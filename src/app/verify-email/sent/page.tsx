"use client";

import { resendVerificationEmail } from "@/lib/api/email-verification";
import { ApiRequestError } from "@/lib/api/client";
import { buildLoginHref } from "@/lib/auth-next";
import {
  AlertBanner,
  btnPrimary,
  cardSurface,
  pageShell,
} from "@/components/ui/page-shell";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function VerifyEmailSentContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const result = await resendVerificationEmail(email.trim());
      setMessage(result.message);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal mengirim ulang email.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className={`${pageShell} flex min-h-[calc(100vh-12rem)] items-center justify-center py-12`}
    >
      <div className={`${cardSurface} w-full max-w-md p-8 space-y-5`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Periksa email Anda</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Kami mengirim link verifikasi. Buka email tersebut dan klik tautan
            sebelum masuk.
          </p>
        </div>
        {message ? <AlertBanner variant="success">{message}</AlertBanner> : null}
        {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}
        <form onSubmit={handleResend} className="space-y-4">
          <div>
            <label htmlFor="resend-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="resend-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              placeholder="nama@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`${btnPrimary} w-full min-h-[44px]`}
          >
            {loading ? "Mengirim…" : "Kirim ulang link"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-600">
          Sudah verifikasi?{" "}
          <Link href={buildLoginHref("/profile")} className="font-semibold text-teal-700 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense
      fallback={
        <main className={`${pageShell} flex min-h-[calc(100vh-12rem)] items-center justify-center`}>
          <p className="text-sm text-slate-600">Memuat…</p>
        </main>
      }
    >
      <VerifyEmailSentContent />
    </Suspense>
  );
}
