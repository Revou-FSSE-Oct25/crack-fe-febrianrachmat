"use client";

import {
  btnPrimary,
  btnSecondary,
  cardSurface,
  PageHeader,
  widePageShell,
} from "@/components/ui/page-shell";
import {
  DEMO_DEFAULT_PASSWORD,
  getDemoAccounts,
  getDemoHappyPaths,
  getDemoPreflightChecklist,
} from "@/lib/demo-guide";
import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";

export default function DemoGuidePage() {
  const { t, language } = useLanguage();

  const checklist = getDemoPreflightChecklist(language);
  const accounts = getDemoAccounts(language);
  const happyPaths = getDemoHappyPaths(language);

  return (
    <main className={`${widePageShell} space-y-10 pb-16`}>
      <PageHeader
        eyebrow={t("mkt.demoEyebrow")}
        title={t("mkt.demoTitle")}
        description={t("mkt.demoDesc")}
      />

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {t("mkt.demoChecklistTitle")}
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-400">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/status" className={btnPrimary}>
            {t("mkt.demoCheckStatus")}
          </Link>
          <Link href="/kebijakan" className={btnSecondary}>
            {t("mkt.demoPolicyBtn")}
          </Link>
        </div>
      </section>

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {t("mkt.demoAccountsTitle")}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t("mkt.demoPasswordBody1")}{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
            npm run prisma:seed
          </code>
          :{" "}
          <strong className="font-mono text-teal-800 dark:text-teal-200">
            {DEMO_DEFAULT_PASSWORD}
          </strong>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-600">
                <th className="py-2 pr-4 font-semibold">{t("mkt.demoColEmail")}</th>
                <th className="py-2 pr-4 font-semibold">{t("mkt.demoColRole")}</th>
                <th className="py-2 font-semibold">{t("mkt.demoColNote")}</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300">
              {accounts.map((acc) => (
                <tr
                  key={acc.email}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-700/80"
                >
                  <td className="py-3 pr-4 font-mono text-xs sm:text-sm">
                    {acc.email}
                  </td>
                  <td className="py-3 pr-4">{acc.role}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">
                    {acc.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/login" className={`${btnPrimary} inline-flex`}>
          {t("mkt.demoLoginBtn")}
        </Link>
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {t("mkt.demoHappyTitle")}
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {happyPaths.map((flow) => (
            <article key={flow.title} className={`${cardSurface} space-y-3`}>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                {flow.title}
              </h3>
              <p className="text-xs font-medium text-teal-800 dark:text-teal-300">
                {flow.actors}
              </p>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-400">
                {flow.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-2 pt-2">
                {flow.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${cardSurface} text-sm text-slate-600 dark:text-slate-400`}>
        <p>
          {t("mkt.demoE2EBody1")}{" "}
          <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">
            E2E_RUN=1 npm run test:e2e:local
          </code>{" "}
          {t("mkt.demoE2EBody2")}
        </p>
      </section>
    </main>
  );
}
