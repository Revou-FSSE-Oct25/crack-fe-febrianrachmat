"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { browsePhysiotherapists } from "@/lib/api/physiotherapists";
import { listCategories } from "@/lib/api/categories";
import type { Category, PhysiotherapistBrowseItem } from "@/lib/api/types";
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
import { useCallback, useEffect, useState } from "react";

function isTherapistOnlineNow(t: PhysiotherapistBrowseItem): boolean {
  if (!t.onlineUntil) return false;
  return new Date(t.onlineUntil) > new Date();
}

function formatVisitRupiah(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function TherapistsBrowsePage() {
  const { user, isReady } = useAuth();
  const [items, setItems] = useState<PhysiotherapistBrowseItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (overrides?: {
      categoryId?: string;
      search?: string;
      onlineOnly?: boolean;
    }) => {
      const cat = overrides?.categoryId ?? categoryId;
      const search = overrides?.search ?? searchInput;
      const online = overrides?.onlineOnly ?? onlineOnly;

      setLoading(true);
      setError(null);
      try {
        const [cats, browse] = await Promise.all([
          listCategories(),
          browsePhysiotherapists({
            categoryId: cat || undefined,
            search: search.trim() || undefined,
            onlineNow: online ? true : undefined,
            limit: 30,
            page: 1,
          }),
        ]);
        setCategories(cats);
        setItems(browse.items);
      } catch (err) {
        setItems([]);
        setError(
          err instanceof ApiRequestError ? err.message : "Gagal memuat data.",
        );
      } finally {
        setLoading(false);
      }
    },
    [categoryId, searchInput, onlineOnly],
  );

  useEffect(() => {
    if (!isReady || !user) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, user, categoryId, onlineOnly]);

  function resetFilters() {
    setCategoryId("");
    setSearchInput("");
    setOnlineOnly(false);
    void load({ categoryId: "", search: "", onlineOnly: false });
  }

  const hasActiveFilters =
    Boolean(categoryId) || Boolean(searchInput.trim()) || onlineOnly;

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return (
      <SignInRequired message="Masuk untuk melihat daftar fisioterapis terverifikasi." />
    );
  }

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Jaringan"
          title="Cari fisioterapis"
          description={
            <>
              Profil yang tampil sudah <strong>APPROVED</strong>. Centang
              &quot;Hanya online&quot; untuk terapis yang sedang aktif di
              dashboard (heartbeat ~5 menit).
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
          {hasActiveFilters ? (
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
          className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
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
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`${btnPrimary} min-h-[44px] w-full justify-center sm:w-auto sm:min-w-[9rem] lg:self-end`}
          >
            {loading ? "Memuat…" : "Terapkan"}
          </button>
        </form>

        <label className="flex min-h-[44px] cursor-pointer select-none items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={onlineOnly}
            onChange={(e) => setOnlineOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          Hanya terapis online sekarang
        </label>
      </section>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {!loading && items.length > 0 ? (
        <p className="text-sm text-slate-600" role="status">
          Menampilkan <strong className="text-slate-900">{items.length}</strong>{" "}
          fisioterapis
          {hasActiveFilters ? " (sesuai filter)" : ""}.
        </p>
      ) : null}

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Tidak ada hasil"
          hint="Coba ubah filter atau kosongkan pencarian, lalu terapkan lagi."
          actions={
            hasActiveFilters
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
                <p className="mt-2 text-xs text-slate-500">
                  Visit {formatVisitRupiah(t.visitFee)} · Konsultasi{" "}
                  {formatVisitRupiah(t.consultationFee)}
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
      )}
    </main>
  );
}
