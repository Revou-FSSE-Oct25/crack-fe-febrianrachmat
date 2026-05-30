"use client";

import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";

const footerLink =
  "text-sm text-teal-100/95 hover:text-white transition-colors duration-150 underline-offset-4 hover:underline decoration-teal-300/80";

const footerHeading = "text-xs font-semibold uppercase tracking-wider text-teal-200/90";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-teal-950/20 bg-gradient-to-b from-teal-800 via-teal-900 to-slate-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 0% 100%, rgb(45 212 191) 0%, transparent 42%), radial-gradient(circle at 100% 0%, rgb(15 118 110) 0%, transparent 38%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="text-lg font-bold tracking-tight text-white">Kinova</p>
            <p className="mt-3 max-w-sm text-sm text-teal-100/90 leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="sm:col-span-1 lg:col-span-3">
            <p className={footerHeading}>{t("footer.navHeading")}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link href="/services" className={footerLink}>
                  {t("footer.services")}
                </Link>
              </li>
              <li>
                <Link href="/about" className={footerLink}>
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link href="/therapists" className={footerLink}>
                  {t("footer.physio")}
                </Link>
              </li>
              <li>
                <Link href="/appointment" className={footerLink}>
                  {t("footer.appointment")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-1 lg:col-span-4">
            <p className={footerHeading}>{t("footer.accountHeading")}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link href="/login" className={footerLink}>
                  {t("footer.login")}
                </Link>
              </li>
              <li>
                <Link href="/register" className={footerLink}>
                  {t("footer.register")}
                </Link>
              </li>
              <li>
                <Link href="/kebijakan" className={footerLink}>
                  {t("footer.policy")}
                </Link>
              </li>
              <li>
                <Link href="/demo" className={footerLink}>
                  {t("footer.demoGuide")}
                </Link>
              </li>
              <li>
                <Link href="/status" className={footerLink}>
                  {t("footer.serviceStatus")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-teal-200/85">
          © {new Date().getFullYear()} Kinova. {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
