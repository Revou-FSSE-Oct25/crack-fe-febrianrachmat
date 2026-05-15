"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { browsePhysiotherapists } from "@/lib/api/physiotherapists";
import { listCategories } from "@/lib/api/categories";
import type { Category, PhysiotherapistBrowseItem } from "@/lib/api/types";
import {
  AlertBanner,
  btnPrimary,
  cardSurface,
  EmptyState,
  inputBase,
  PageHeader,
  PageLoading,
  pageShell,
  SignInRequired,
} from "@/components/ui/page-shell";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function isTherapistOnlineNow(t: PhysiotherapistBrowseItem): boolean {
  if (!t.onlineUntil) return false;
  return new Date(t.onlineUntil) > new Date();
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, browse] = await Promise.all([
        listCategories(),
        browsePhysiotherapists({
          categoryId: categoryId || undefined,
          search: searchInput.trim() || undefined,
          onlineNow: onlineOnly ? true : undefined,
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
  }, [categoryId, searchInput, onlineOnly]);

  useEffect(() => {
    if (!isReady || !user) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, user, categoryId, onlineOnly]);

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return (
      <SignInRequired message="Masuk untuk melihat daftar fisioterapis terverifikasi." />
    );
  }

  return (
    <main className={`${pageShell} space-y-8 pb-16`}>
      <PageHeader
        eyebrow="Jaringan"
        title="Cari fisioterapis"
        description={
          <>
            Profil yang tampil sudah <strong>APPROVED</strong>. Centang
            &quot;Hanya online&quot; untuk terapis yang sedang aktif di dashboard
            (heartbeat ~5 menit).
          </>
        }
      />

      <div className={`${cardSurface} space-y-5`}>
        <div className="flex flex-col lg:flex-row flex-wrap gap-4 lg:items-end">
          <div className="min-w-[160px]">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Kategori
            </label>
            <select
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
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Cari
            </label>
            <input
              className={inputBase}
              placeholder="Nama atau kata kunci"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className={btnPrimary}
          >
            Terapkan
          </button>
        </div>
        <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlineOnly}
            onChange={(e) => setOnlineOnly(e.target.checked)}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          Hanya terapis online sekarang
        </label>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
            aria-hidden
          />
          Memuat daftar…
        </p>
      ) : items.length === 0 ? (
        <EmptyState
          title="Tidak ada hasil"
          hint="Ubah filter, matikan &quot;Hanya online&quot;, atau kosongkan pencarian lalu Terapkan lagi."
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {items.map((t) => (
            <li key={t.id}>
              <div
                className={`${cardSurface} h-full flex flex-col transition-shadow duration-200 hover:shadow-[0_8px_30px_rgb(15_23_42_/_0.08)]`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t.user.fullName}
                  </h2>
                  {isTherapistOnlineNow(t) ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  ) : null}
                </div>
                {t.category ? (
                  <p className="text-sm font-medium text-teal-700 mt-1">
                    {t.category.name}
                  </p>
                ) : null}
                {t.bio ? (
                  <p className="text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed flex-1">
                    {t.bio}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 mt-3 italic flex-1">
                    Belum ada bio singkat.
                  </p>
                )}
                <Link
                  href={`/therapists/${t.id}`}
                  className="mt-5 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
                >
                  Lihat detail &amp; ulasan →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
