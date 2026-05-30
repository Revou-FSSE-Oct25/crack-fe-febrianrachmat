"use client";

import { useLanguage } from "@/contexts/language-context";

type TherapistStarRatingProps = {
  averageRating: number | null | undefined;
  reviewCount: number | null | undefined;
  className?: string;
};

export function TherapistStarRating({
  averageRating,
  reviewCount,
  className = "",
}: TherapistStarRatingProps) {
  const { t } = useLanguage();
  const count = reviewCount ?? 0;
  if (count === 0 || averageRating == null) {
    return (
      <p className={`text-xs text-slate-500 ${className}`.trim()}>
        {t("ther.noReviews")}
      </p>
    );
  }

  const fullStars = Math.round(averageRating);
  const stars = "★".repeat(Math.min(5, Math.max(0, fullStars))).padEnd(5, "☆");

  return (
    <p
      className={`text-xs text-amber-800 ${className}`.trim()}
      aria-label={`${t("ther.ratingAvgLabel")} ${averageRating} ${t("ther.of")} ${count} ${t("ther.reviewsWord")}`}
    >
      <span className="tracking-tight text-amber-500" aria-hidden>
        {stars}
      </span>{" "}
      <span className="font-semibold tabular-nums">{averageRating.toFixed(1)}</span>
      <span className="text-slate-500"> ({count} {t("ther.reviewsWord")})</span>
    </p>
  );
}
