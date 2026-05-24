"use client";

import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { actionSuccessWithNotify } from "@/lib/notifications/action-feedback";
import { ApiRequestError } from "@/lib/api/client";
import {
  listAvailabilitySlotsForProfile,
  type AvailabilitySlotItem,
} from "@/lib/api/availability-slots";
import { createBooking } from "@/lib/api/bookings";
import { listCategories } from "@/lib/api/categories";
import { browsePhysiotherapists } from "@/lib/api/physiotherapists";
import type {
  AppointmentType,
  Category,
  PhysiotherapistBrowseItem,
} from "@/lib/api/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AlertBanner,
  btnPrimary,
  btnSecondary,
  inputBase,
} from "@/components/ui/page-shell";
import { validateBookingCreate } from "@/lib/validation";

function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatVisitRupiah(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function BookingForm() {
  const { user, isReady } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [therapists, setTherapists] = useState<PhysiotherapistBrowseItem[]>(
    [],
  );
  const [slots, setSlots] = useState<AvailabilitySlotItem[]>([]);

  const [listLoading, setListLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [physiotherapistId, setPhysiotherapistId] = useState("");
  const [appointmentType, setAppointmentType] =
    useState<AppointmentType>("CLINIC_VISIT");
  const [slotId, setSlotId] = useState("");
  const [appointmentDateLocal, setAppointmentDateLocal] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [homeVisitAddress, setHomeVisitAddress] = useState("");
  const [notes, setNotes] = useState("");

  const loadLists = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const [cats, browse] = await Promise.all([
        listCategories(),
        browsePhysiotherapists({
          categoryId: categoryId || undefined,
          limit: 50,
          page: 1,
        }),
      ]);
      setCategories(cats);
      setTherapists(browse.items);
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.status === 403
            ? "Peran akun Anda tidak dapat mengakses daftar fisioterapis di endpoint ini (diperlukan Pasien atau Admin)."
            : err.message
          : "Gagal memuat data.";
      setListError(msg);
    } finally {
      setListLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (!isReady || !user || user.role !== "PATIENT") return;
    void loadLists();
  }, [isReady, user, loadLists]);

  const selectedTherapist = therapists.find((t) => t.id === physiotherapistId);

  useEffect(() => {
    if (!physiotherapistId || user?.role !== "PATIENT") {
      setSlots([]);
      setSlotId("");
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);
    listAvailabilitySlotsForProfile(physiotherapistId, {
      page: 1,
      limit: 50,
      from: `${todayISODate()}T00:00:00.000Z`,
    })
      .then((res) => {
        if (!cancelled) setSlots(res.items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSlotsError(
            err instanceof ApiRequestError ? err.message : "Gagal memuat slot.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [physiotherapistId, user?.role]);

  useEffect(() => {
    setClinicAddress("");
    setHomeVisitAddress("");
  }, [physiotherapistId]);

  useEffect(() => {
    if (appointmentType === "CLINIC_VISIT" && selectedTherapist?.clinicAddress) {
      const a = selectedTherapist.clinicAddress.trim();
      if (a.length >= 10) setClinicAddress(a);
    }
  }, [appointmentType, selectedTherapist]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center gap-3 py-12 text-slate-600">
        <span
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
          aria-hidden
        />
        <span className="text-sm font-medium">Memuat…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center space-y-5 py-4">
        <p className="text-slate-700 leading-relaxed">
          Silakan masuk sebagai <strong>pasien</strong> untuk membuat booking.
        </p>
        <Link
          href="/login"
          className={`${btnPrimary} inline-flex min-h-[44px] items-center justify-center px-6`}
        >
          Masuk
        </Link>
      </div>
    );
  }

  if (user.role !== "PATIENT") {
    return (
      <AlertBanner variant="error">
        Hanya akun pasien yang dapat membuat booking melalui halaman ini.
      </AlertBanner>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const selectedSlot = slots.find((s) => s.id === slotId);
    const validation = validateBookingCreate({
      physiotherapistId,
      slotId,
      appointmentDateLocal,
      hasSelectedSlot: Boolean(selectedSlot),
      appointmentType,
      clinicAddress,
      homeVisitAddress,
    });
    if (!validation.ok) {
      setSubmitError(validation.message);
      return;
    }

    let appointmentDateIso: string | undefined;
    if (selectedSlot) {
      appointmentDateIso = selectedSlot.startTime;
    } else if (appointmentDateLocal) {
      const d = new Date(appointmentDateLocal);
      if (Number.isNaN(d.getTime())) {
        setSubmitError("Tanggal/janji tidak valid.");
        return;
      }
      appointmentDateIso = d.toISOString();
    }

    const clinic = clinicAddress.trim();
    const home = homeVisitAddress.trim();

    setSubmitLoading(true);
    try {
      await createBooking({
        physiotherapistId,
        appointmentType,
        slotId: selectedSlot ? selectedSlot.id : undefined,
        appointmentDate: appointmentDateIso,
        clinicAddress:
          appointmentType === "CLINIC_VISIT" ? clinic : undefined,
        homeVisitAddress:
          appointmentType === "HOME_VISIT" ? home : undefined,
        notes: notes.trim() || undefined,
      });
      actionSuccessWithNotify(
        toast,
        "Booking dibuat. Menunggu konfirmasi fisioterapis — setelah dikonfirmasi, bayar di halaman Transaksi dengan bukti pembayaran.",
      );
      setSlotId("");
      setAppointmentDateLocal("");
      setNotes("");
      router.push("/bookings");
    } catch (err) {
      setSubmitError(
        err instanceof ApiRequestError ? err.message : "Booking gagal.",
      );
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <form
      className="w-full space-y-8"
      onSubmit={handleSubmit}
      aria-label="Form booking janji temu"
    >
      <div className="space-y-3" aria-live="polite">
        {listError ? <AlertBanner variant="error">{listError}</AlertBanner> : null}
        {submitError ? (
          <AlertBanner variant="error">{submitError}</AlertBanner>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Pilih fisioterapis
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Saring kategori lalu pilih terapis. Tarif di bawah mengikuti snapshot
          profil saat ini.
        </p>
      <div>
        <label
          htmlFor="booking-filter-category"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Filter kategori
        </label>
        <select
          id="booking-filter-category"
          className={inputBase}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={listLoading}
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="booking-physiotherapist"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Fisioterapis
        </label>
        <select
          id="booking-physiotherapist"
          required
          className={inputBase}
          value={physiotherapistId}
          onChange={(e) => {
            setPhysiotherapistId(e.target.value);
            setSlotId("");
          }}
          disabled={listLoading}
        >
          <option value="">— Pilih —</option>
          {therapists.map((t) => (
            <option key={t.id} value={t.id}>
              {t.user.fullName}
              {t.category ? ` · ${t.category.name}` : ""}
            </option>
          ))}
        </select>
      </div>

      {selectedTherapist ? (
        <p className="text-sm text-slate-700 rounded-xl border border-teal-100 bg-teal-50/70 px-4 py-3 leading-relaxed">
          <span className="font-semibold text-teal-900">Tarif terapis ini:</span>{" "}
          konsultasi online {formatVisitRupiah(selectedTherapist.consultationFee)}{" "}
          · visit {formatVisitRupiah(selectedTherapist.visitFee)} (dibekukan pada
          saat booking dibuat).
        </p>
      ) : null}
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Jadwal kunjungan
        </h2>
      <div>
        <label
          htmlFor="booking-appointment-type"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Tipe janji
        </label>
        <select
          id="booking-appointment-type"
          className={inputBase}
          value={appointmentType}
          onChange={(e) =>
            setAppointmentType(e.target.value as AppointmentType)
          }
        >
          <option value="CLINIC_VISIT">Kunjungan klinik</option>
          <option value="HOME_VISIT">Home visit</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="booking-slot"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Slot tersedia (opsional)
        </label>
        {slotsLoading ? (
          <p className="text-sm text-slate-500 flex items-center gap-2 py-2">
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
              aria-hidden
            />
            Memuat slot…
          </p>
        ) : slotsError ? (
          <AlertBanner variant="error">{slotsError}</AlertBanner>
        ) : (
          <select
            id="booking-slot"
            className={inputBase}
            value={slotId}
            onChange={(e) => setSlotId(e.target.value)}
          >
            <option value="">Tanpa slot — gunakan waktu manual di bawah</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
                {new Date(s.startTime).toLocaleString()} –{" "}
                {new Date(s.endTime).toLocaleTimeString()}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label
          htmlFor="booking-appointment-datetime"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Waktu janji (wajib jika tidak memilih slot)
        </label>
        <input
          id="booking-appointment-datetime"
          type="datetime-local"
          className={inputBase}
          value={appointmentDateLocal}
          onChange={(e) => setAppointmentDateLocal(e.target.value)}
          disabled={Boolean(slotId)}
        />
      </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Lokasi &amp; catatan
        </h2>

      {appointmentType === "CLINIC_VISIT" && (
        <div>
          <label
            htmlFor="booking-clinic-address"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Alamat klinik (min. 10 karakter)
          </label>
          <textarea
            id="booking-clinic-address"
            required
            className={`${inputBase} min-h-[88px]`}
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
          />
        </div>
      )}

      {appointmentType === "HOME_VISIT" && (
        <div>
          <label
            htmlFor="booking-home-address"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Alamat kunjungan rumah (min. 10 karakter)
          </label>
          <textarea
            id="booking-home-address"
            required
            className={`${inputBase} min-h-[88px]`}
            value={homeVisitAddress}
            onChange={(e) => setHomeVisitAddress(e.target.value)}
          />
        </div>
      )}

      <div>
        <label
          htmlFor="booking-notes"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Catatan
        </label>
        <textarea
          id="booking-notes"
          className={`${inputBase} min-h-[80px]`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/therapists"
          className={`${btnSecondary} order-2 min-h-[44px] justify-center text-center sm:order-1 sm:min-w-[11rem]`}
        >
          Cari di daftar terapis
        </Link>
        <button
          type="submit"
          disabled={submitLoading || listLoading}
          className={`${btnPrimary} order-1 min-h-[48px] w-full justify-center py-3 sm:order-2 sm:ml-auto sm:w-auto sm:min-w-[12rem]`}
        >
          {submitLoading ? "Mengirim…" : "Buat booking"}
        </button>
      </div>
    </form>
  );
}
