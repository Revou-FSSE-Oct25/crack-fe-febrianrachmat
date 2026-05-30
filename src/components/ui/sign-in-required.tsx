"use client";

import {
  buildLoginHref,
  buildRegisterHref,
  currentReturnPath,
} from "@/lib/auth-next";
import { useLanguage } from "@/contexts/language-context";
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
  message,
  returnTo,
  showRegister = true,
}: {
  message?: string;
  returnTo?: string;
  showRegister?: boolean;
}) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const resolvedReturnTo = returnTo ?? currentReturnPath(pathname, search);
  const loginHref = buildLoginHref(resolvedReturnTo);
  const registerHref = buildRegisterHref(resolvedReturnTo);

  return (
    <main className={`${pageShell} text-center pb-16`}>
      <div className={`${cardSurface} mx-auto max-w-md space-y-5 py-10 px-6`}>
        <p className="text-slate-700 leading-relaxed">
          {message ?? t("ui.signInToContinue")}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={loginHref}
            className={`${btnPrimary} min-h-[44px] justify-center px-6`}
          >
            {t("ui.signIn")}
          </Link>
          {showRegister ? (
            <Link
              href={registerHref}
              className={`${btnSecondary} min-h-[44px] justify-center px-6`}
            >
              {t("ui.register")}
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function SignInRequiredFallback({ message }: { message?: string }) {
  const { t } = useLanguage();
  return (
    <main className={`${pageShell} text-center pb-16`}>
      <div className={`${cardSurface} mx-auto max-w-md space-y-5 py-10 px-6`}>
        <p className="text-slate-700 leading-relaxed">
          {message ?? t("ui.signInToContinue")}
        </p>
        <Link
          href="/login"
          className={`${btnPrimary} min-h-[44px] justify-center px-6`}
        >
          {t("ui.signIn")}
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
