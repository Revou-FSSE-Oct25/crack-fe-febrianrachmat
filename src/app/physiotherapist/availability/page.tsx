"use client";

import {
  AlertBanner,
  btnOutline,
  btnPrimary,
  cardSurface,
  EmptyState,
  inputBase,
  PageHeader,
  PageLoading,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
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

const therapistWideShell =
  "max-w-3xl mx-auto py-10 sm:py-14 px-4 sm:px-6 lg:px-8 space-y-8 pb-16";

export default function PhysiotherapistAvailabilityPage() {
  const { user, isReady } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        err instanceof ApiRequestError ? err.message : "Gagal memuat slot.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady || user?.role !== "PHYSIOTHERAPIST") return;
    void load();
  }, [isReady, user?.role, load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!slotDate) {
      setError("Pilih tanggal.");
      return;
    }
    const startIso = toIsoFromDateAndTime(slotDate, startTime);
    const endIso = toIsoFromDateAndTime(slotDate, endTime);
    if (new Date(startIso) >= new Date(endIso)) {
      setError("Waktu mulai harus sebelum selesai.");
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
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal membuat slot.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus slot ini?")) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteMyAvailabilitySlot(id);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal menghapus.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message="Silakan masuk untuk mengelola slot ketersediaan." />;
  }

  if (user.role !== "PHYSIOTHERAPIST") {
    return (
      <main className={therapistWideShell}>
        <div className={`${cardSurface} space-y-4`}>
          <PageHeader
            eyebrow="Jadwal"
            title="Akses terbatas"
            description="Halaman ini hanya untuk akun fisioterapis."
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
    <main className={therapistWideShell}>
      <div className="flex flex-col gap-2">
        <Link
          href="/physiotherapist/profile"
          className="inline-flex text-sm font-medium text-teal-700 hover:text-teal-800 self-start"
        >
          ← Profil fisioterapis
        </Link>
        <PageHeader
          eyebrow="Fisioterapis"
          title="Slot ketersediaan"
          description="Tambahkan rentang waktu yang bisa dipesan pasien. Pastikan waktu mulai lebih awal dari selesai."
        />
      </div>

      <div
        className="rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 text-xs text-teal-950 shadow-sm ring-1 ring-teal-900/5"
        role="note"
      >
        Selama halaman ini terbuka, status &quot;online&quot; dikirim otomatis
        setiap menit agar pasien dapat memfilter terapis yang sedang aktif.
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="font-semibold text-slate-900">Tambah slot</h2>
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Tanggal
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
              Mulai
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
              Selesai
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
              {creating ? "Menyimpan…" : "Tambah slot"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-slate-900">Daftar slot</h2>
        {loading ? (
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
              aria-hidden
            />
            Memuat…
          </p>
        ) : slots.length === 0 ? (
          <EmptyState
            title="Belum ada slot"
            hint="Tambahkan slot pertama agar pasien dapat memilih waktu janji."
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
                    {s.isAvailable ? "Tersedia" : "Tidak tersedia"}
                  </p>
                  <p className="text-xs font-mono text-slate-400 break-all">
                    {s.id}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={deletingId === s.id}
                  onClick={() => void remove(s.id)}
                  className={`${btnOutline} border-red-200 text-red-800 hover:bg-red-50`}
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
