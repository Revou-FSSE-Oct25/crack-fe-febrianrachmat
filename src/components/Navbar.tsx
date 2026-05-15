"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  IconArrowRightEndOnRectangle,
  IconArrowRightOnRectangle,
  IconUserCircle,
} from "@/components/nav-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const iconBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 ring-1 ring-slate-200/90 bg-white/90 backdrop-blur-sm hover:bg-teal-50 hover:text-teal-800 hover:ring-teal-200/90 hover:shadow-sm transition-[box-shadow,colors,transform] duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600";

const iconBtnDanger =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 ring-1 ring-slate-200/90 bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:text-red-700 hover:ring-red-200/90 hover:shadow-sm transition-[box-shadow,colors,transform] duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`relative text-sm font-medium transition-colors duration-150 ${
        active
          ? "text-teal-800"
          : "text-slate-600 hover:text-teal-700"
      }`}
    >
      {children}
      <span
        className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-teal-600 transition-opacity duration-150 ${
          active ? "opacity-100" : "opacity-0 hover:opacity-40"
        }`}
        aria-hidden
      />
    </Link>
  );
}

export default function Navbar() {
  const { user, isReady, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgb(15_23_42_/_0.04)] supports-[backdrop-filter]:bg-white/70">
      <nav className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 sm:px-6 lg:px-8 py-3.5">
        <Link
          href="/"
          className="group flex items-center gap-2 shrink-0 rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-bold text-white shadow-md shadow-teal-900/20 transition-transform duration-150 group-hover:scale-105">
            K
          </span>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-teal-800 to-teal-600 bg-clip-text text-transparent">
            Kinova
          </span>
        </Link>

        <div className="flex flex-1 min-w-0 items-center justify-center gap-8 sm:gap-10">
          <NavLink href="/">Beranda</NavLink>
          <NavLink href="/services">Layanan</NavLink>
          <NavLink href="/about">Tentang</NavLink>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          {!isReady ? (
            <>
              <span className="inline-flex h-10 w-10 rounded-xl bg-slate-100/80 animate-pulse ring-1 ring-slate-200/60" />
              <span className="inline-flex h-10 w-10 rounded-xl bg-slate-100/80 animate-pulse ring-1 ring-slate-200/60" />
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
