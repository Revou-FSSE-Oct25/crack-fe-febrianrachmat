"use client";

import {
  adminPageShell,
  AdminBreadcrumb,
  AlertBanner,
  btnDanger,
  btnOutline,
  btnPrimary,
  cardSurface,
  EmptyState,
  inputBase,
  ListSkeleton,
  PageHeader,
  ConfirmDialog,
  PageLoading,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import { validateCategoryName } from "@/lib/validation";
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
  const { t } = useLanguage();
  const toast = useToast();
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
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listCategories();
      setItems(list);
    } catch (err) {
      setItems([]);
      setError(
        err instanceof ApiRequestError ? err.message : t("admin.categories.errLoad"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isReady || user?.role !== "ADMIN") return;
    void load();
  }, [isReady, user?.role, load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = createName.trim();
    const createValidation = validateCategoryName(name);
    if (!createValidation.ok) {
      setError(createValidation.message);
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
      toast.success(t("admin.categories.toastAdded"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("admin.categories.errAdd"),
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
    const editValidation = validateCategoryName(name);
    if (!editValidation.ok) {
      setError(editValidation.message);
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
      toast.success(t("admin.categories.toastUpdated"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("admin.categories.errSave"),
      );
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDeleteCategory() {
    if (!deleteConfirm) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteCategory(deleteConfirm.id);
      if (editingId === deleteConfirm.id) cancelEdit();
      setDeleteConfirm(null);
      toast.success(t("admin.categories.toastDeleted"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("admin.categories.errDelete"),
      );
    } finally {
      setDeleting(false);
    }
  }

  if (!isReady) {
    return <PageLoading label={t("admin.common.loading")} />;
  }

  if (!user) {
    return (
      <SignInRequired message={t("admin.categories.signIn")} />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className={adminPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader
            eyebrow="Admin"
            title={t("admin.common.accessDenied")}
            description={t("admin.common.onlyAdmin")}
          />
          <Link
            href="/"
            className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            {t("admin.common.backHome")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={adminPageShell}>
      <AdminBreadcrumb />

      <PageHeader
        eyebrow="Admin"
        title={t("admin.categories.title")}
        description={t("admin.categories.description")}
      />

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      <section
        id="tambah-kategori"
        className={`${cardSurface} space-y-4 scroll-mt-24`}
      >
        <h2 className="text-lg font-semibold text-slate-900">{t("admin.categories.addCategory")}</h2>
        <form onSubmit={handleCreate} className="space-y-3 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              {t("admin.common.name")}
            </label>
            <input
              required
              minLength={3}
              maxLength={100}
              className={inputBase}
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              {t("admin.categories.descOptionalLabel")}
            </label>
            <textarea
              maxLength={500}
              className={`${inputBase} min-h-[88px] resize-y`}
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className={`${btnPrimary} min-h-[44px]`}
          >
            {creating ? t("admin.common.saving") : t("admin.common.save")}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{t("admin.categories.categoryList")}</h2>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className={`${btnOutline} min-h-[44px] shrink-0 px-5`}
          >
            {t("admin.common.reload")}
          </button>
        </div>

        {loading ? (
          <ListSkeleton rows={3} />
        ) : items.length === 0 ? (
          <EmptyState
            title={t("admin.categories.noCategories")}
            hint={t("admin.categories.noCategoriesHint")}
            actions={[
              { href: "#tambah-kategori", label: t("admin.categories.addFirstCategory") },
            ]}
          />
        ) : (
          <ul className="space-y-4">
            {items.map((c) => (
              <li key={c.id} className={`${cardSurface} space-y-3`}>
                {editingId === c.id ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1.5">
                        {t("admin.common.name")}
                      </label>
                      <input
                        minLength={3}
                        maxLength={100}
                        className={inputBase}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1.5">
                        {t("admin.categories.descLabel")}
                      </label>
                      <textarea
                        maxLength={500}
                        className={`${inputBase} min-h-[80px] resize-y`}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={savingId === c.id}
                        onClick={() => void handleSaveEdit(c.id)}
                        className={btnPrimary}
                      >
                        {t("admin.common.save")}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className={btnOutline}
                      >
                        {t("admin.common.cancel")}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap justify-between gap-2">
                      <h3 className="font-semibold text-lg text-slate-900">
                        {c.name}
                      </h3>
                      <span className="text-xs font-mono text-slate-400 break-all">
                        {c.id}
                      </span>
                    </div>
                    {c.description ? (
                      <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                        {c.description}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className={btnOutline}
                      >
                        {t("admin.categories.editBtn")}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({ id: c.id, label: c.name })
                        }
                        className={`${btnDanger} min-h-[44px]`}
                      >
                        {t("admin.categories.deleteBtn")}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={deleteConfirm !== null}
        title={
          deleteConfirm
            ? `${t("admin.categories.deletePrefix")} "${deleteConfirm.label}"?`
            : t("admin.categories.deleteTitle")
        }
        description={t("admin.categories.deleteDesc")}
        confirmLabel={t("admin.categories.deleteConfirmYes")}
        cancelLabel={t("admin.common.cancelNo")}
        variant="danger"
        loading={deleting}
        onConfirm={() => void confirmDeleteCategory()}
        onCancel={() => {
          if (!deleting) setDeleteConfirm(null);
        }}
      />
    </main>
  );
}
