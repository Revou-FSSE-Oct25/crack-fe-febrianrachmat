"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const pill =
  "inline-flex items-center rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200/90 shadow-sm hover:bg-teal-50 hover:text-teal-900 hover:ring-teal-200/90 hover:shadow transition-[box-shadow,colors] duration-150 active:scale-[0.98]";

const pillAdmin =
  "inline-flex items-center rounded-full bg-teal-50/95 px-3 py-1.5 text-sm font-medium text-teal-900 ring-1 ring-teal-200/80 shadow-sm hover:bg-teal-100 hover:ring-teal-300/60 transition-[box-shadow,colors] duration-150 active:scale-[0.98]";

const pillPrimary =
  "inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-teal-900/20 hover:bg-teal-500 active:scale-[0.98] transition-[transform,colors,box-shadow] duration-150";

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5 pl-0.5">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function AppShortcutBar() {
  const { user, isReady } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (!isReady) {
    if (isHome) return null;
    return (
      <div
        className="border-b border-slate-200/80 bg-white/60 backdrop-blur-md"
        aria-hidden
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="h-9 max-w-md rounded-full bg-gradient-to-r from-slate-100 to-slate-50 animate-pulse ring-1 ring-slate-200/60" />
        </div>
      </div>
    );
  }

  if (!user) {
    if (isHome) return null;
    return (
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50/95 via-white to-teal-50/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-600 leading-snug">
            Siap konsultasi atau booking sesi fisioterapi?
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/appointment" className={pillPrimary}>
              Buat janji temu
            </Link>
            <Link href="/therapists" className={pill}>
              Cari fisioterapis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";
  const isPt = user.role === "PHYSIOTHERAPIST";

  const showTherapistsList = user.role === "PATIENT" || isAdmin;
  const showTransactions = user.role === "PATIENT" || isAdmin;
  const showBookingCTA = user.role === "PATIENT";

  return (
    <div className="border-b border-slate-200/80 bg-white/85 backdrop-blur-md shadow-[0_6px_24px_rgb(15_23_42_/_0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-600 truncate" title={user.fullName}>
            Halo,{" "}
            <span className="font-semibold text-slate-800">{user.fullName}</span>
          </p>
          {showBookingCTA ? (
            <Link
              href="/appointment"
              className={`${pillPrimary} sm:w-auto w-full text-center`}
            >
              Booking / janji baru
            </Link>
          ) : isAdmin ? (
            <Link
              href="/admin/dashboard"
              className={`${pillPrimary} sm:w-auto w-full text-center`}
            >
              Dashboard admin
            </Link>
          ) : isPt ? (
            <Link
              href="/physiotherapist/availability"
              className={`${pillPrimary} sm:w-auto w-full text-center`}
            >
              Kelola jadwal
            </Link>
          ) : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isAdmin && (
            <Section title="Admin">
              <Link href="/admin/dashboard" className={pillAdmin}>
                Dashboard
              </Link>
              <Link href="/admin/physiotherapists" className={pillAdmin}>
                Verifikasi PT
              </Link>
              <Link href="/admin/categories" className={pillAdmin}>
                Kategori
              </Link>
              <Link href="/admin/reviews" className={pillAdmin}>
                Ulasan
              </Link>
              <Link href="/admin/notifications" className={pillAdmin}>
                Broadcast
              </Link>
            </Section>
          )}

          <Section title="Aktivitas">
            <Link href="/consultations" className={pill}>
              Konsultasi
            </Link>
            <Link href="/bookings" className={pill}>
              Daftar booking
            </Link>
            {showTransactions && (
              <Link href="/transactions" className={pill}>
                Transaksi
              </Link>
            )}
            <Link href="/notifications" className={pill}>
              Notifikasi
            </Link>
            <Link href="/chat" className={pill}>
              Chat
            </Link>
          </Section>

          <Section title="Untuk Anda">
            {showTherapistsList && (
              <Link href="/therapists" className={pill}>
                Fisioterapis
              </Link>
            )}
            {user.role === "PATIENT" && (
              <Link href="/reviews/write" className={pill}>
                Tulis ulasan
              </Link>
            )}
            {isPt && (
              <>
                <Link href="/physiotherapist/profile" className={pill}>
                  Profil PT
                </Link>
                <Link href="/physiotherapist/availability" className={pill}>
                  Jadwal slot
                </Link>
              </>
            )}
            <Link href="/profile" className={pill}>
              Profil saya
            </Link>
          </Section>

          <Section title="Cepat">
            {showBookingCTA && (
              <Link href="/appointment" className={pill}>
                Form janji temu
              </Link>
            )}
            <Link href="/services" className={pill}>
              Layanan
            </Link>
          </Section>
        </div>
      </div>
    </div>
  );
}
