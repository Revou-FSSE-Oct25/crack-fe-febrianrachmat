import Link from "next/link";
import type { ReactNode } from "react";

/** Kontainer utama halaman konten (selaras dengan dashboard/admin). */
export const pageShell =
  "max-w-4xl mx-auto py-10 sm:py-12 px-4 sm:px-6 lg:px-8";

export const cardSurface =
  "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-900/5";

export const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60 disabled:bg-slate-50";

export const btnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-900/15 hover:bg-teal-500 disabled:opacity-50 transition-colors";

export const btnSecondary =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors";

export const btnDanger =
  "inline-flex items-center justify-center rounded-xl bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors";

export const btnOutline =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
}) {
  return (
    <header className="space-y-1">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h1>
      {description ? (
        <div className="text-slate-600 text-sm sm:text-base max-w-2xl">
          {description}
        </div>
      ) : null}
    </header>
  );
}

export function AlertBanner({
  variant,
  children,
  className = "",
}: {
  variant: "error" | "success";
  children: ReactNode;
  className?: string;
}) {
  const styles =
    variant === "error"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-emerald-200 bg-emerald-50 text-emerald-900";
  return (
    <div
      role="alert"
      className={`rounded-xl border px-4 py-3 text-sm ${styles} ${className}`}
    >
      {children}
    </div>
  );
}

export function SignInRequired({
  message = "Silakan masuk untuk melanjutkan.",
}: {
  message?: string;
}) {
  return (
    <main className={`${pageShell} text-center space-y-4`}>
      <p className="text-slate-700">{message}</p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-colors"
      >
        Masuk
      </Link>
    </main>
  );
}

export function PageLoading({ label = "Memuat…" }: { label?: string }) {
  return (
    <main className={`${pageShell} text-slate-600`}>
      <div className="flex items-center gap-3">
        <span
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
          aria-hidden
        />
        <span>{label}</span>
      </div>
    </main>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="space-y-4" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className={`${cardSurface} animate-pulse space-y-3`}
        >
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-[85%] rounded bg-slate-100" />
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: ReactNode;
}) {
  return (
    <div
      className={`${cardSurface} text-center py-10 px-4`}
    >
      <p className="font-medium text-slate-800">{title}</p>
      {hint ? (
        <div className="mt-2 text-sm text-slate-600">{hint}</div>
      ) : null}
    </div>
  );
}
