"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const pill =
  "inline-flex items-center rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200/90 shadow-sm hover:bg-teal-50 hover:text-teal-900 hover:ring-teal-200/90 hover:shadow transition-[box-shadow,colors] duration-150 active:scale-[0.98] dark:bg-slate-800/90 dark:text-slate-200 dark:ring-slate-600/80 dark:hover:bg-slate-700 dark:hover:text-teal-200 dark:hover:ring-teal-700/60";

const pillAdmin =
  "inline-flex items-center rounded-full bg-teal-50/95 px-3 py-1.5 text-sm font-medium text-teal-900 ring-1 ring-teal-200/80 shadow-sm hover:bg-teal-100 hover:ring-teal-300/60 transition-[box-shadow,colors] duration-150 active:scale-[0.98] dark:bg-teal-950/50 dark:text-teal-200 dark:ring-teal-800/70 dark:hover:bg-teal-900/50";

const pillPrimary =
  "inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-teal-900/20 hover:bg-teal-500 active:scale-[0.98] transition-[transform,colors,box-shadow] duration-150";

type ShortcutLink = { href: string; label: string; admin?: boolean };

type ShortcutSection = {
  id: string;
  title: string;
  defaultOpen?: boolean;
  items: ShortcutLink[];
};

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h2 className="mb-2.5 pl-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chevron() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function SectionLinks({ items }: { items: ShortcutLink[] }) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={`${item.href}-${item.label}`}
          href={item.href}
          className={item.admin ? pillAdmin : pill}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

function useWideLayout(breakpointPx: number) {
  const [wide, setWide] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpointPx]);

  return wide;
}

export default function AppShortcutBar() {
  const { user, isReady } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const mdUp = useWideLayout(768);
  const narrowShortcuts = mdUp === false;

  if (!isReady) {
    if (isHome) return null;
    return (
      <div
        className="border-b border-slate-200/80 bg-white/60 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/60"
        aria-hidden
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="h-9 max-w-md animate-pulse rounded-full bg-gradient-to-r from-slate-100 to-slate-50 ring-1 ring-slate-200/60" />
        </div>
      </div>
    );
  }

  if (!user) {
    if (isHome) return null;
    return (
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50/95 via-white to-teal-50/50 backdrop-blur-sm dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-sm leading-snug text-slate-600">
            Siap konsultasi atau booking sesi fisioterapi?
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/appointment" className={`${pillPrimary} min-h-[40px]`}>
              Buat janji temu
            </Link>
            <Link href="/therapists" className={`${pill} min-h-[40px]`}>
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

  const sections: ShortcutSection[] = [];

  if (isAdmin) {
    sections.push({
      id: "admin",
      title: "Admin",
      defaultOpen: true,
      items: [
        { href: "/admin/dashboard", label: "Dashboard", admin: true },
        { href: "/admin/physiotherapists", label: "Verifikasi PT", admin: true },
        { href: "/admin/categories", label: "Kategori", admin: true },
        { href: "/admin/reviews", label: "Ulasan", admin: true },
        { href: "/admin/notifications", label: "Broadcast", admin: true },
      ],
    });
  }

  const activityItems: ShortcutLink[] = [
    { href: "/consultations", label: "Konsultasi" },
    { href: "/calendar", label: "Kalender" },
    { href: "/bookings", label: "Daftar booking" },
    ...(showTransactions ? [{ href: "/transactions", label: "Transaksi" }] : []),
    { href: "/notifications", label: "Notifikasi" },
    { href: "/chat", label: "Chat" },
  ];
  sections.push({
    id: "activity",
    title: "Aktivitas",
    defaultOpen: !isAdmin,
    items: activityItems,
  });

  const forYouItems: ShortcutLink[] = [];
  if (showTherapistsList) {
    forYouItems.push({ href: "/therapists", label: "Fisioterapis" });
  }
  if (user.role === "PATIENT") {
    forYouItems.push(
      { href: "/reviews", label: "Ulasan saya" },
      { href: "/reviews/write", label: "Tulis ulasan" },
    );
  }
  if (isPt) {
    forYouItems.push(
      { href: "/physiotherapist/profile", label: "Profil PT" },
      { href: "/physiotherapist/availability", label: "Jadwal slot" },
    );
  }
  forYouItems.push({ href: "/profile", label: "Profil saya" });
  sections.push({ id: "foryou", title: "Untuk Anda", items: forYouItems });

  const quickItems: ShortcutLink[] = [];
  if (showBookingCTA) {
    quickItems.push({ href: "/appointment", label: "Form janji temu" });
  }
  quickItems.push({ href: "/services", label: "Layanan" });
  sections.push({ id: "quick", title: "Cepat", items: quickItems });

  return (
    <div className="border-b border-slate-200/80 bg-white/85 shadow-[0_6px_24px_rgb(15_23_42_/_0.04)] backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/85 dark:shadow-[0_6px_24px_rgb(0_0_0_/_0.25)]">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="truncate text-sm text-slate-600" title={user.fullName}>
            Halo,{" "}
            <span className="font-semibold text-slate-800">{user.fullName}</span>
          </p>
          {showBookingCTA ? (
            <Link
              href="/appointment"
              className={`${pillPrimary} w-full min-h-[44px] text-center sm:w-auto`}
            >
              Booking / janji baru
            </Link>
          ) : isAdmin ? (
            <Link
              href="/admin/dashboard"
              className={`${pillPrimary} w-full min-h-[44px] text-center sm:w-auto`}
            >
              Dashboard admin
            </Link>
          ) : isPt ? (
            <Link
              href="/physiotherapist/availability"
              className={`${pillPrimary} w-full min-h-[44px] text-center sm:w-auto`}
            >
              Kelola jadwal
            </Link>
          ) : null}
        </div>

        {narrowShortcuts ? (
          <div className="space-y-2" role="navigation" aria-label="Pintasan">
            {sections.map((s) => (
              <details
                key={s.id}
                className="group rounded-xl border border-slate-200/80 bg-slate-50/40 px-3 py-2 open:bg-white/90 open:shadow-sm dark:border-slate-700/80 dark:bg-slate-800/40 dark:open:bg-slate-800/90"
                {...(s.defaultOpen ? { defaultOpen: true } : {})}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 [&::-webkit-details-marker]:hidden">
                  <span>{s.title}</span>
                  <Chevron />
                </summary>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200/60 pt-3">
                  <SectionLinks items={s.items} />
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            role="navigation"
            aria-label="Pintasan"
          >
            {sections.map((s) => (
              <Section key={s.id} title={s.title}>
                <SectionLinks items={s.items} />
              </Section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
