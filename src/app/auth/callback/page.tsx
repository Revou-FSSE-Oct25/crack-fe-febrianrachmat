"use client";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { AlertBanner, PageLoading, pageShell } from "@/components/ui/page-shell";
import { safeNextPath } from "@/lib/auth-next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function AuthCallbackContent() {
  const { completeOAuthLogin, user, isReady } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false);

  const accessToken = searchParams.get("accessToken");
  const oauthError = searchParams.get("error");
  const nextPath = safeNextPath(searchParams.get("next")) ?? "/profile";

  useEffect(() => {
    if (!isReady || handled.current) return;
    if (user) {
      router.replace(nextPath);
      return;
    }

    handled.current = true;

    if (oauthError) {
      return;
    }

    if (!accessToken) {
      return;
    }

    void completeOAuthLogin(accessToken)
      .then(() => {
        router.replace(nextPath);
      })
      .catch(() => {
        handled.current = false;
      });
  }, [
    isReady,
    user,
    accessToken,
    oauthError,
    nextPath,
    router,
    completeOAuthLogin,
  ]);

  if (!isReady) {
    return <PageLoading />;
  }

  if (user) {
    return null;
  }

  if (oauthError || !accessToken) {
    const message = oauthError ?? t("auth.callback.error");
    return (
      <main className={`${pageShell} flex min-h-[calc(100vh-12rem)] items-center justify-center py-12`}>
        <div className="w-full max-w-md space-y-4 text-center">
          <AlertBanner variant="error">{message}</AlertBanner>
          <Link
            href="/login"
            className="inline-block text-sm font-semibold text-teal-700 hover:underline"
          >
            {t("auth.callback.backToLogin")}
          </Link>
        </div>
      </main>
    );
  }

  return <PageLoading />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
