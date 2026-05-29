"use client";

import { TherapistStarRating } from "@/components/therapists/TherapistStarRating";
import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { browsePhysiotherapists } from "@/lib/api/physiotherapists";
import { listCategories } from "@/lib/api/categories";
import type { Category, PhysiotherapistBrowseItem, PaginationMeta } from "@/lib/api/types";
import { formatIdr } from "@/lib/format/currency";
import {
  DEFAULT_THERAPIST_BROWSE,
  parseTherapistBrowseParams,
  serializeTherapistBrowseParams,
  THERAPIST_BROWSE_PAGE_SIZE,
  THERAPIST_BROWSE_SORT_VALUES,
  type TherapistBrowseParams,
  type TherapistBrowseSort,
} from "@/lib/therapists/browse-params";
import {
  AlertBanner,
  btnOutline,
  btnPrimary,
  cardSurface,
  CardGridSkeleton,
  EmptyState,
  inputBase,
  PageHeader,
  PageLoading,
  SignInRequired,
  widePageShell,
} from "@/components/ui/page-shell";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

const SORT_LABELS: Record<TherapistBrowseSort, string> = {
  newest: "Terbaru",
  name_asc: "Nama A–Z",
  name_desc: "Nama Z–A",
  visit_fee_asc: "Tarif visit terendah",
  visit_fee_desc: "Tarif visit tertinggi",
  consultation_fee_asc: "Tarif konsultasi terendah",
  consultation_fee_desc: "Tarif konsultasi tertinggi",
  rating_desc: "Rating tertinggi",
  rating_asc: "Rating terendah",
};
const DAY_OPTIONS = [
  { value: 0, label: "Minggu" },
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
] as const;

function isTherapistOnlineNow(t: PhysiotherapistBrowseItem): boolean {
  if (!t.onlineUntil) return false;
  return new Date(t.onlineUntil) > new Date();
}

function hasActiveBrowseFilters(params: TherapistBrowseParams): boolean {
  return (
    Boolean(params.search.trim()) ||
    Boolean(params.categoryId) ||
    params.onlineOnly ||
    params.sort !== "newest" ||
    params.minRating != null ||
    params.minExperienceYears != null ||
    params.minVisitFee != null ||
    params.maxVisitFee != null ||
    params.minConsultationFee != null ||
    params.maxConsultationFee != null ||
    params.availableDay != null ||
    params.availableHour != null
  );
}

