"use client";

import {
  AlertBanner,
  btnOutline,
  cardSurface,
  EmptyState,
  ListSkeleton,
  PageHeader,
  PageLoading,
  SignInRequired,
  StatusChip,
  widePageShell,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  listCalendarBookings,
  type CalendarBookingItem,
} from "@/lib/api/bookings-calendar";
import {
  dayOfMonthKey,
  monthBoundsIso,
  monthLabel,
  shiftMonth,
} from "@/lib/calendar/month-bounds";
import {
  bookingStatusMeta,
  formatAppointmentType,
} from "@/lib/status-meta";
import { formatIdr } from "@/lib/format/currency";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

function groupByDay(items: CalendarBookingItem[]): Map<number, CalendarBookingItem[]> {
  const map = new Map<number, CalendarBookingItem[]>();
  for (const item of items) {
    const day = dayOfMonthKey(item.appointmentDate);
    const list = map.get(day) ?? [];
    list.push(item);
    map.set(day, list);
  }
  for (const list of map.values()) {
    list.sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    );
  }
  return map;
}

export default function CalendarPage() {
  const { user, isReady } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [items, setItems] = useState<CalendarBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bounds = monthBoundsIso(year, month);
      const res = await listCalendarBookings(bounds);
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal memuat kalender.",
      );
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    if (!isReady || !user) return;
    void load();
  }, [isReady, user, load]);

  const byDay = useMemo(() => groupByDay(items), [items]);
  const daysInMonth = useMemo(
    () => new Date(year, month, 0).getDate(),
    [year, month],
  );

  function goMonth(delta: number) {
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return (
      <SignInRequired message="Silakan masuk untuk melihat kalender janji temu." />
    );
  }

  const roleHint =
    user.role === "PATIENT"
      ? "Janji temu Anda dengan fisioterapis. Pengingat H-1 dikirim lewat notifikasi in-app (sekitar 24 jam sebelum waktu janji)."
      : user.role === "PHYSIOTHERAPIST"
        ? "Jadwal kunjungan pasien Anda. Pengingat H-1 dikirim ke Anda dan pasien lewat notifikasi."
        : "Semua janji temu dalam rentang bulan (admin).";

  return (
    <main className={`${widePageShell} space-y-6 pb-16`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Janji temu"
          title="Kalender"
          description={roleHint}
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/bookings" className={`${btnOutline} min-h-[44px] px-4`}>
            Daftar booking
          </Link>
          {user.role === "PATIENT" ? (
            <Link
              href="/appointment"
              className={`${btnOutline} min-h-[44px] border-teal-200 bg-teal-50 px-4 text-teal-900`}
            >
              Janji baru
            </Link>
          ) : null}
        </div>
      </div>

      <div
        className={`${cardSurface} flex flex-wrap items-center justify-between gap-3 px-4 py-3`}
      >
        <button
          type="button"
          className={`${btnOutline} min-h-[40px] px-3`}
          onClick={() => goMonth(-1)}
          aria-label="Bulan sebelumnya"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {monthLabel(year, month)}
        </h2>
        <button
          type="button"
          className={`${btnOutline} min-h-[40px] px-3`}
          onClick={() => goMonth(1)}
          aria-label="Bulan berikutnya"
        >
          →
        </button>
        <button
          type="button"
          className={`${btnOutline} min-h-[40px] px-3 text-sm`}
          onClick={() => {
            setYear(now.getFullYear());
            setMonth(now.getMonth() + 1);
          }}
        >
          Hari ini
        </button>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Tidak ada janji di bulan ini"
          hint="Buat booking baru atau pilih bulan lain."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dayItems = byDay.get(day);
            if (!dayItems?.length) return null;
            const isToday =
              day === now.getDate() &&
              month === now.getMonth() + 1 &&
              year === now.getFullYear();
            return (
              <section
                key={day}
                className={`${cardSurface} p-4 ${isToday ? "ring-2 ring-teal-400/80" : ""}`}
              >
                <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {day}
                  {isToday ? (
                    <span className="ml-2 text-xs font-medium text-teal-700">
                      Hari ini
                    </span>
                  ) : null}
                </h3>
                <ul className="space-y-3">
                  {dayItems.map((b) => {
                    const meta = bookingStatusMeta(b.status);
                    return (
                      <li
                        key={b.id}
                        className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/50"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusChip label={meta.label} tone={meta.tone} />
                          <span className="text-xs text-slate-500">
                            {formatAppointmentType(b.appointmentType)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {new Date(b.appointmentDate).toLocaleString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" · "}
                          {b.counterpartyName}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {b.locationLabel}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatIdr(Number(b.visitFeeSnapshot))}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
