"use client";

import Link from "next/link";
import {
  btnPrimary,
  btnSecondary,
  cardSurface,
  PageHeader,
  widePageShell,
} from "@/components/ui/page-shell";
import { useLanguage } from "@/contexts/language-context";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <main className={`${widePageShell} space-y-10 pb-16`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow={t("mkt.aboutEyebrow")}
          title="Kinova Movement & Recovery"
          description={t("mkt.aboutDesc")}
        />
        <div className="flex shrink-0 flex-col gap-3 self-stretch sm:flex-row sm:flex-wrap lg:self-auto">
          <Link
            href="/therapists"
            className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
          >
            {t("mkt.findPhysio")}
          </Link>
          <Link
            href="/appointment"
            className={`${btnPrimary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
          >
            {t("mkt.booking")}
          </Link>
        </div>
      </div>

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="text-lg font-semibold text-slate-900">
          {t("mkt.aboutVisionTitle")}
        </h2>
        <p className="text-slate-600 leading-relaxed">
          {t("mkt.aboutVisionBody")}
        </p>
      </section>

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="text-lg font-semibold text-slate-900">
          {t("mkt.aboutOfferTitle")}
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed">
          <li>{t("mkt.aboutOffer1")}</li>
          <li>{t("mkt.aboutOffer2")}</li>
          <li>{t("mkt.aboutOffer3")}</li>
        </ul>
      </section>

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="text-lg font-semibold text-slate-900">
          {t("mkt.aboutDemoTitle")}
        </h2>
        <p className="text-slate-600 leading-relaxed">
          {t("mkt.aboutDemoBody1")}{" "}
          <strong>{t("mkt.aboutDemoProto")}</strong>{" "}
          {t("mkt.aboutDemoBody2")}{" "}
          <Link
            href="/kebijakan"
            className="font-semibold text-teal-700 hover:underline"
          >
            {t("mkt.aboutDemoPolicyLink")}
          </Link>
          .
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-start">
        <Link
          href="/appointment"
          className={`${btnPrimary} min-h-[44px] justify-center text-center sm:inline-flex`}
        >
          {t("mkt.makeAppointment")}
        </Link>
        <Link
          href="/services"
          className={`${btnSecondary} min-h-[44px] justify-center text-center sm:inline-flex`}
        >
          {t("mkt.viewServices")}
        </Link>
      </div>
    </main>
  );
}
