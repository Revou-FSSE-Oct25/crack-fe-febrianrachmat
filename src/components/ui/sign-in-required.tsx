"use client";

import {
  buildLoginHref,
  buildRegisterHref,
  currentReturnPath,
} from "@/lib/auth-next";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const pageShell =
  "max-w-4xl mx-auto py-10 sm:py-14 px-4 sm:px-6 lg:px-8";
const cardSurface =
  "rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-6 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_8px_24px_rgb(15_23_42_/_0.06)] ring-1 ring-slate-900/[0.04]";
const btnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 hover:bg-teal-500 active:scale-[0.98] active:bg-teal-700 disabled:pointer-events-none disabled:opacity-50 transition-[transform,colors,box-shadow] duration-150";
const btnSecondary =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] disabled:opacity-50 transition-[transform,colors] duration-150";

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
