"use client";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import {
  AlertBanner,
  btnOutline,
  btnSecondary,
  cardSurface,
  EmptyState,
  ListSkeleton,
  PageHeader,
  PageLoading,
  widePageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
import { requestUnreadRefresh } from "@/lib/notifications/unread-refresh";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type NotifRow = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

function asRows(items: unknown[]): NotifRow[] {
  return items.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      title: String(r.title ?? ""),
      body: String(r.body ?? ""),
      isRead: Boolean(r.isRead),
      createdAt: String(r.createdAt ?? ""),
    };
  });
}

export default function NotificationsPage() {
  const { user, isReady } = useAuth();
  const { t } = useLanguage();
  const [rows, setRows] = useState<NotifRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const { items, meta } = await listMyNotifications({
        page: p,
        limit: 20,
      });
      setRows(asRows(items));
      setTotalPages(meta.totalPages);
      setPage(meta.page);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("notif.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isReady || !user) return;
    void load(1);
  }, [isReady, user, load]);

  async function markOne(id: string) {
    try {
      await markNotificationRead(id);
      requestUnreadRefresh();
      await load(page);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("notif.markReadError"),
      );
    }
  }

  async function markAll() {
    try {
      await markAllNotificationsRead();
      requestUnreadRefresh();
      await load(page);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("notif.markAllError"),
      );
    }
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message={t("notif.signInRequired")} />;
  }

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow={t("notif.eyebrow")}
          title={t("notif.title")}
          description={t("notif.description")}
        />
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <Link
            href="/bookings"
            className={`${btnOutline} min-h-[44px] justify-center text-center sm:min-w-[9rem]`}
          >
            {t("notif.booking")}
          </Link>
          <Link
            href="/consultations"
            className={`${btnOutline} min-h-[44px] justify-center text-center sm:min-w-[9rem]`}
          >
            {t("notif.consultation")}
          </Link>
          <button
            type="button"
            onClick={() => void markAll()}
            className={`${btnSecondary} min-h-[44px] justify-center px-5 text-center sm:min-w-[12rem]`}
          >
            {t("notif.markAll")}
          </button>
        </div>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <ListSkeleton rows={3} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={t("notif.emptyTitle")}
          hint={t("notif.emptyHint")}
          actions={[
            { href: "/bookings", label: t("notif.viewBooking") },
            {
              href: "/consultations",
              label: t("notif.viewConsultation"),
              variant: "secondary",
            },
          ]}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {rows.map((n) => (
              <li
                key={n.id}
                className={`${cardSurface} ${
                  n.isRead ? "" : "border-teal-200/80 bg-teal-50/25"
                }`}
              >
                <div className="flex justify-between gap-3 items-start">
                  <h2 className="font-semibold text-slate-900">{n.title}</h2>
                  {!n.isRead ? (
                    <button
                      type="button"
                      onClick={() => void markOne(n.id)}
                      className={`${btnOutline} min-h-[36px] shrink-0 px-3 py-1.5 text-xs font-semibold text-teal-800`}
                    >
                      {t("notif.markRead")}
                    </button>
                  ) : null}
                </div>
                <p className="text-slate-700 mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {n.body}
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  {new Date(n.createdAt).toLocaleString("id-ID")}
                </p>
              </li>
            ))}
          </ul>
          {totalPages > 1 ? (
            <div className="flex flex-wrap gap-3 justify-center items-center pt-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => void load(page - 1)}
                className={`${btnOutline} min-h-[44px] px-5`}
              >
                {t("notif.previous")}
              </button>
              <span className="text-sm text-slate-600 tabular-nums">
                {t("notif.page")} {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => void load(page + 1)}
                className={`${btnOutline} min-h-[44px] px-5`}
              >
                {t("notif.next")}
              </button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