function TherapistsBrowsePageContent() {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<TherapistBrowseParams>(
    DEFAULT_THERAPIST_BROWSE,
  );
  const [items, setItems] = useState<PhysiotherapistBrowseItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (params: TherapistBrowseParams) => {
      setLoading(true);
      setError(null);
      try {
        const [cats, browse] = await Promise.all([
          listCategories(),
          browsePhysiotherapists({
            categoryId: params.categoryId || undefined,
            search: params.search.trim() || undefined,
            onlineNow: params.onlineOnly ? true : undefined,
            sort: params.sort,
            minRating: params.minRating ?? undefined,
            minExperienceYears: params.minExperienceYears ?? undefined,
            minVisitFee: params.minVisitFee ?? undefined,
            maxVisitFee: params.maxVisitFee ?? undefined,
            minConsultationFee: params.minConsultationFee ?? undefined,
            maxConsultationFee: params.maxConsultationFee ?? undefined,
            availableDay: params.availableDay ?? undefined,
            availableHour: params.availableHour ?? undefined,
            page: params.page,
            limit: THERAPIST_BROWSE_PAGE_SIZE,
          }),
        ]);
        setCategories(cats);
        setItems(browse.items);
        setMeta(browse.meta);
      } catch (err) {
        setItems([]);
        setMeta(null);
        setError(
          err instanceof ApiRequestError ? err.message : "Gagal memuat data.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isReady || !user) return;
    const parsed = parseTherapistBrowseParams(searchParams);
    setFilters(parsed);
    void load(parsed);
  }, [isReady, user, searchParams, load]);

  function applyBrowse(next: TherapistBrowseParams, replaceUrl = true) {
    const normalized: TherapistBrowseParams = {
      ...next,
      page: next.page < 1 ? 1 : next.page,
    };
    if (replaceUrl) {
      const qs = serializeTherapistBrowseParams(normalized);
      router.replace(qs ? `/therapists?${qs}` : "/therapists");
    } else {
      void load(normalized);
    }
  }

  function resetFilters() {
    applyBrowse(DEFAULT_THERAPIST_BROWSE);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyBrowse({ ...filters, page: 1 });
  }

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;
  const currentPage = meta?.page ?? filters.page;

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return (
      <SignInRequired message="Masuk untuk melihat daftar fisioterapis terverifikasi." />
    );
  }

  const activeFilters = hasActiveBrowseFilters(filters);

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Jaringan"
          title="Cari fisioterapis"
          description={
            <>
              Profil yang tampil sudah <strong>APPROVED</strong>. Gunakan sort,
              rating, dan filter online untuk menemukan terapis yang sesuai
              sebelum membuat janji atau konsultasi.
            </>
          }
        />
        <Link
          href="/appointment"
          className={`${btnPrimary} min-h-[44px] shrink-0 justify-center self-start text-center sm:min-w-[11rem] lg:self-auto`}
        >
          Buat janji temu
        </Link>
      </div>

      <section
        className={`${cardSurface} space-y-5`}
        aria-labelledby="therapist-filter-heading"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="therapist-filter-heading"
            className="text-sm font-semibold tracking-tight text-slate-900"
          >
            Filter &amp; pencarian
          </h2>
          {activeFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className={`${btnOutline} min-h-[40px] self-start px-4 text-sm sm:self-auto`}
            >
              Reset filter
            </button>
          ) : null}
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="min-w-[160px] lg:flex-1 lg:max-w-xs">
              <label
                htmlFor="therapist-category"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Kategori
              </label>
              <select
                id="therapist-category"
                className={inputBase}
                value={filters.categoryId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, categoryId: e.target.value }))
                }
              >
                <option value="">Semua</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[200px] flex-1">
              <label
                htmlFor="therapist-search"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Cari
              </label>
              <input
                id="therapist-search"
                className={inputBase}
                placeholder="Nama atau kata kunci"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
            <div className="min-w-[180px] lg:max-w-[14rem]">
              <label
                htmlFor="therapist-sort"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Urutkan
              </label>
              <select
                id="therapist-sort"
                className={inputBase}
                value={filters.sort}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sort: e.target.value as TherapistBrowseSort,
                  }))
                }
              >
                {THERAPIST_BROWSE_SORT_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {SORT_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[140px] lg:max-w-[10rem]">
              <label
                htmlFor="therapist-min-rating"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Rating min.
              </label>
              <select
                id="therapist-min-rating"
                className={inputBase}
                value={filters.minRating ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilters((prev) => ({
                    ...prev,
                    minRating: v === "" ? null : Number(v),
                  }));
                }}
              >
                <option value="">Semua</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n}+ bintang
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimary} min-h-[44px] w-full justify-center sm:w-auto sm:min-w-[9rem] lg:self-end`}
            >
              {loading ? "Memuat…" : "Terapkan"}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Min pengalaman (tahun)
              </label>
              <input
                type="number"
                min={0}
                className={inputBase}
                value={filters.minExperienceYears ?? ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minExperienceYears:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Visit fee (min)
              </label>
              <input
                type="number"
                min={0}
                className={inputBase}
                value={filters.minVisitFee ?? ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minVisitFee: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Visit fee (max)
              </label>
              <input
                type="number"
                min={0}
                className={inputBase}
                value={filters.maxVisitFee ?? ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxVisitFee: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Konsultasi fee (max)
              </label>
              <input
                type="number"
                min={0}
                className={inputBase}
                value={filters.maxConsultationFee ?? ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxConsultationFee:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Hari tersedia (UTC)
              </label>
              <select
                className={inputBase}
                value={filters.availableDay ?? ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    availableDay: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              >
                <option value="">Semua hari</option>
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Jam tersedia (UTC)
              </label>
              <select
                className={inputBase}
                value={filters.availableHour ?? ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    availableHour:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              >
                <option value="">Semua jam</option>
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex min-h-[44px] cursor-pointer select-none items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.onlineOnly}
              onChange={(e) => {
                const onlineOnly = e.target.checked;
                const next = { ...filters, onlineOnly, page: 1 };
                setFilters(next);
                applyBrowse(next);
              }}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            Hanya terapis online sekarang
          </label>
        </form>
      </section>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {!loading && total > 0 ? (
        <p className="text-sm text-slate-600" role="status">
          Menampilkan{" "}
          <strong className="text-slate-900">
            {(currentPage - 1) * THERAPIST_BROWSE_PAGE_SIZE + 1}–
            {Math.min(currentPage * THERAPIST_BROWSE_PAGE_SIZE, total)}
          </strong>{" "}
          dari <strong className="text-slate-900">{total}</strong> fisioterapis
          {activeFilters ? " (sesuai filter)" : ""}.
        </p>
      ) : null}

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Tidak ada hasil"
          hint="Coba ubah filter, rating minimum, atau urutan sort, lalu terapkan lagi."
          actions={
            activeFilters
              ? [
                  {
                    label: "Reset filter",
                    variant: "primary",
                    onClick: resetFilters,
                  },
                  {
                    href: "/appointment",
                    label: "Buat janji langsung",
                    variant: "secondary",
                  },
                ]
              : [
                  {
                    href: "/services",
                    label: "Lihat layanan",
                    variant: "secondary",
                  },
                ]
          }
        />
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/therapists/${t.id}`}
                  className={`${cardSurface} group flex h-full flex-col transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-teal-200/90 hover:shadow-[0_8px_30px_rgb(15_23_42_/_0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-teal-900">
                      {t.user.fullName}
                    </h3>
                    {isTherapistOnlineNow(t) ? (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/80">
                        <span
                          className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
                          aria-hidden
                        />
                        Online
                      </span>
                    ) : null}
                  </div>
                  {t.category ? (
                    <p className="mt-1 text-sm font-medium text-teal-700">
                      {t.category.name}
                    </p>
                  ) : null}
                  <div className="mt-2">
                    <TherapistStarRating
                      averageRating={t.averageRating}
                      reviewCount={t.reviewCount}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Visit {formatIdr(t.visitFee)} · Konsultasi{" "}
                    {formatIdr(t.consultationFee)}
                  </p>
                  {t.bio ? (
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                      {t.bio}
                    </p>
                  ) : (
                    <p className="mt-3 flex-1 text-sm italic text-slate-400">
                      Belum ada bio singkat.
                    </p>
                  )}
                  <span className="mt-5 inline-flex text-sm font-semibold text-teal-700 group-hover:text-teal-800">
                    Lihat detail &amp; ulasan →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-6"
              aria-label="Paginasi fisioterapis"
            >
              <p className="text-sm text-slate-600">
                Halaman{" "}
                <strong className="text-slate-900">{currentPage}</strong> dari{" "}
                <strong className="text-slate-900">{totalPages}</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={loading || currentPage <= 1}
                  onClick={() =>
                    applyBrowse({ ...filters, page: currentPage - 1 })
                  }
                  className={`${btnOutline} min-h-[44px] px-4 disabled:opacity-50`}
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={loading || currentPage >= totalPages}
                  onClick={() =>
                    applyBrowse({ ...filters, page: currentPage + 1 })
                  }
                  className={`${btnPrimary} min-h-[44px] px-4 disabled:opacity-50`}
                >
                  Berikutnya
                </button>
              </div>
            </nav>
          ) : null}
        </>
      )}
    </main>
  );
}

export default function TherapistsBrowsePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <TherapistsBrowsePageContent />
    </Suspense>
  );
}
