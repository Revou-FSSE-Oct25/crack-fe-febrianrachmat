"use client";

import {
  AlertBanner,
  btnPrimary,
  cardSurface,
  EmptyState,
  inputBase,
  PageHeader,
  PageLoading,
  SignInRequired,
  formPageShell,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import { listMyBookings } from "@/lib/api/bookings";
import { listMyConsultations } from "@/lib/api/consultations";
import { createReview } from "@/lib/api/reviews";
import { validateReviewWrite } from "@/lib/validation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type SessionOption = { id: string; status: string };

function asSessions(data: unknown): SessionOption[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      status: String(r.status ?? ""),
    };
  });
}

type ReviewTargetType = "booking" | "consultation";

export default function WriteReviewPage() {
  const { user, isReady } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [completedBookings, setCompletedBookings] = useState<SessionOption[]>(
    [],
  );
  const [completedConsultations, setCompletedConsultations] = useState<
    SessionOption[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [targetType, setTargetType] = useState<ReviewTargetType>("booking");
  const [targetId, setTargetId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsRaw, consultationsRaw] = await Promise.all([
        listMyBookings({ page: 1, limit: 100 }),
        listMyConsultations({ page: 1, limit: 100 }),
      ]);
      const bookings = asSessions(bookingsRaw).filter(
        (b) => b.status === "COMPLETED",
      );
      const consultations = asSessions(consultationsRaw).filter(
        (c) => c.status === "COMPLETED",
      );
      setCompletedBookings(bookings);
      setCompletedConsultations(consultations);
      setTargetId("");
    } catch (err) {
      setCompletedBookings([]);
      setCompletedConsultations([]);
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("review.loadSessionsError"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isReady || user?.role !== "PATIENT") return;
    void load();
  }, [isReady, user?.role, load]);

  const options =
    targetType === "booking" ? completedBookings : completedConsultations;
  const hasAnySession =
    completedBookings.length > 0 || completedConsultations.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateReviewWrite({
      targetType,
      targetId,
      rating,
      comment,
    });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createReview({
        ...(targetType === "booking"
          ? { bookingId: targetId }
          : { consultationId: targetId }),
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success(t("review.submitSuccess"));
      setComment("");
      setTargetId("");
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("review.submitError"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message={t("review.signInToWrite")} />;
  }

  if (user.role !== "PATIENT") {
    return (
      <main className={formPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader
            title={t("review.eyebrow")}
            description={t("review.patientOnlyWriteDesc")}
          />
          <Link
            href="/"
            className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            {t("review.backToHome")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={formPageShell}>
      <PageHeader
        eyebrow={t("review.feedbackEyebrow")}
        title={t("review.writeTitle")}
        description={t("review.writeDesc")}
      />

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}
      {loading ? (
        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
            aria-hidden
          />
          {t("review.loadingSessions")}
        </p>
      ) : !hasAnySession ? (
        <EmptyState
          title={t("review.emptySessionsTitle")}
          hint={t("review.emptySessionsHint")}
          actions={[
            { href: "/bookings", label: t("review.viewBookings") },
            {
              href: "/consultations",
              label: t("review.viewConsultations"),
              variant: "secondary",
            },
          ]}
        />
      ) : (
        <form onSubmit={handleSubmit} className={`${cardSurface} space-y-5`}>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-800 mb-1">
              {t("review.sessionType")}
            </legend>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="targetType"
                checked={targetType === "booking"}
                onChange={() => {
                  setTargetType("booking");
                  setTargetId("");
                }}
                className="text-teal-600"
              />
              <span className="text-sm text-slate-700">
                {`${t("review.visitBookingPrefix")} — ${completedBookings.length} ${t("review.completedCountSuffix")}`}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="targetType"
                checked={targetType === "consultation"}
                onChange={() => {
                  setTargetType("consultation");
                  setTargetId("");
                }}
                className="text-teal-600"
              />
              <span className="text-sm text-slate-700">
                {`${t("review.onlineConsultationPrefix")} — ${completedConsultations.length} ${t("review.completedCountSuffix")}`}
              </span>
            </label>
          </fieldset>

          {options.length === 0 ? (
            <p className="text-sm text-slate-600">
              {targetType === "booking"
                ? t("review.noCompletedBookingType")
                : t("review.noCompletedConsultationType")}
            </p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  {targetType === "booking"
                    ? t("review.bookingLabel")
                    : t("review.consultationLabel")}
                </label>
                <select
                  required
                  className={inputBase}
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                >
                  <option value="">{t("review.selectPlaceholder")}</option>
                  {options.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id.slice(0, 8)}…
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  {t("review.ratingLabel")}
                </label>
                <select
                  className={inputBase}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
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
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !targetId}
                className={`${btnPrimary} w-full`}
              >
                {submitting ? t("review.sending") : t("review.submitReview")}
              </button>
            </>
          )}
        </form>
      )}
    </main>
  );
}
