"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  IconArrowRightEndOnRectangle,
  IconArrowRightOnRectangle,
  IconUserCircle,
} from "@/components/nav-icons";
import Link from "next/link";

const navLink =
  "text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors";

const iconBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 ring-1 ring-slate-200/90 bg-white hover:bg-teal-50 hover:text-teal-800 hover:ring-teal-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600";

const iconBtnDanger =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 ring-1 ring-slate-200/90 bg-white hover:bg-red-50 hover:text-red-700 hover:ring-red-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500";

export default function Navbar() {
  const { user, isReady, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm shadow-slate-900/5">
      <nav className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 sm:px-6 lg:px-8 py-3">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-teal-700 hover:text-teal-600 transition-colors shrink-0"
        >
          Kinova
        </Link>

        <div className="flex flex-1 min-w-0 items-center justify-center gap-6 sm:gap-8">
          <Link href="/" className={navLink}>
            Beranda
          </Link>
          <Link href="/services" className={navLink}>
            Layanan
          </Link>
          <Link href="/about" className={navLink}>
            Tentang
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          {!isReady ? (
            <>
              <span className="inline-flex h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
              <span className="inline-flex h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
            </>
          ) : user ? (
            <>
              <Link
                href="/profile"
                className={iconBtn}
                aria-label="Profil"
                title="Profil"
              >
                <IconUserCircle />
                <span className="sr-only">Profil</span>
              </Link>
              <button
                type="button"
                className={iconBtnDanger}
                onClick={() => logout()}
                aria-label="Keluar"
                title="Keluar"
              >
                <IconArrowRightOnRectangle />
                <span className="sr-only">Keluar</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={iconBtn}
              aria-label="Masuk"
              title="Masuk"
            >
              <IconArrowRightEndOnRectangle />
              <span className="sr-only">Masuk</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
