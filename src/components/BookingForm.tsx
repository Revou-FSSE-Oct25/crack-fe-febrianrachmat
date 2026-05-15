"use client";

import { useAuth } from "@/contexts/auth-context";
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
import { useCallback, useEffect, useState } from "react";
import {
  AlertBanner,
  btnPrimary,
  inputBase,
} from "@/components/ui/page-shell";

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
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

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
        <Link href="/login" className={`${btnPrimary} inline-flex`}>
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
    setSubmitSuccess(null);

    if (!physiotherapistId) {
      setSubmitError("Pilih fisioterapis.");
      return;
    }

    const selectedSlot = slots.find((s) => s.id === slotId);

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
    } else {
      setSubmitError(
        "Pilih slot tersedia atau isi tanggal & waktu janji manual.",
      );
      return;
    }

    const clinic = clinicAddress.trim();
    const home = homeVisitAddress.trim();

    if (appointmentType === "CLINIC_VISIT" && clinic.length < 10) {
      setSubmitError(
        "Alamat klinik wajib minimal 10 karakter untuk kunjungan klinik.",
      );
      return;
    }
    if (appointmentType === "HOME_VISIT" && home.length < 10) {
      setSubmitError(
        "Alamat kunjungan rumah wajib minimal 10 karakter untuk home visit.",
      );
      return;
    }

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
      setSubmitSuccess("Booking berhasil dibuat.");
      setSlotId("");
      setAppointmentDateLocal("");
      setNotes("");
    } catch (err) {
      setSubmitError(
        err instanceof ApiRequestError ? err.message : "Booking gagal.",
      );
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <form className="max-w-xl mx-auto space-y-5" onSubmit={handleSubmit}>
      {listError ? <AlertBanner variant="error">{listError}</AlertBanner> : null}
      {submitError ? (
        <AlertBanner variant="error">{submitError}</AlertBanner>
      ) : null}
      {submitSuccess ? (
        <AlertBanner variant="success">{submitSuccess}</AlertBanner>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Filter kategori
        </label>
        <select
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
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Fisioterapis
        </label>
        <select
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

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Tipe janji
        </label>
        <select
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
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Waktu janji (wajib jika tidak memilih slot)
        </label>
        <input
          type="datetime-local"
          className={inputBase}
          value={appointmentDateLocal}
          onChange={(e) => setAppointmentDateLocal(e.target.value)}
          disabled={Boolean(slotId)}
        />
      </div>

      {appointmentType === "CLINIC_VISIT" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Alamat klinik (min. 10 karakter)
          </label>
          <textarea
            required
            className={`${inputBase} min-h-[88px]`}
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
          />
        </div>
      )}

      {appointmentType === "HOME_VISIT" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Alamat kunjungan rumah (min. 10 karakter)
          </label>
          <textarea
            required
            className={`${inputBase} min-h-[88px]`}
            value={homeVisitAddress}
            onChange={(e) => setHomeVisitAddress(e.target.value)}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Catatan
        </label>
        <textarea
          className={`${inputBase} min-h-[80px]`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={submitLoading || listLoading}
        className={`${btnPrimary} w-full py-3`}
      >
        {submitLoading ? "Mengirim…" : "Buat booking"}
      </button>
    </form>
  );
}
