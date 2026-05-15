"use client";

import {
  buildLoginHref,
  buildRegisterHref,
  currentReturnPath,
} from "@/lib/auth-next";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import {
  btnPrimary,
  btnSecondary,
  cardSurface,
  pageShell,
} from "@/components/ui/page-shell";

function SignInRequiredInner({
  message = "Silakan masuk untuk melanjutkan.",
  returnTo,
  showRegister = true,
}: {
  message?: string;
  returnTo?: string;
  showRegister?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const resolvedReturnTo = returnTo ?? currentReturnPath(pathname, search);
  const loginHref = buildLoginHref(resolvedReturnTo);
  const registerHref = buildRegisterHref(resolvedReturnTo);

  return (
    <main className={`${pageShell} text-center pb-16`}>
      <div className={`${cardSurface} mx-auto max-w-md space-y-5 py-10 px-6`}>
        <p className="text-slate-700 leading-relaxed">{message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={loginHref}
            className={`${btnPrimary} min-h-[44px] justify-center px-6`}
          >
            Masuk
          </Link>
          {showRegister ? (
            <Link
              href={registerHref}
              className={`${btnSecondary} min-h-[44px] justify-center px-6`}
            >
              Daftar
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function SignInRequiredFallback({ message }: { message?: string }) {
  return (
    <main className={`${pageShell} text-center pb-16`}>
      <div className={`${cardSurface} mx-auto max-w-md space-y-5 py-10 px-6`}>
        <p className="text-slate-700 leading-relaxed">{message}</p>
        <Link
          href="/login"
          className={`${btnPrimary} min-h-[44px] justify-center px-6`}
        >
          Masuk
        </Link>
      </div>
    </main>
  );
}

export function SignInRequired(props: {
  message?: string;
  returnTo?: string;
  showRegister?: boolean;
}) {
  return (
    <Suspense fallback={<SignInRequiredFallback message={props.message} />}>
      <SignInRequiredInner {...props} />
    </Suspense>
  );
}
