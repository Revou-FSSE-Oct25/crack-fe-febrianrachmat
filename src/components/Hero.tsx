"use client";

import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";

export default function Hero() {
  const { t } = useLanguage();
  const trustItems = [
    { label: t("hero.trust1.label"), detail: t("hero.trust1.detail") },
    { label: t("hero.trust2.label"), detail: t("hero.trust2.detail") },
    { label: t("hero.trust3.label"), detail: t("hero.trust3.detail") },
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 0%, transparent 45%), radial-gradient(circle at 80% 20%, rgb(94 234 212 / 0.45) 0%, transparent 40%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent opacity-95 dark:from-slate-950 dark:opacity-100"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-20 sm:pb-24 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
          <p className="inline-flex items-center justify-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-50 ring-1 ring-white/25 backdrop-blur-sm lg:justify-start">
            Kinova
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance leading-[1.08] sm:text-5xl lg:text-[3.35rem]">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-pretty text-base leading-relaxed text-teal-50/95 sm:text-lg lg:max-w-xl">
            {t("hero.subtitle")}
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start sm:gap-4">
            <Link
              href="/appointment"
              className="inline-flex w-full sm:w-auto min-h-[48px] min-w-[200px] items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-teal-800 shadow-lg shadow-teal-950/30 hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-[transform,colors] duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              {t("hero.cta.appointment")}
            </Link>
            <Link
              href="/services"
              className="inline-flex w-full sm:w-auto min-h-[48px] min-w-[200px] items-center justify-center rounded-xl border-2 border-white/35 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/15 hover:border-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 transition-[transform,colors,border-color] duration-150"
            >
              {t("hero.cta.services")}
            </Link>
          </div>
        </div>

        <ul
          className="mx-auto mt-14 grid max-w-2xl gap-3 sm:grid-cols-3 sm:gap-4 lg:mx-0 lg:max-w-none"
          aria-label={t("hero.values")}
        >
          {trustItems.map((item) => (
            <li
              key={item.label}
              className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-left backdrop-blur-sm sm:px-5 sm:py-4"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-0.5 text-xs leading-snug text-teal-100/90">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
