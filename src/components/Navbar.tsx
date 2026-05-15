"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  IconArrowRightEndOnRectangle,
  IconArrowRightOnRectangle,
  IconBars3,
  IconBell,
  IconUserCircle,
  IconXMark,
} from "@/components/nav-icons";
import ThemeToggle from "@/components/ThemeToggle";
import { useUnreadNotifications } from "@/hooks/use-unread-notifications";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const iconBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 ring-1 ring-slate-200/90 bg-white/90 backdrop-blur-sm hover:bg-teal-50 hover:text-teal-800 hover:ring-teal-200/90 hover:shadow-sm transition-[box-shadow,colors,transform] duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:bg-slate-800/90 dark:text-slate-200 dark:ring-slate-600/80 dark:hover:bg-slate-700 dark:hover:text-teal-200 dark:hover:ring-teal-700/60";

const iconBtnDanger =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 ring-1 ring-slate-200/90 bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:text-red-700 hover:ring-red-200/90 hover:shadow-sm transition-[box-shadow,colors,transform] duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:bg-slate-800/90 dark:text-slate-200 dark:ring-slate-600/80 dark:hover:bg-red-950/50 dark:hover:text-red-300 dark:hover:ring-red-800/60";

const menuBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 ring-1 ring-slate-200/90 bg-white/90 backdrop-blur-sm hover:bg-slate-50 hover:ring-slate-300/90 transition-[box-shadow,colors,transform] duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 lg:hidden dark:bg-slate-800/90 dark:text-slate-200 dark:ring-slate-600/80 dark:hover:bg-slate-700 dark:hover:ring-slate-500/80";

function NavLink({
  href,
  children,
  mobile,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={
        mobile
          ? `block rounded-xl px-4 py-3 text-base font-medium transition-colors ${
              active
                ? "bg-teal-50 text-teal-900 ring-1 ring-teal-100 dark:bg-teal-950/50 dark:text-teal-200 dark:ring-teal-800/70"
                : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            }`
          : `relative pb-0.5 text-sm font-medium transition-colors duration-150 ${
              active
                ? "text-teal-800 dark:text-teal-300"
                : "text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
            }`
      }
    >
      {children}
      {!mobile ? (
        <span
          className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-teal-600 transition-opacity duration-150 ${
            active ? "opacity-100" : "opacity-0 hover:opacity-40"
          }`}
          aria-hidden
        />
      ) : null}
    </Link>
  );
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-slate-800">
      {label}
    </span>
  );
}

export default function Navbar() {
  const { user, isReady, logout } = useAuth();
  const { unreadCount } = useUnreadNotifications();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    queueMicrotask(() => setMenuOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgb(15_23_42_/_0.04)] supports-[backdrop-filter]:bg-white/70 relative dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-[0_1px_0_rgb(0_0_0_/_0.35)] dark:supports-[backdrop-filter]:bg-slate-900/75">
      <nav
        className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5"
        aria-label="Utama"
      >
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 shrink-0 rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-bold text-white shadow-md shadow-teal-900/20 transition-transform duration-150 group-hover:scale-105">
            K
          </span>
          <span className="truncate text-lg font-bold tracking-tight bg-gradient-to-r from-teal-800 to-teal-600 bg-clip-text text-transparent">
            Kinova
          </span>
        </Link>

        <div className="hidden lg:flex flex-1 items-center justify-center gap-10 min-w-0">
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
                href="/notifications"
                className={`${iconBtn} relative`}
                aria-label={
                  unreadCount > 0
                    ? `Notifikasi, ${unreadCount} belum dibaca`
                    : "Notifikasi"
                }
                title="Notifikasi"
              >
                <IconBell />
                <UnreadBadge count={unreadCount} />
                <span className="sr-only">Notifikasi</span>
              </Link>
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

          <ThemeToggle />

          <button
            type="button"
            className={menuBtn}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <IconXMark /> : <IconBars3 />}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[2px] lg:hidden"
            aria-label="Tutup menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id={menuId}
            className="lg:hidden absolute left-0 right-0 top-full z-50 max-h-[min(70vh,calc(100dvh-5rem))] overflow-y-auto border-b border-slate-200/90 bg-white/95 px-4 py-4 shadow-lg shadow-slate-900/10 backdrop-blur-xl sm:px-6 dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-black/30"
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi"
          >
            <div className="mx-auto max-w-lg space-y-1">
              <NavLink href="/" mobile onNavigate={() => setMenuOpen(false)}>
                Beranda
              </NavLink>
              <NavLink
                href="/services"
                mobile
                onNavigate={() => setMenuOpen(false)}
              >
                Layanan
              </NavLink>
              <NavLink href="/about" mobile onNavigate={() => setMenuOpen(false)}>
                Tentang
              </NavLink>
              {user ? (
                <NavLink
                  href="/notifications"
                  mobile
                  onNavigate={() => setMenuOpen(false)}
                >
                  Notifikasi
                  {unreadCount > 0 ? ` (${unreadCount})` : ""}
                </NavLink>
              ) : null}
              <NavLink
                href="/therapists"
                mobile
                onNavigate={() => setMenuOpen(false)}
              >
                Cari fisioterapis
              </NavLink>
              <NavLink
                href="/appointment"
                mobile
                onNavigate={() => setMenuOpen(false)}
              >
                Buat janji temu
              </NavLink>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
