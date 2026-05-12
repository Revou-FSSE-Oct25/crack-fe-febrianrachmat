"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import type { ReactNode } from "react";

const pill =
  "inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200/80 hover:bg-teal-50 hover:text-teal-900 hover:ring-teal-200 transition-colors";

const pillAdmin =
  "inline-flex items-center rounded-full bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-900 ring-1 ring-teal-100 hover:bg-teal-100 transition-colors";

const pillPrimary =
  "inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-teal-900/15 hover:bg-teal-500 transition-colors";

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function AppShortcutBar() {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return (
      <div
        className="border-b border-slate-200 bg-white"
        aria-hidden
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="h-9 max-w-md rounded-full bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-teal-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-600">
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
  const isPatient = user.role === "PATIENT";
  const isPt = user.role === "PHYSIOTHERAPIST";

  // Tampilkan chip per-role sesuai endpoint yang benar-benar berlaku di BE:
  // - "Transaksi" hanya untuk PATIENT + ADMIN (PT tidak punya akses).
  // - "Booking / janji baru" + "Form janji temu" hanya untuk PATIENT (hanya pasien
  //   yang bisa membuat booking di /appointment).
  // - "Fisioterapis" (daftar) untuk PATIENT + ADMIN.
  const showTherapistsList = isPatient || isAdmin;
  const showTransactions = isPatient || isAdmin;
  const showBookingCTA = isPatient;

  return (
    <div className="border-b border-slate-200 bg-white shadow-sm shadow-slate-900/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-600 truncate" title={user.fullName}>
            Halo, <span className="font-semibold text-slate-800">{user.fullName}</span>
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
            {isPatient && (
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
