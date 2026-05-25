import { apiFetch } from "./client";
import type { PublicReview, Review } from "./contract";
import { asPublicReviews, asReviews } from "./contract";

export type { PublicReview, Review };

/** Selaras `CreateReviewDto` — kirim tepat satu dari bookingId atau consultationId. */
export type CreateReviewBody = {
  bookingId?: string;
  consultationId?: string;
  rating: number;
  comment?: string;
};

/** Selaras `UpdateReviewDto` */
export type UpdateReviewBody = {
  rating?: number;
  comment?: string;
};

/** Selaras `ModerateReviewDto` */
export type ModerateReviewBody = {
  isHidden: boolean;
  moderationNote?: string;
};

function paginationQuery(params: { page?: number; limit?: number }): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function createReview(body: CreateReviewBody): Promise<Review> {
  const raw = await apiFetch<unknown>("/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asReviews([raw])[0]!;
}

export async function listPublicReviewsForPhysiotherapist(
  physiotherapistProfileId: string,
  params?: { page?: number; limit?: number },
): Promise<PublicReview[]> {
  const raw = await apiFetch<unknown[]>(
    `/physiotherapists/${physiotherapistProfileId}/reviews${paginationQuery(params ?? {})}`,
  );
  return asPublicReviews(raw);
}

export async function listMyReviews(params?: {
  page?: number;
  limit?: number;
}): Promise<Review[]> {
  const raw = await apiFetch<unknown[]>(
    `/reviews/me${paginationQuery(params ?? {})}`,
  );
  return asReviews(raw);
}

export async function updateMyReview(
  reviewId: string,
  body: UpdateReviewBody,
): Promise<Review> {
  const raw = await apiFetch<unknown>(`/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return asReviews([raw])[0]!;
}

export async function deleteMyReview(
  reviewId: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/reviews/${reviewId}`, {
    method: "DELETE",
  });
}

export async function moderateReview(
  reviewId: string,
  body: ModerateReviewBody,
): Promise<Review> {
  const raw = await apiFetch<unknown>(`/admin/reviews/${reviewId}/moderate`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return asReviews([raw])[0]!;
}
