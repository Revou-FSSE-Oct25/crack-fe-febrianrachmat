"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

export default function Navbar() {
  const { user, isReady, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center px-8 py-4 shadow bg-white">
      <h1 className="text-2xl font-bold text-teal-600">Kinova</h1>

      <div className="flex gap-6 items-center flex-wrap justify-end">
        <Link href="/">Beranda</Link>
        <Link href="/services">Layanan</Link>
        <Link href="/about">Tentang</Link>

        {isReady && user ? (
          <>
            {user.role === "ADMIN" && (
              <>
                <Link
                  href="/admin/dashboard"
                  className="font-semibold text-teal-700"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/physiotherapists"
                  className="font-semibold text-teal-700"
                >
                  Verifikasi
                </Link>
                <Link
                  href="/admin/categories"
                  className="font-semibold text-teal-700"
                >
                  Kategori
                </Link>
                <Link
                  href="/admin/reviews"
                  className="font-semibold text-teal-700"
                >
                  Ulasan
                </Link>
                <Link
                  href="/admin/notifications"
                  className="font-semibold text-teal-700"
                >
                  Broadcast
                </Link>
              </>
            )}
            {(user.role === "PATIENT" || user.role === "ADMIN") && (
              <Link href="/therapists">Fisioterapis</Link>
            )}
            {user.role === "PATIENT" && (
              <Link href="/reviews/write">Ulasan</Link>
            )}
            {user.role === "PHYSIOTHERAPIST" && (
              <>
                <Link href="/physiotherapist/profile">Profil PT</Link>
                <Link href="/physiotherapist/availability">Jadwal</Link>
              </>
            )}
            <Link href="/consultations">Konsultasi</Link>
            <Link href="/bookings">Booking</Link>
            <Link href="/transactions">Transaksi</Link>
            <Link href="/notifications">Notifikasi</Link>
            <Link href="/chat">Chat</Link>
            <Link href="/profile">Profil</Link>
            <span className="text-sm text-gray-600 max-w-[140px] truncate">
              {user.fullName}
            </span>
            <button
              type="button"
              onClick={() => logout()}
              className="text-sm text-gray-700 underline"
            >
              Keluar
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Masuk</Link>
            <Link href="/register">Daftar</Link>
          </>
        )}

        <Link
          href="/appointment"
          className="bg-teal-500 text-white px-4 py-2 rounded-lg"
        >
          Booking
        </Link>
      </div>
    </nav>
  );
}
