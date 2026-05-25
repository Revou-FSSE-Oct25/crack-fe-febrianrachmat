"use client";

import {
  adminPageShell,
  AdminBreadcrumb,
  AlertBanner,
  btnOutline,
  cardSurface,
  EmptyState,
  inputBase,
  ListSkeleton,
  PageHeader,
  PageLoading,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import {
  auditActionLabel,
  auditEntityLabel,
  AUDIT_ACTION_OPTIONS,
  AUDIT_ENTITY_OPTIONS,
  formatAuditMetadataSummary,
  type AuditAction,
  type AuditEntityType,
} from "@/lib/audit/labels";
import {
  listAdminAuditLogs,
  type AuditLogItem,
} from "@/lib/api/admin-audit-logs";
import { ApiRequestError } from "@/lib/api/client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function AdminAuditLogsPage() {
  const { user, isReady } = useAuth();
  const [rows, setRows] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [action, setAction] = useState<AuditAction | "">("");
  const [entityType, setEntityType] = useState<AuditEntityType | "">("");
  const [entityId, setEntityId] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    action: "" as AuditAction | "",
    entityType: "" as AuditEntityType | "",
    entityId: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminAuditLogs({
        page,
        limit: 25,
        action: appliedFilters.action || undefined,
        entityType: appliedFilters.entityType || undefined,
        entityId: appliedFilters.entityId.trim() || undefined,
      });
      setRows(result.items);
      setTotal(result.meta.total);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      setRows([]);
      setTotal(0);
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal memuat audit log.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilters]);

  useEffect(() => {
    if (!isReady || user?.role !== "ADMIN") return;
    void load();
  }, [isReady, user?.role, load]);

  function applyFilters() {
    setAppliedFilters({
      action,
      entityType,
      entityId,
    });
    setPage(1);
  }

  if (!isReady) {
    return <PageLoading label="Memuat audit log…" />;
  }

  if (!user) {
    return (
      <SignInRequired message="Masuk sebagai admin untuk melihat audit log." />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className={adminPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader
            eyebrow="Admin"
            title="Akses ditolak"
            description="Hanya admin yang dapat membuka halaman ini."
          />
          <Link
            href="/"
            className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            Kembali ke beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={adminPageShell}>
      <AdminBreadcrumb />

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Admin"
          title="Audit log"
          description="Jejak aksi admin dan sistem yang disimpan di database — konfirmasi bayar, refund, moderasi, verifikasi, dan notifikasi."
        />
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className={`${btnOutline} min-h-[44px] shrink-0 px-5`}
        >
          {loading ? "Memuat…" : "Muat ulang"}
        </button>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      <div className={`${cardSurface} grid gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
        <div>
          <label
            htmlFor="audit-filter-action"
            className="block text-sm font-medium text-slate-800 mb-1.5"
          >
            Aksi
          </label>
          <select
            id="audit-filter-action"
            className={inputBase}
            value={action}
            onChange={(e) =>
              setAction(e.target.value as AuditAction | "")
            }
          >
            {AUDIT_ACTION_OPTIONS.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="audit-filter-entity"
            className="block text-sm font-medium text-slate-800 mb-1.5"
          >
            Entitas
          </label>
          <select
            id="audit-filter-entity"
            className={inputBase}
            value={entityType}
            onChange={(e) =>
              setEntityType(e.target.value as AuditEntityType | "")
            }
          >
            {AUDIT_ENTITY_OPTIONS.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="audit-filter-entity-id"
            className="block text-sm font-medium text-slate-800 mb-1.5"
          >
            ID entitas (opsional)
          </label>
          <input
            id="audit-filter-entity-id"
            className={inputBase}
            placeholder="UUID transaksi, ulasan, dll."
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={applyFilters}
            disabled={loading}
            className={`${btnOutline} min-h-[44px] px-5 border-teal-200 bg-teal-50 text-teal-900`}
          >
            Terapkan filter
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-600">
        Menampilkan {rows.length} dari {total} entri
        {totalPages > 1 ? ` · halaman ${page}/${totalPages}` : ""}
      </p>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Belum ada audit log"
          hint="Entri muncul setelah admin mengonfirmasi pembayaran, refund, moderasi ulasan, atau aksi operasional lain yang terhubung."
          actions={[
            { href: "/admin/operations", label: "Panel operasional" },
            {
              href: "/admin/dashboard",
              label: "Dashboard",
              variant: "secondary",
            },
          ]}
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((log) => {
            const summary = formatAuditMetadataSummary(log.metadata);
            return (
              <li key={log.id} className={`${cardSurface} space-y-2`}>
                <div className="flex flex-wrap justify-between gap-2 items-start">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {auditActionLabel(log.action)}
                    </p>
                    <p className="text-xs text-teal-800 font-medium mt-0.5">
                      {auditEntityLabel(log.entityType)}
                    </p>
                  </div>
                  <time
                    className="text-xs text-slate-500 shrink-0"
                    dateTime={log.createdAt}
                  >
                    {new Date(log.createdAt).toLocaleString("id-ID")}
                  </time>
                </div>

                <p className="text-xs font-mono text-slate-600 break-all">
                  Entitas: {log.entityId}
                </p>

                <p className="text-sm text-slate-700">
                  {log.actor ? (
                    <>
                      <span className="font-medium">{log.actor.fullName}</span>
                      <span className="text-slate-500">
                        {" "}
                        ({log.actor.email}) · {log.actor.role}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-500 italic">Sistem / cron</span>
                  )}
                </p>

                {summary ? (
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {summary}
                  </p>
                ) : null}

                {log.metadata && Object.keys(log.metadata).length > 0 ? (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
                      Metadata lengkap
                    </summary>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-3 text-slate-800 border border-slate-100">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`${btnOutline} min-h-[44px] px-4`}
          >
            ← Sebelumnya
          </button>
          <span className="text-sm text-slate-600 tabular-nums">
            Halaman {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className={`${btnOutline} min-h-[44px] px-4`}
          >
            Berikutnya →
          </button>
        </div>
      ) : null}
    </main>
  );
}
