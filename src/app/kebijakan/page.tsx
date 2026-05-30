"use client";

import Link from "next/link";
import {
  cardSurface,
  PageHeader,
  widePageShell,
} from "@/components/ui/page-shell";
import { useLanguage } from "@/contexts/language-context";

const BACKEND_POLICY_DOC =
  "https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat/blob/main/docs/product-policy.md";

export default function KebijakanPage() {
  const { t } = useLanguage();

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <PageHeader
        eyebrow={t("mkt.kebijakanEyebrow")}
        title={t("mkt.kebijakanTitle")}
        description={t("mkt.kebijakanDesc")}
      />

      <section className={`${cardSurface} space-y-4 text-slate-700 text-sm leading-relaxed`}>
        <h2 className="text-base font-semibold text-slate-900">
          {t("mkt.kebijakanStatusTitle")}
        </h2>
        <p>
          {t("mkt.kebijakanStatusBody1")}{" "}
          <strong>{t("mkt.kebijakanStatusBodyProto")}</strong>{" "}
          {t("mkt.kebijakanStatusBody2")}{" "}
          <strong>{t("mkt.kebijakanStatusBodyDummy")}</strong>{" "}
          {t("mkt.kebijakanStatusBody3")}
        </p>
      </section>

      <section className={`${cardSurface} space-y-4 text-slate-700 text-sm leading-relaxed`}>
        <h2 className="text-base font-semibold text-slate-900">
          {t("mkt.kebijakanRolesTitle")}
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>{t("mkt.kebijakanRolePatientLabel")}</strong>{" "}
            {t("mkt.kebijakanRolePatientBody")}
          </li>
          <li>
            <strong>{t("mkt.kebijakanRolePhysioLabel")}</strong>{" "}
            {t("mkt.kebijakanRolePhysioBody")}
          </li>
          <li>
            <strong>{t("mkt.kebijakanRoleAdminLabel")}</strong>{" "}
            {t("mkt.kebijakanRoleAdminBody")}
          </li>
        </ul>
      </section>

      <section className={`${cardSurface} space-y-4 text-slate-700 text-sm leading-relaxed`}>
        <h2 className="text-base font-semibold text-slate-900">
          {t("mkt.kebijakanPaymentTitle")}
        </h2>
        <p>
          {t("mkt.kebijakanPaymentBody1")}{" "}
          <strong>{t("mkt.kebijakanPaymentServer")}</strong>{" "}
          {t("mkt.kebijakanPaymentBody2")}{" "}
          <strong>{t("mkt.kebijakanPaymentProof")}</strong>{" "}
          {t("mkt.kebijakanPaymentBody3")}{" "}
          <code className="rounded bg-slate-100 px-1">https</code>
          {t("mkt.kebijakanPaymentBody4")}
        </p>
        <p>{t("mkt.kebijakanPaymentBody5")}</p>
      </section>

      <section className={`${cardSurface} space-y-4 text-slate-700 text-sm leading-relaxed`}>
        <h2 className="text-base font-semibold text-slate-900">
          {t("mkt.kebijakanPrivacyTitle")}
        </h2>
        <p>
          {t("mkt.kebijakanPrivacyBody1")}{" "}
          <strong>{t("mkt.kebijakanPrivacyNot")}</strong>{" "}
          {t("mkt.kebijakanPrivacyBody2")}{" "}
          <strong>{t("mkt.kebijakanPrivacyNot")}</strong>{" "}
          {t("mkt.kebijakanPrivacyBody3")}
        </p>
      </section>

      <section className={`${cardSurface} space-y-3`}>
        <h2 className="text-base font-semibold text-slate-900">
          {t("mkt.kebijakanDocsTitle")}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {t("mkt.kebijakanDocsBody")}
        </p>
        <p>
          <a
            href={BACKEND_POLICY_DOC}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-700 font-medium underline hover:text-teal-800"
          >
            {t("mkt.kebijakanDocsLink")}
          </a>
        </p>
        <p className="text-xs text-slate-500">
          {t("mkt.kebijakanDocsFallback1")}{" "}
          <code className="rounded bg-slate-100 px-1">docs/product-policy.md</code>{" "}
          {t("mkt.kebijakanDocsFallback2")}
        </p>
      </section>

      <p className="text-center text-sm text-slate-600">
        <Link href="/" className="text-teal-700 hover:underline font-medium">
          {t("mkt.backToHome")}
        </Link>
      </p>
    </main>
  );
}
