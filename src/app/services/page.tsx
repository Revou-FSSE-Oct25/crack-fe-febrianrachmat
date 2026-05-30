"use client";

import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";
import {
  btnPrimary,
  btnSecondary,
  cardSurface,
  PageHeader,
  widePageShell,
} from "@/components/ui/page-shell";
import { useLanguage } from "@/contexts/language-context";

export default function ServicesPage() {
  const { t } = useLanguage();

  return (
    <main className={`${widePageShell} space-y-12 pb-16`}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow={t("mkt.servicesEyebrow")}
          title={t("mkt.servicesTitle")}
          description={t("mkt.servicesDesc")}
        />
        <div className="flex shrink-0 flex-col gap-3 self-stretch sm:flex-row sm:items-center lg:self-auto">
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
            {t("mkt.bookNow")}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        <ServiceCard
          title={t("mkt.serviceCard1Title")}
          description={t("mkt.serviceCard1Desc")}
        />
        <ServiceCard
          title={t("mkt.serviceCard2Title")}
          description={t("mkt.serviceCard2Desc")}
        />
        <ServiceCard
          title={t("mkt.serviceCard3Title")}
          description={t("mkt.serviceCard3Desc")}
        />
      </div>

      <div className="mx-auto max-w-3xl">
        <div className={`${cardSurface} p-6 sm:p-8`}>
          <h3 className="text-center text-lg font-semibold tracking-tight text-slate-900 sm:text-left">
            {t("mkt.servicesAfterTitle")}
          </h3>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-600 sm:text-left">
            {t("mkt.servicesAfterBody1")}{" "}
            <Link
              href="/consultations"
              className="font-semibold text-teal-700 underline-offset-2 hover:underline"
            >
              {t("mkt.consultationLink")}
            </Link>{" "}
            {t("mkt.servicesAfterBody2")}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href="/appointment"
              className={`${btnPrimary} min-h-[44px] flex-1 justify-center text-center sm:flex-none sm:px-8`}
            >
              {t("mkt.makeAppointment")}
            </Link>
            <Link
              href="/consultations"
              className={`${btnSecondary} min-h-[44px] flex-1 justify-center text-center sm:flex-none sm:px-8`}
            >
              {t("mkt.goToConsultation")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
