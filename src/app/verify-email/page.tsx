"use client";

import { verifyEmail } from "@/lib/api/email-verification";
import { ApiRequestError } from "@/lib/api/client";
import { buildLoginHref } from "@/lib/auth-next";
import {
  AlertBanner,
  btnPrimary,
  cardSurface,
  PageLoading,
  pageShell,
} from "@/components/ui/page-shell";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const handled = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (handled.current) return;
    if (!token) {
      queueMicrotask(() => {
        setStatus("error");
        setMessage("Link verifikasi tidak valid.");
      });
      return;
    }

    handled.current = true;
    void verifyEmail(token)
      .then((result) => {
        setVerifiedEmail(result.email);
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err instanceof ApiRequestError
            ? err.message
            : "Verifikasi gagal. Minta link baru.",
        );
      });
  }, [token]);

  const loginHref = buildLoginHref("/profile");

  if (status === "loading") {
    return <PageLoading />;
  }

  return (
    <main
      className={`${pageShell} flex min-h-[calc(100vh-12rem)] items-center justify-center py-12`}
    >
      <div className={`${cardSurface} w-full max-w-md p-8 text-center space-y-5`}>
        {status === "success" ? (
          <>
            <AlertBanner variant="success">
              Email {verifiedEmail ?? ""} berhasil diverifikasi.
            </AlertBanner>
            <Link href={loginHref} className={`${btnPrimary} inline-flex w-full justify-center`}>
              Masuk sekarang
            </Link>
          </>
        ) : (
          <>
            <AlertBanner variant="error">{message}</AlertBanner>
            <Link
              href="/verify-email/sent"
              className="text-sm font-semibold text-teal-700 hover:underline"
            >
              Kirim ulang link verifikasi
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
