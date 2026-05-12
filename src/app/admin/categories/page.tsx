"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/api/admin-categories";
import { listCategories } from "@/lib/api/categories";
import type { Category } from "@/lib/api/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function AdminCategoriesPage() {
  const { user, isReady } = useAuth();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listCategories();
      setItems(list);
    } catch (err) {
      setItems([]);
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memuat kategori.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady || user?.role !== "ADMIN") return;
    void load();
  }, [isReady, user?.role, load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = createName.trim();
    if (name.length < 3) {
      setError("Nama minimal 3 karakter.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createCategory({
        name,
        description: createDesc.trim() || undefined,
      });
      setCreateName("");
      setCreateDesc("");
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal menambah kategori.",
      );
    } finally {
      setCreating(false);
    }
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDesc(c.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDesc("");
  }

  async function handleSaveEdit(categoryId: string) {
    const name = editName.trim();
    if (name.length < 3) {
      setError("Nama minimal 3 karakter.");
      return;
    }
    setSavingId(categoryId);
    setError(null);
    try {
      await updateCategory(categoryId, {
        name,
        description: editDesc.trim() || undefined,
      });
      cancelEdit();
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal menyimpan.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(categoryId: string, label: string) {
    if (
      !window.confirm(
        `Hapus kategori "${label}"? Tindakan ini tidak bisa dibatalkan jika ada relasi yang memblokir.`,
      )
    ) {
      return;
    }
    setError(null);
    try {
      await deleteCategory(categoryId);
      if (editingId === categoryId) cancelEdit();
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal menghapus.",
      );
    }
  }

  if (!isReady) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-center space-y-4">
        <p>Silakan masuk sebagai admin.</p>
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 space-y-4">
        <h1 className="text-2xl font-bold">Akses ditolak</h1>
        <p className="text-gray-700">Hanya untuk admin.</p>
        <Link href="/" className="text-teal-600 underline">
          Beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-12 px-6 space-y-10">
      <div>
        <Link
          href="/admin/dashboard"
          className="text-sm text-teal-700 hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Kategori</h1>
        <p className="text-gray-600 mt-1 text-sm">
          POST/PATCH/DELETE{" "}
          <code className="bg-gray-100 px-1 rounded text-xs">
            /admin/categories
          </code>{" "}
          · daftar memakai{" "}
          <code className="bg-gray-100 px-1 rounded text-xs">GET /categories</code>
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      <section className="border rounded-xl p-6 bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Tambah kategori</h2>
        <form onSubmit={handleCreate} className="space-y-3 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              required
              minLength={3}
              maxLength={100}
              className="border rounded-lg w-full p-3"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Deskripsi (opsional)
            </label>
            <textarea
              maxLength={500}
              className="border rounded-lg w-full p-3 min-h-[88px]"
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {creating ? "Menyimpan…" : "Simpan"}
          </button>
        </form>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Daftar kategori</h2>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="text-sm border px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            Muat ulang
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Memuat…</p>
        ) : items.length === 0 ? (
          <p className="text-gray-600 border rounded-lg p-8 text-center bg-gray-50">
            Belum ada kategori.
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((c) => (
              <li
                key={c.id}
                className="border rounded-xl p-5 bg-white shadow-sm space-y-3"
              >
                {editingId === c.id ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nama
                      </label>
                      <input
                        minLength={3}
                        maxLength={100}
                        className="border rounded-lg w-full p-3"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        maxLength={500}
                        className="border rounded-lg w-full p-3 min-h-[80px]"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={savingId === c.id}
                        onClick={() => void handleSaveEdit(c.id)}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="border px-4 py-2 rounded-lg text-sm"
                      >
                        Batal
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap justify-between gap-2">
                      <h3 className="font-semibold text-lg">{c.name}</h3>
                      <span className="text-xs font-mono text-gray-400">
                        {c.id}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {c.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="text-sm border px-3 py-1.5 rounded-lg"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(c.id, c.name)}
                        className="text-sm border border-red-200 text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
