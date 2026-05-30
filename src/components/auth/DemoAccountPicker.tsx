"use client";

import {
  DEMO_ACCOUNTS,
  DEMO_DEFAULT_PASSWORD,
} from "@/lib/demo-guide";
import { useLanguage } from "@/contexts/language-context";

export function DemoAccountPicker({
  onPick,
}: {
  onPick: (email: string, password: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="mt-6 rounded-xl border border-dashed border-teal-200/90 bg-teal-50/50 px-4 py-4 dark:border-teal-800/60 dark:bg-teal-950/30">
      <p className="text-xs font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-200">
        {t("auth.demo.title")}
      </p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        {t("auth.demo.passwordLabel")} <code className="font-mono text-teal-800 dark:text-teal-200">{DEMO_DEFAULT_PASSWORD}</code>
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {DEMO_ACCOUNTS.map((acc) => (
          <li key={acc.email}>
            <button
              type="button"
              onClick={() => onPick(acc.email, DEMO_DEFAULT_PASSWORD)}
              className="w-full rounded-lg border border-teal-100 bg-white px-3 py-2 text-left text-sm transition-colors hover:border-teal-200 hover:bg-teal-50/80 dark:border-teal-900/60 dark:bg-slate-900/60 dark:hover:bg-teal-950/50"
            >
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {acc.label}
              </span>
              <span className="ml-2 font-mono text-xs text-teal-700 dark:text-teal-300">
                {acc.email}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                {acc.note}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
