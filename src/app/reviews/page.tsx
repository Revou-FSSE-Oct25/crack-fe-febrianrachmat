"use client";

import {
  AlertBanner,
  btnOutline,
  btnPrimary,
  btnSecondary,
  cardSurface,
  ConfirmDialog,
  EmptyState,
  inputBase,
  ListSkeleton,
  PageHeader,
  PageLoading,
  SignInRequired,
  widePageShell,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  deleteMyReview,
  listMyReviews,
  updateMyReview,
  type Review,
} from "@/lib/api/reviews";
import { reviewSourceLabel } from "@/lib/reviews/labels";
import { validateReviewUpdate } from "@/lib/validation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function MyReviewsPage() {
  const { user, isReady } = useAuth();
  const { t, language } = useLanguage();
  const toast = useToast();
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listMyReviews({ page: 1, limit: 50 });
      setRows(list);
    } catch (err) {
      setRows([]);
      setError(
        err instanceof ApiRequestError ? err.message : t("review.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isReady || user?.role !== "PATIENT") return;
    void load();
  }, [isReady, user?.role, load]);

  function startEdit(rev: Review) {
    setEditingId(rev.id);
    setEditRating(rev.rating);
    setEditComment(rev.comment ?? "");
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
  }

  async function saveEdit(rev: Review) {
    const validation = validateReviewUpdate({
      rating: editRating,
      comment: editComment,
      changeComment: editComment !== (rev.comment ?? ""),
    });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    const body: { rating?: number; comment?: string } = {};
    if (editRating !== rev.rating) {
      body.rating = editRating;
    }
    const trimmed = editComment.trim();
    const prev = (rev.comment ?? "").trim();
    if (trimmed !== prev) {
      body.comment = trimmed;
    }
    if (body.rating === undefined && body.comment === undefined) {
      cancelEdit();
      return;
    }

    setSavingId(rev.id);
    setError(null);
    try {
      await updateMyReview(rev.id, body);
      toast.success(t("review.updateSuccess"));
      setEditingId(null);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("review.updateError"),
      );
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    setDeletingId(deleteConfirmId);
    setError(null);
    try {
      await deleteMyReview(deleteConfirmId);
      setDeleteConfirmId(null);
      if (editingId === deleteConfirmId) setEditingId(null);
      toast.success(t("review.deleteSuccess"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("review.deleteError"),
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return (
      <SignInRequired message={t("review.signInToView")} />
    );
  }

  if (user.role !== "PATIENT") {
    return (
      <main className={`${widePageShell} space-y-6 pb-16`}>
        <PageHeader
          eyebrow={t("review.eyebrow")}
          title={t("review.myReviewsTitle")}
          description={t("review.patientOnlyDesc")}
        />
        <div className={cardSurface}>
          <Link href="/profile" className={`${btnSecondary} min-h-[44px]`}>
            {t("review.backToProfile")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow={t("review.eyebrow")}
          title={t("review.myReviewsTitle")}
          description={t("review.myReviewsDesc")}
        />
        <Link
          href="/reviews/write"
          className={`${btnPrimary} min-h-[44px] justify-center text-center sm:min-w-[10rem]`}
        >
          {t("review.writeNew")}
        </Link>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <ListSkeleton rows={2} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={t("review.emptyTitle")}
          hint={t("review.emptyHint")}
          actions={[
            { href: "/reviews/write", label: t("review.writeReview") },
            {
              href: "/bookings",
              label: t("review.viewBookings"),
              variant: "secondary",
            },
          ]}
        />
      ) : (
        <ul className="space-y-4">
          {rows.map((rev) => {
            const isEditing = editingId === rev.id;
            return (
              <li key={rev.id} className={`${cardSurface} space-y-3`}>
                {isEditing ? (
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void saveEdit(rev);
                    }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1.5">
                        {t("review.ratingLabel")}
                      </label>
                      <select
                        className={inputBase}
                        value={editRating}
                        onChange={(e) => setEditRating(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1.5">
                        {t("review.commentOptional")}
                      </label>
                      <textarea
                        className={`${inputBase} min-h-[100px] resize-y`}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        placeholder={t("review.clearToRemoveComment")}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={savingId === rev.id}
                        className={`${btnPrimary} min-h-[44px] px-5`}
                      >
                        {savingId === rev.id
                          ? t("review.saving")
                          : t("review.saveChanges")}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingId === rev.id}
                        className={`${btnOutline} min-h-[44px] px-5`}
                      >
                        {t("review.cancel")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="text-amber-700 font-semibold">
                          {`${t("review.ratingValueLabel")}: ${rev.rating}/5`}
                        </p>
                        <p className="text-xs text-teal-800 font-medium mt-0.5">
                          {reviewSourceLabel(rev.sourceType, language)}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(rev.createdAt).toLocaleString("id-ID")}
                        {rev.updatedAt !== rev.createdAt
                          ? ` · ${t("review.editedAt")} ${new Date(rev.updatedAt).toLocaleString("id-ID")}`
                          : ""}
                      </span>
                    </div>
                    {rev.isHidden ? (
                      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2">
                        {t("review.hiddenByModeration")}
                        {rev.moderationNote
                          ? ` ${t("review.note")}: ${rev.moderationNote}`
                          : ""}
                      </p>
                    ) : null}
                    <p className="text-xs text-slate-500">
                      {t("review.editDeadline")}{" "}
                      {new Date(rev.editableUntil).toLocaleString("id-ID")}
                      {!rev.isEditableByPatient
                        ? ` ${t("review.editPeriodEnded")}`
                        : ""}
                    </p>
                    {rev.comment ? (
                      <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                        {rev.comment}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 italic">
                        {t("review.noComment")}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 font-mono break-all">
                      {rev.sourceType === "CONSULTATION"
                        ? `${t("review.consultationLabel")}: ${rev.consultationId}`
                        : `${t("review.bookingLabel")}: ${rev.bookingId}`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(rev)}
                        disabled={!rev.isEditableByPatient}
                        className={`${btnSecondary} min-h-[44px] text-sm`}
                      >
                        {t("review.editReview")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(rev.id)}
                        disabled={deletingId === rev.id || !rev.isEditableByPatient}
                        className={`${btnOutline} min-h-[44px] text-sm text-red-800 border-red-200 hover:bg-red-50`}
                      >
                        {t("review.deleteReview")}
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={deleteConfirmId !== null}
        title={t("review.deleteConfirmTitle")}
        description={t("review.deleteConfirmDesc")}
        confirmLabel={t("review.deleteConfirmYes")}
        cancelLabel={t("review.deleteConfirmCancel")}
        variant="danger"
        loading={deleteConfirmId !== null && deletingId === deleteConfirmId}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (deletingId === null) setDeleteConfirmId(null);
        }}
      />
    </main>
  );
}
