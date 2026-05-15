import Link from "next/link";
import type { ReactNode } from "react";

/** Kontainer utama halaman konten (selaras dengan dashboard/admin). */
export const pageShell =
  "max-w-4xl mx-auto py-10 sm:py-14 px-4 sm:px-6 lg:px-8";

/** Lebar admin (ringkasan, verifikasi, moderasi); padding selaras `pageShell`. */
export const adminPageShell =
  "max-w-6xl mx-auto py-10 sm:py-14 px-4 sm:px-6 lg:px-8 space-y-8 pb-16";

export const cardSurface =
  "rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-6 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_8px_24px_rgb(15_23_42_/_0.06)] ring-1 ring-slate-900/[0.04] transition-shadow duration-200";

export const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60 disabled:bg-slate-50";

export const btnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 hover:bg-teal-500 active:scale-[0.98] active:bg-teal-700 disabled:pointer-events-none disabled:opacity-50 transition-[transform,colors,box-shadow] duration-150";

export const btnSecondary =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] disabled:opacity-50 transition-[transform,colors] duration-150";

export const btnDanger =
  "inline-flex items-center justify-center rounded-xl bg-red-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 transition-[transform,colors] duration-150";

export const btnOutline =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-[transform,colors] duration-150";

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
    <header className="space-y-2">
      {eyebrow ? (
        <p className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 ring-1 ring-teal-100">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
        {title}
      </h1>
      {description ? (
        <div className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed text-pretty">
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
      ? "border-red-200/90 bg-red-50/95 text-red-900 border-l-4 border-l-red-500"
      : "border-emerald-200/90 bg-emerald-50/95 text-emerald-900 border-l-4 border-l-emerald-500";
  return (
    <div
      role="alert"
      className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${styles} ${className}`}
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
    <main className={`${pageShell} text-center`}>
      <div className={`${cardSurface} mx-auto max-w-md space-y-5 py-10`}>
        <p className="text-slate-700 leading-relaxed">{message}</p>
        <Link href="/login" className={btnPrimary}>
          Masuk
        </Link>
      </div>
    </main>
  );
}

export function PageLoading({ label = "Memuat…" }: { label?: string }) {
  return (
    <main className={`${pageShell} text-slate-600`}>
      <div
        className={`${cardSurface} inline-flex items-center gap-3 px-5 py-4`}
      >
        <span
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
          aria-hidden
        />
        <span className="text-sm font-medium">{label}</span>
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
          <div className="h-4 w-28 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100" />
          <div className="h-3 w-full rounded-lg bg-slate-100" />
          <div className="h-3 w-[85%] rounded-lg bg-slate-100" />
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
      className={`${cardSurface} text-center py-12 px-4 sm:px-6`}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-100">
        <span className="text-xl" aria-hidden>
          ◇
        </span>
      </div>
      <p className="font-semibold text-slate-800">{title}</p>
      {hint ? (
        <div className="mt-2 text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
