"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { browsePhysiotherapists } from "@/lib/api/physiotherapists";
import { listCategories } from "@/lib/api/categories";
import type { Category, PhysiotherapistBrowseItem } from "@/lib/api/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function TherapistsBrowsePage() {
  const { user, isReady } = useAuth();
  const [items, setItems] = useState<PhysiotherapistBrowseItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
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
  }, [categoryId, searchInput]);

  useEffect(() => {
    if (!isReady || !user) return;
    void load();
    // Hanya muat ulang otomatis saat kategori/login berubah; pencarian lewat tombol Terapkan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, user, categoryId]);

  if (!isReady) {
    return (
      <main className="max-w-5xl mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-5xl mx-auto py-16 px-6 text-center space-y-4">
        <p>Masuk untuk melihat daftar fisioterapis terverifikasi.</p>
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto py-12 px-6 space-y-8">
      <h1 className="text-3xl font-bold">Cari fisioterapis</h1>
      <p className="text-sm text-gray-600">
        GET /physiotherapists — hanya profil APPROVED.
      </p>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Kategori</label>
          <select
            className="border rounded-lg p-2 min-w-[160px]"
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
          <label className="block text-sm font-medium mb-1">Cari</label>
          <input
            className="border rounded-lg p-2 w-full"
            placeholder="Nama atau kata kunci"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg"
        >
          Terapkan
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border rounded p-3">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-600">Memuat…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600">Tidak ada hasil.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {items.map((t) => (
            <li key={t.id} className="border rounded-xl p-5 shadow-sm bg-white">
              <h2 className="text-lg font-semibold">{t.user.fullName}</h2>
              {t.category && (
                <p className="text-sm text-teal-700">{t.category.name}</p>
              )}
              {t.bio && (
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                  {t.bio}
                </p>
              )}
              <Link
                href={`/therapists/${t.id}`}
                className="inline-block mt-4 text-teal-700 font-medium text-sm hover:underline"
              >
                Lihat detail &amp; ulasan →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
