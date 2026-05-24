export const THERAPIST_BROWSE_SORT_VALUES = [
  "newest",
  "name_asc",
  "name_desc",
  "visit_fee_asc",
  "visit_fee_desc",
  "consultation_fee_asc",
  "consultation_fee_desc",
  "rating_desc",
  "rating_asc",
] as const;

export type TherapistBrowseSort = (typeof THERAPIST_BROWSE_SORT_VALUES)[number];

export type TherapistBrowseParams = {
  search: string;
  categoryId: string;
  onlineOnly: boolean;
  sort: TherapistBrowseSort;
  minRating: number | null;
  page: number;
};

export const DEFAULT_THERAPIST_BROWSE: TherapistBrowseParams = {
  search: "",
  categoryId: "",
  onlineOnly: false,
  sort: "newest",
  minRating: null,
  page: 1,
};

export const THERAPIST_BROWSE_PAGE_SIZE = 12;

export function isTherapistBrowseSort(value: string): value is TherapistBrowseSort {
  return (THERAPIST_BROWSE_SORT_VALUES as readonly string[]).includes(value);
}

export function parseTherapistBrowseParams(
  searchParams: URLSearchParams,
): TherapistBrowseParams {
  const q = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("category") ?? "";
  const onlineOnly =
    searchParams.get("online") === "1" || searchParams.get("online") === "true";
  const sortRaw = searchParams.get("sort") ?? "newest";
  const sort = isTherapistBrowseSort(sortRaw) ? sortRaw : "newest";
  const minRatingRaw = searchParams.get("minRating");
  const minRatingParsed =
    minRatingRaw != null && minRatingRaw !== ""
      ? Number.parseInt(minRatingRaw, 10)
      : NaN;
  const minRating =
    Number.isFinite(minRatingParsed) &&
    minRatingParsed >= 1 &&
    minRatingParsed <= 5
      ? minRatingParsed
      : null;
  const pageRaw = searchParams.get("page");
  const pageParsed =
    pageRaw != null && pageRaw !== "" ? Number.parseInt(pageRaw, 10) : 1;
  const page = Number.isFinite(pageParsed) && pageParsed >= 1 ? pageParsed : 1;

  return {
    search: q,
    categoryId,
    onlineOnly,
    sort,
    minRating,
    page,
  };
}

export function serializeTherapistBrowseParams(
  params: TherapistBrowseParams,
): string {
  const q = new URLSearchParams();
  const search = params.search.trim();
  if (search) q.set("q", search);
  if (params.categoryId) q.set("category", params.categoryId);
  if (params.onlineOnly) q.set("online", "1");
  if (params.sort !== "newest") q.set("sort", params.sort);
  if (params.minRating != null) q.set("minRating", String(params.minRating));
  if (params.page > 1) q.set("page", String(params.page));
  return q.toString();
}

export function therapistBrowseParamsEqual(
  a: TherapistBrowseParams,
  b: TherapistBrowseParams,
): boolean {
  return (
    a.search === b.search &&
    a.categoryId === b.categoryId &&
    a.onlineOnly === b.onlineOnly &&
    a.sort === b.sort &&
    a.minRating === b.minRating &&
    a.page === b.page
  );
}
