"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { FieldError, inputWithFieldError } from "@/components/ui/field-error";
import { PasswordInput } from "@/components/ui/password-input";
import {
  AlertBanner,
  btnPrimary,
  cardSurface,
  labelClass,
  PageLoading,
  pageShell,
} from "@/components/ui/page-shell";
import type { FieldErrors } from "@/lib/validation";
import { clearFieldError } from "@/lib/validation/form-helpers";
import { validateRegister } from "@/lib/validation";
import { buildLoginHref, safeNextPath } from "@/lib/auth-next";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

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
          ? "border-teal-300 bg-teal-50/80 ring-2 ring-teal-500/20 dark:border-teal-600 dark:bg-teal-950/50 dark:ring-teal-500/30"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500 dark:hover:bg-slate-700/80"
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
  const { t } = useLanguage();
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
    const validation = validateRegister({
      fullName,
      email,
      password,
      phoneNumber,
    });
    if (!validation.ok) {
      setError(validation.message);
      setFieldErrors(validation.fieldErrors ?? {});
      return;
    }
    setFieldErrors({});
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
          : t("auth.register.error");
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
            {t("auth.register.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {t("auth.register.title")}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {t("auth.register.haveAccount")}{" "}
            <Link
              href={loginHref}
              className="font-semibold text-teal-700 hover:text-teal-600 underline-offset-2 hover:underline"
            >
              {t("auth.register.loginLink")}
            </Link>
          </p>
        </div>

        <div className={`${cardSurface} p-8 sm:p-9`}>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div aria-live="polite">
              {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}
            </div>

            <fieldset className="space-y-3">
              <legend className={labelClass}>{t("auth.register.accountType")}</legend>
              <div className="grid gap-3 sm:grid-cols-1">
                <RoleOption
                  id="role-patient"
                  name="role"
                  checked={role === "PATIENT"}
                  onChange={() => setRole("PATIENT")}
                  title={t("auth.register.patientTitle")}
                  description={t("auth.register.patientDesc")}
                />
                <RoleOption
                  id="role-physio"
                  name="role"
                  checked={role === "PHYSIOTHERAPIST"}
                  onChange={() => setRole("PHYSIOTHERAPIST")}
                  title={t("auth.register.physioTitle")}
                  description={t("auth.register.physioDesc")}
                />
              </div>
            </fieldset>

            <div>
              <label htmlFor="register-fullName" className={labelClass}>
                {t("auth.register.fullNameLabel")}
              </label>
              <input
                id="register-fullName"
                type="text"
                autoComplete="name"
                placeholder={t("auth.register.fullNamePlaceholder")}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearFieldError(setFieldErrors, "fullName");
                }}
                className={inputWithFieldError(Boolean(fieldErrors.fullName))}
                aria-invalid={Boolean(fieldErrors.fullName)}
              />
              <FieldError message={fieldErrors.fullName} />
            </div>

            <div>
              <label htmlFor="register-email" className={labelClass}>
                {t("auth.email.label")}
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.email.placeholder")}
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
              <label htmlFor="register-phone" className={labelClass}>
                {t("auth.register.phoneLabel")}{" "}
                <span className="font-normal text-slate-500">
                  {t("auth.register.phoneOptional")}
                </span>
              </label>
              <input
                id="register-phone"
                type="tel"
                autoComplete="tel"
                placeholder="08123456789"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  clearFieldError(setFieldErrors, "phoneNumber");
                }}
                className={inputWithFieldError(Boolean(fieldErrors.phoneNumber))}
                aria-invalid={Boolean(fieldErrors.phoneNumber)}
              />
              <FieldError message={fieldErrors.phoneNumber} />
            </div>

            <div>
              <label htmlFor="register-password" className={labelClass}>
                {t("auth.password.label")}
              </label>
              <PasswordInput
                id="register-password"
                autoComplete="new-password"
                placeholder={t("auth.register.passwordPlaceholder")}
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  clearFieldError(setFieldErrors, "password");
                }}
                hasError={Boolean(fieldErrors.password)}
                errorMessage={fieldErrors.password}
                hint={t("auth.register.passwordHint")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimary} w-full min-h-[48px] py-3`}
            >
              {loading ? t("auth.processing") : t("auth.register.submit")}
            </button>
          </form>
          <OAuthButtons role={role} nextPath={afterRegisterPath} />
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          {t("auth.register.termsPrefix")}{" "}
          <Link href="/kebijakan" className="text-teal-700 font-medium hover:underline">
            {t("auth.terms.policyLink")}
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


