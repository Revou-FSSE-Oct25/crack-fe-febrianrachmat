"use client";

import {
  buildOAuthStartUrl,
  fetchOAuthProviders,
  type OAuthProviderId,
} from "@/lib/api/oauth";
import { useLanguage } from "@/contexts/language-context";
import { useEffect, useState } from "react";

const PROVIDER_LABELS: Record<OAuthProviderId, string> = {
  google: "Google",
  apple: "Apple",
  github: "GitHub",
  facebook: "Facebook",
};

const btnOAuth =
  "flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-700";

type OAuthButtonsProps = {
  role?: "PATIENT" | "PHYSIOTHERAPIST";
  nextPath?: string;
};

export function OAuthButtons({ role, nextPath }: OAuthButtonsProps) {
  const { t } = useLanguage();
  const [providers, setProviders] = useState<OAuthProviderId[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchOAuthProviders()
      .then((list) => {
        if (!cancelled) setProviders(list);
      })
      .catch(() => {
        if (!cancelled) setProviders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (providers === null || providers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative mx-auto block w-fit bg-white px-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          {t("auth.oauth.divider")}
        </span>
      </div>
      <div className="grid gap-2.5">
        {providers.map((provider) => (
          <a
            key={provider}
            href={buildOAuthStartUrl(provider, { role, next: nextPath })}
            className={btnOAuth}
          >
            {PROVIDER_LABELS[provider]}
          </a>
        ))}
      </div>
    </div>
  );
}
