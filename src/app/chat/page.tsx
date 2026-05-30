"use client";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { ApiRequestError } from "@/lib/api/client";
import { listMyConversations } from "@/lib/api/chat";
import {
  AlertBanner,
  btnOutline,
  cardSurface,
  EmptyState,
  ListSkeleton,
  PageHeader,
  PageLoading,
  widePageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ConvRow = {
  id: string;
  updatedAt: string;
};

function asConvRows(data: unknown): ConvRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      updatedAt: String(r.updatedAt ?? ""),
    };
  });
}

export default function ChatListPage() {
  const { user, isReady } = useAuth();
  const { t } = useLanguage();
  const [rows, setRows] = useState<ConvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listMyConversations({ page: 1, limit: 50 });
      setRows(asConvRows(list));
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("chat.loadConversationsError"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isReady || !user) return;
    void load();
  }, [isReady, user, load]);

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message={t("chat.signInToView")} />;
  }

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow={t("chat.eyebrow")}
          title="Chat"
          description={t("chat.listDescription")}
        />
        <Link
          href="/consultations"
          className={`${btnOutline} min-h-[44px] shrink-0 justify-center self-start text-center sm:self-auto sm:min-w-[11rem]`}
        >
          {t("chat.consultationPageLink")}
        </Link>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={t("chat.emptyTitle")}
          hint={t("chat.emptyHint")}
          actions={[
            { href: "/consultations", label: t("chat.toConsultationPage") },
            {
              href: "/therapists",
              label: t("chat.findPhysio"),
              variant: "secondary",
            },
          ]}
        />
      ) : (
        <ul className={`${cardSurface} divide-y divide-slate-100 p-0 overflow-hidden`}>
          {rows.map((c) => (
            <li key={c.id}>
              <Link
                href={`/chat/${c.id}`}
                className="flex min-h-[52px] flex-col justify-center px-5 py-4 transition-colors hover:bg-teal-50/40"
              >
                <span className="font-mono text-xs text-slate-500 break-all">
                  {c.id}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  {t("chat.latest")}{" "}
                  {new Date(c.updatedAt).toLocaleString("id-ID")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
