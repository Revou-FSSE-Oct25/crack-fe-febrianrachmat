import type { PhysiotherapistBrowseItem, PaginationMeta } from "./types";
import { apiFetch, apiFetchPaginated } from "./client";

/** Query selaras `BrowsePhysiotherapistsQueryDto` */
export type BrowsePhysiotherapistsParams = {
  categoryId?: string;
  search?: string;
  /** When true, only therapists with a recent dashboard heartbeat (online). */
  onlineNow?: boolean;
  page?: number;
  limit?: number;
};

function toQuery(params: BrowsePhysiotherapistsParams): string {
  const q = new URLSearchParams();
  if (params.categoryId) q.set("categoryId", params.categoryId);
  if (params.search) q.set("search", params.search);
  if (params.onlineNow === true) q.set("onlineNow", "true");
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function browsePhysiotherapists(
  params: BrowsePhysiotherapistsParams = {},
): Promise<{ items: PhysiotherapistBrowseItem[]; meta: PaginationMeta }> {
  const { data, meta } = await apiFetchPaginated<PhysiotherapistBrowseItem>(
    `/physiotherapists${toQuery(params)}`,
  );
  return { items: data, meta };
}

/** GET /physiotherapists/:profileId — profil terapis disetujui (publik). */
export async function getPhysiotherapistById(
  profileId: string,
): Promise<PhysiotherapistBrowseItem> {
  return apiFetch<PhysiotherapistBrowseItem>(
    `/physiotherapists/${profileId}`,
  );
}
