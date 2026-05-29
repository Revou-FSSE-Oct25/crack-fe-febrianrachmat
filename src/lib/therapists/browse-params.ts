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
  minExperienceYears: number | null;
  minVisitFee: number | null;
  maxVisitFee: number | null;
  minConsultationFee: number | null;
  maxConsultationFee: number | null;
  availableDay: number | null;
  availableHour: number | null;
  page: number;
};

export const DEFAULT_THERAPIST_BROWSE: TherapistBrowseParams = {
  search: "",
  categoryId: "",
  onlineOnly: false,
  sort: "newest",
  minRating: null,
  minExperienceYears: null,
  minVisitFee: null,
  maxVisitFee: null,
  minConsultationFee: null,
  maxConsultationFee: null,
  availableDay: null,
  availableHour: null,
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
  const parseOptionalInt = (key: string, min: number, max?: number) => {
    const raw = searchParams.get(key);
    const parsed = raw != null && raw !== "" ? Number.parseInt(raw, 10) : NaN;
    if (!Number.isFinite(parsed) || parsed < min) return null;
    if (max != null && parsed > max) return null;
    return parsed;
  };
  const minExperienceYears = parseOptionalInt("minExperienceYears", 0);
  const minVisitFee = parseOptionalInt("minVisitFee", 0);
  const maxVisitFee = parseOptionalInt("maxVisitFee", 0);
  const minConsultationFee = parseOptionalInt("minConsultationFee", 0);
  const maxConsultationFee = parseOptionalInt("maxConsultationFee", 0);
  const availableDay = parseOptionalInt("availableDay", 0, 6);
  const availableHour = parseOptionalInt("availableHour", 0, 23);
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
    minExperienceYears,
    minVisitFee,
    maxVisitFee,
    minConsultationFee,
    maxConsultationFee,
    availableDay,
    availableHour,
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
  if (params.minExperienceYears != null) {
    q.set("minExperienceYears", String(params.minExperienceYears));
  }
  if (params.minVisitFee != null) q.set("minVisitFee", String(params.minVisitFee));
  if (params.maxVisitFee != null) q.set("maxVisitFee", String(params.maxVisitFee));
  if (params.minConsultationFee != null) {
    q.set("minConsultationFee", String(params.minConsultationFee));
  }
  if (params.maxConsultationFee != null) {
    q.set("maxConsultationFee", String(params.maxConsultationFee));
  }
  if (params.availableDay != null) q.set("availableDay", String(params.availableDay));
  if (params.availableHour != null) {
    q.set("availableHour", String(params.availableHour));
  }
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
    a.minExperienceYears === b.minExperienceYears &&
    a.minVisitFee === b.minVisitFee &&
    a.maxVisitFee === b.maxVisitFee &&
    a.minConsultationFee === b.minConsultationFee &&
    a.maxConsultationFee === b.maxConsultationFee &&
    a.availableDay === b.availableDay &&
    a.availableHour === b.availableHour &&
    a.page === b.page
  );
}
