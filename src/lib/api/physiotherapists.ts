import type { TherapistBrowseSort } from "@/lib/therapists/browse-params";
import type { PhysiotherapistBrowseItem, PaginationMeta } from "./types";
import { apiFetch, apiFetchPaginated } from "./client";

/** Query selaras `BrowsePhysiotherapistsQueryDto` */
export type BrowsePhysiotherapistsParams = {
  categoryId?: string;
  search?: string;
  /** When true, only therapists with a recent dashboard heartbeat (online). */
  onlineNow?: boolean;
  sort?: TherapistBrowseSort;
  minRating?: number;
  page?: number;
  limit?: number;
};

function asRecord(item: unknown): Record<string, unknown> {
  return item != null && typeof item === "object"
    ? (item as Record<string, unknown>)
    : {};
}

export function mapPhysiotherapistBrowseItem(
  item: unknown,
): PhysiotherapistBrowseItem {
  const r = asRecord(item);
  const user = asRecord(r.user);
  const category =
    r.category != null && typeof r.category === "object"
      ? (r.category as PhysiotherapistBrowseItem["category"])
      : null;
  return {
    id: String(r.id ?? ""),
    bio: r.bio != null ? String(r.bio) : null,
    education: r.education != null ? String(r.education) : undefined,
    experienceYears:
      r.experienceYears != null ? Number(r.experienceYears) : undefined,
    clinicAddress:
      r.clinicAddress != null ? String(r.clinicAddress) : null,
    consultationFee: r.consultationFee as string | number | null,
    visitFee: r.visitFee as string | number | null,
    verificationStatus: r.verificationStatus as
      | PhysiotherapistBrowseItem["verificationStatus"]
      | undefined,
    onlineUntil:
      r.onlineUntil != null ? String(r.onlineUntil) : null,
    averageRating:
      r.averageRating != null ? Number(r.averageRating) : null,
    reviewCount:
      r.reviewCount != null ? Number(r.reviewCount) : undefined,
    user: {
      id: String(user.id ?? ""),
      fullName: String(user.fullName ?? ""),
      email: String(user.email ?? ""),
      phoneNumber:
        user.phoneNumber != null ? String(user.phoneNumber) : null,
    },
    category,
  };
}

function toQuery(params: BrowsePhysiotherapistsParams): string {
  const q = new URLSearchParams();
  if (params.categoryId) q.set("categoryId", params.categoryId);
  if (params.search) q.set("search", params.search);
  if (params.onlineNow === true) q.set("onlineNow", "true");
  if (params.sort) q.set("sort", params.sort);
  if (params.minRating != null) q.set("minRating", String(params.minRating));
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function browsePhysiotherapists(
  params: BrowsePhysiotherapistsParams = {},
): Promise<{ items: PhysiotherapistBrowseItem[]; meta: PaginationMeta }> {
  const { data, meta } = await apiFetchPaginated<unknown>(
    `/physiotherapists${toQuery(params)}`,
  );
  return {
    items: data.map((row) => mapPhysiotherapistBrowseItem(row)),
    meta,
  };
}

/** GET /physiotherapists/:profileId — profil terapis disetujui (publik). */
export async function getPhysiotherapistById(
  profileId: string,
): Promise<PhysiotherapistBrowseItem> {
  const raw = await apiFetch<unknown>(`/physiotherapists/${profileId}`);
  return mapPhysiotherapistBrowseItem(raw);
}
