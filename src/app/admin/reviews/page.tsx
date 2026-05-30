"use client";

import {
  adminPageShell,
  AdminBreadcrumb,
  AlertBanner,
  btnOutline,
  btnPrimary,
  cardSurface,
  EmptyState,
  inputBase,
  ListSkeleton,
  PageHeader,
  PageLoading,
  ConfirmDialog,
  StatusChip,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  listMyReviews,
  moderateReview,
  type Review,
} from "@/lib/api/reviews";
import { reviewSourceLabel } from "@/lib/reviews/labels";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const hideBtn =
  "inline-flex items-center justify-center rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 transition-[transform,colors] duration-150";

export default function AdminReviewsPage() {
  const { user, isReady } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [hideConfirmId, setHideConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listMyReviews({ page: 1, limit: 100 });
      setRows(list);
    } catch (err) {
      setRows([]);
      setError(
        err instanceof ApiRequestError ? err.message : t("admin.reviews.errLoad"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isReady || user?.role !== "ADMIN") return;
    void load();
  }, [isReady, user?.role, load]);

  async function applyModeration(
    reviewId: string,
    isHidden: boolean,
    noteRaw: string,
  ) {
    const note = noteRaw.trim();
    if (note.length > 0 && note.length < 3) {
      setError(t("admin.reviews.moderationNoteMin"));
      return;
    }
    setActionId(reviewId);
    setError(null);
    try {
      await moderateReview(reviewId, {
        isHidden,
        moderationNote: note.length >= 3 ? note : undefined,
      });
      setNoteById((prev) => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
      toast.success(
        isHidden ? t("admin.reviews.toastHidden") : t("admin.reviews.toastShown"),
      );
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("admin.reviews.errModerate"),
      );
    } finally {
      setActionId(null);
    }
  }

  if (!isReady) {
    return <PageLoading label={t("admin.reviews.loading")} />;
  }

  if (!user) {
    return (
      <SignInRequired message={t("admin.reviews.signIn")} />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className={adminPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader
            eyebrow="Admin"
            title={t("admin.common.accessDenied")}
            description={t("admin.common.onlyAdmin")}
          />
          <Link
            href="/"
            className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            {t("admin.common.backHome")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={adminPageShell}>
      <AdminBreadcrumb />

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow="Admin"
            title={t("admin.reviews.title")}
            description={t("admin.reviews.description")}
          />
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className={`${btnOutline} min-h-[44px] shrink-0 px-5`}
        >
          {t("admin.common.reload")}
        </button>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <ListSkeleton rows={2} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={t("admin.reviews.noReviews")}
          hint={t("admin.reviews.noReviewsHint")}
          actions={[
            { href: "/admin/dashboard", label: t("admin.common.backToDashboard") },
            {
              href: "/bookings",
              label: t("admin.reviews.viewBookingsDemo"),
              variant: "secondary",
            },
          ]}
        />
      ) : (
        <ul className="space-y-6">
          {rows.map((rev) => (
            <li key={rev.id} className={`${cardSurface} space-y-4`}>
              <div className="flex flex-wrap justify-between gap-2 items-start">
                <div>
                  <p className="text-amber-700 font-semibold">
                    {t("admin.reviews.ratingPrefix")}: {rev.rating}/5
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-mono break-all">
                    {rev.id}
                  </p>
                  <p className="text-xs text-teal-800 font-medium">
                    {reviewSourceLabel(rev.sourceType)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {rev.sourceType === "CONSULTATION"
                      ? t("admin.common.consultation")
                      : t("admin.common.booking")}
                    :{" "}
                    <span className="font-mono break-all">
                      {rev.sourceType === "CONSULTATION"
                        ? rev.consultationId
                        : rev.bookingId}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(rev.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
                <StatusChip
                  label={rev.isHidden ? t("admin.reviews.hiddenChip") : t("admin.reviews.publicChip")}
                  tone={rev.isHidden ? "neutral" : "success"}
                />
              </div>

              {rev.comment ? (
                <blockquote className="text-slate-800 border-l-4 border-teal-200 pl-4 whitespace-pre-wrap text-sm leading-relaxed">
                  {rev.comment}
                </blockquote>
              ) : null}

              {rev.moderationNote ? (
                <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 ring-1 ring-slate-100">
                  <span className="font-medium text-slate-800">
                    {t("admin.reviews.moderationNotePrefix")}{" "}
                  </span>
                  {rev.moderationNote}
                </p>
              ) : null}

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-800">
                  {t("admin.reviews.moderationNoteLabel")}
                </label>
                <textarea
                  className={`${inputBase} min-h-[72px] resize-y`}
                  placeholder={t("admin.reviews.moderationNotePlaceholder")}
                  value={noteById[rev.id] ?? ""}
                  onChange={(e) =>
                    setNoteById((prev) => ({
                      ...prev,
                      [rev.id]: e.target.value,
                    }))
                  }
                />
                <div className="flex flex-wrap gap-3">
                  {!rev.isHidden ? (
                    <button
                      type="button"
                      disabled={actionId === rev.id}
                      onClick={() => {
                        const note = (noteById[rev.id] ?? "").trim();
                        if (note.length > 0 && note.length < 3) {
                          setError(t("admin.reviews.moderationNoteMin"));
                          return;
                        }
                        setError(null);
                        setHideConfirmId(rev.id);
                      }}
                      className={`${hideBtn} min-h-[44px]`}
                    >
                      {t("admin.reviews.hideBtn")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionId === rev.id}
                      onClick={() => void applyModeration(rev.id, false, "")}
                      className={`${btnPrimary} min-h-[44px]`}
                    >
                      {t("admin.reviews.showAgainBtn")}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={hideConfirmId !== null}
        title={t("admin.reviews.hideConfirmTitle")}
        description={t("admin.reviews.hideConfirmDesc")}
        confirmLabel={t("admin.reviews.hideConfirmYes")}
        cancelLabel={t("admin.common.cancelNo")}
        variant="danger"
        loading={hideConfirmId !== null && actionId === hideConfirmId}
        onConfirm={() => {
          if (!hideConfirmId) return;
          void applyModeration(
            hideConfirmId,
            true,
            noteById[hideConfirmId] ?? "",
          ).finally(() => setHideConfirmId(null));
        }}
        onCancel={() => {
          if (actionId === null) setHideConfirmId(null);
        }}
      />
    </main>
  );
}
