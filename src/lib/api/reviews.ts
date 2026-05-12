import { apiFetch } from "./client";

/** Selaras `CreateReviewDto` */
export type CreateReviewBody = {
  bookingId: string;
  rating: number;
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

export async function createReview(body: CreateReviewBody): Promise<unknown> {
  return apiFetch<unknown>("/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /physiotherapists/:physiotherapistId/reviews — ulasan publik (isHidden: false di backend) */
export async function listPublicReviewsForPhysiotherapist(
  physiotherapistProfileId: string,
  params?: { page?: number; limit?: number },
): Promise<unknown[]> {
  return apiFetch<unknown[]>(
    `/physiotherapists/${physiotherapistProfileId}/reviews${paginationQuery(params ?? {})}`,
  );
}

/** GET /reviews/me — admin mendapat semua ulasan (lihat `ReviewsService.listMyReviews`) */
export async function listMyReviews(params?: {
  page?: number;
  limit?: number;
}): Promise<unknown[]> {
  return apiFetch<unknown[]>(`/reviews/me${paginationQuery(params ?? {})}`);
}

export async function moderateReview(
  reviewId: string,
  body: ModerateReviewBody,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/reviews/${reviewId}/moderate`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
