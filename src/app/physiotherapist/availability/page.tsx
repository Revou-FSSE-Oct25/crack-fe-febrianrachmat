"use client";

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
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-6 text-center">
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  if (user.role !== "PHYSIOTHERAPIST") {
    return (
      <main className="max-w-3xl mx-auto py-16 px-6">
        <p>Untuk fisioterapis.</p>
        <Link href="/" className="text-teal-600 underline">
          Beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-12 px-6 space-y-8">
      <div>
        <Link
          href="/physiotherapist/profile"
          className="text-sm text-teal-700 hover:underline"
        >
          ← Profil fisioterapis
        </Link>
        <h1 className="text-3xl font-bold mt-2">Slot ketersediaan</h1>
        <p className="text-sm text-gray-600 mt-1">
          POST/GET/DELETE /physiotherapists/me/availability-slots
        </p>
        <p className="text-xs text-teal-900 mt-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2">
          Selama halaman ini terbuka, status &quot;online&quot; dikirim otomatis
          setiap menit (POST /physiotherapists/me/online) agar pasien bisa
          memfilter terapis yang sedang aktif di aplikasi.
        </p>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
          {error}
        </p>
      )}

      <section className="border rounded-xl p-6 bg-white shadow-sm space-y-4">
        <h2 className="font-semibold">Tambah slot</h2>
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Tanggal</label>
            <input
              type="date"
              required
              className="border rounded-lg w-full p-3"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mulai</label>
            <input
              type="time"
              required
              className="border rounded-lg w-full p-3"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Selesai</label>
            <input
              type="time"
              required
              className="border rounded-lg w-full p-3"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-teal-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {creating ? "Menyimpan…" : "Tambah slot"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-4">Daftar slot</h2>
        {loading ? (
          <p className="text-gray-600">Memuat…</p>
        ) : slots.length === 0 ? (
          <p className="text-gray-600">Belum ada slot.</p>
        ) : (
          <ul className="space-y-3">
            {slots.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap justify-between gap-3 items-center border rounded-lg p-4"
              >
                <div>
                  <p className="font-medium">
                    {new Date(s.startTime).toLocaleString()} —{" "}
                    {new Date(s.endTime).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {s.isAvailable ? "Tersedia" : "Tidak tersedia"}
                  </p>
                  <p className="text-xs font-mono text-gray-400">{s.id}</p>
                </div>
                <button
                  type="button"
                  disabled={deletingId === s.id}
                  onClick={() => void remove(s.id)}
                  className="text-sm text-red-700 border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 disabled:opacity-50"
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
