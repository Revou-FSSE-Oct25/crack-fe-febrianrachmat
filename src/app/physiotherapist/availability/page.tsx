"use client";

import {
  AlertBanner,
  btnOutline,
  btnPrimary,
  cardSurface,
  EmptyState,
  inputBase,
  ConfirmDialog,
  PageHeader,
  PageLoading,
  SignInRequired,
  widePageShell,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/contexts/toast-context";
import { useTherapistOnlineHeartbeat } from "@/hooks/use-therapist-online-heartbeat";
import { ApiRequestError } from "@/lib/api/client";
import {
  createMyAvailabilitySlot,
  deleteMyAvailabilitySlot,
  listMyAvailabilitySlots,
  type AvailabilitySlotItem,
} from "@/lib/api/availability-slots";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function toIsoFromDateAndTime(dateYmd: string, timeHm: string): string {
  const [y, mo, d] = dateYmd.split("-").map((x) => parseInt(x, 10));
  const [hh, mm] = timeHm.split(":").map((x) => parseInt(x, 10));
  const dt = new Date(y, mo - 1, d, hh, mm, 0, 0);
  return dt.toISOString();
}

export default function PhysiotherapistAvailabilityPage() {
  const { user, isReady } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [slots, setSlots] = useState<AvailabilitySlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  useTherapistOnlineHeartbeat(
    Boolean(isReady && user?.role === "PHYSIOTHERAPIST"),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await listMyAvailabilitySlots({
        page: 1,
        limit: 100,
      });
      setSlots(items);
    } catch (err) {
      setSlots([]);
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("physio.avail.errorLoad"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isReady || user?.role !== "PHYSIOTHERAPIST") return;
    void load();
  }, [isReady, user?.role, load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!slotDate) {
      setError(t("physio.avail.pickDate"));
      return;
    }
    const startIso = toIsoFromDateAndTime(slotDate, startTime);
    const endIso = toIsoFromDateAndTime(slotDate, endTime);
    if (new Date(startIso) >= new Date(endIso)) {
      setError(t("physio.avail.startBeforeEnd"));
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createMyAvailabilitySlot({
        slotDate,
        startTime: startIso,
        endTime: endIso,
      });
      toast.success(t("physio.avail.created"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("physio.avail.errorCreate"),
      );
    } finally {
      setCreating(false);
    }
  }

  async function confirmRemoveSlot() {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeletingId(id);
    setError(null);
    try {
      await deleteMyAvailabilitySlot(id);
      setDeleteConfirmId(null);
      toast.success(t("physio.avail.deleted"));
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("physio.avail.errorDelete"),
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message={t("physio.avail.signInRequired")} />;
  }

  if (user.role !== "PHYSIOTHERAPIST") {
    return (
      <main className={`${widePageShell} pb-16`}>
        <div className="mx-auto max-w-3xl space-y-8">
          <div className={`${cardSurface} space-y-4`}>
            <PageHeader
              eyebrow={t("physio.avail.restrictedEyebrow")}
              title={t("physio.restrictedTitle")}
              description={t("physio.restrictedDesc")}
            />
            <Link
              href="/"
              className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              {t("physio.backHome")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${widePageShell} pb-16`}>
      <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/physiotherapist/profile"
          className="inline-flex text-sm font-medium text-teal-700 hover:text-teal-800 self-start"
        >
          {t("physio.avail.backToProfile")}
        </Link>
        <PageHeader
          eyebrow={t("physio.eyebrow")}
          title={t("physio.avail.title")}
          description={t("physio.avail.description")}
        />
      </div>

      <div
        className="rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 text-xs text-teal-950 shadow-sm ring-1 ring-teal-900/5"
        role="note"
      >
        {t("physio.avail.onlineNote")}
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      <section
        id="tambah-slot"
        className={`${cardSurface} space-y-4 scroll-mt-24`}
      >
        <h2 className="font-semibold text-slate-900">{t("physio.avail.addSlot")}</h2>
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              {t("physio.avail.date")}
            </label>
            <input
              type="date"
              required
              className={inputBase}
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              {t("physio.avail.start")}
            </label>
            <input
              type="time"
              required
              className={inputBase}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              {t("physio.avail.end")}
            </label>
            <input
              type="time"
              required
              className={inputBase}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className={btnPrimary}
            >
              {creating ? t("physio.saving") : t("physio.avail.addSlot")}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-slate-900">{t("physio.avail.slotList")}</h2>
        {loading ? (
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
              aria-hidden
            />
            {t("physio.loading")}
          </p>
        ) : slots.length === 0 ? (
          <EmptyState
            title={t("physio.avail.emptyTitle")}
            hint={t("physio.avail.emptyHint")}
            actions={[
              { href: "#tambah-slot", label: t("physio.avail.addSlotNow") },
            ]}
          />
        ) : (
          <ul className="space-y-3">
            {slots.map((s) => (
              <li
                key={s.id}
                className={`${cardSurface} flex flex-wrap justify-between gap-3 items-center py-4`}
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {new Date(s.startTime).toLocaleString("id-ID")} —{" "}
                    {new Date(s.endTime).toLocaleTimeString("id-ID")}
                  </p>
                  <p className="text-sm text-slate-600">
                    {s.isAvailable
                      ? t("physio.avail.available")
                      : t("physio.avail.unavailable")}
                  </p>
                  <p className="text-xs font-mono text-slate-400 break-all">
                    {s.id}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={deletingId === s.id}
                  onClick={() => setDeleteConfirmId(s.id)}
                  className={`${btnOutline} min-h-[44px] border-red-200 text-red-800 hover:bg-red-50`}
                >
                  {t("physio.avail.delete")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>

      <ConfirmDialog
        open={deleteConfirmId !== null}
        title={t("physio.avail.confirmTitle")}
        description={t("physio.avail.confirmDesc")}
        confirmLabel={t("physio.avail.confirmYes")}
        cancelLabel={t("physio.avail.confirmNo")}
        variant="danger"
        loading={deleteConfirmId !== null && deletingId === deleteConfirmId}
        onConfirm={() => void confirmRemoveSlot()}
        onCancel={() => {
          if (deletingId === null) setDeleteConfirmId(null);
        }}
      />
    </main>
  );
}
