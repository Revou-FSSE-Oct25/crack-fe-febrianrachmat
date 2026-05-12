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

function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
    return <p className="text-gray-600 text-center py-8">Memuat…</p>;
  }

  if (!user) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-700">
          Silakan masuk sebagai pasien untuk membuat booking.
        </p>
        <Link href="/login" className="text-teal-600 font-medium underline">
          Masuk
        </Link>
      </div>
    );
  }

  if (user.role !== "PATIENT") {
    return (
      <p className="text-center text-gray-700">
        Hanya akun pasien yang dapat membuat booking melalui halaman ini.
      </p>
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
    <form className="max-w-xl mx-auto space-y-4" onSubmit={handleSubmit}>
      {listError && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
          {listError}
        </p>
      )}
      {submitError && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
          {submitError}
        </p>
      )}
      {submitSuccess && (
        <p className="text-green-700 text-sm bg-green-50 border border-green-100 rounded p-3">
          {submitSuccess}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Filter kategori
        </label>
        <select
          className="border p-3 w-full rounded"
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
        <label className="block text-sm font-medium mb-1">
          Fisioterapis
        </label>
        <select
          required
          className="border p-3 w-full rounded"
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

      <div>
        <label className="block text-sm font-medium mb-1">Tipe janji</label>
        <select
          className="border p-3 w-full rounded"
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
        <label className="block text-sm font-medium mb-1">
          Slot tersedia (opsional)
        </label>
        {slotsLoading ? (
          <p className="text-sm text-gray-600">Memuat slot…</p>
        ) : slotsError ? (
          <p className="text-sm text-red-600">{slotsError}</p>
        ) : (
          <select
            className="border p-3 w-full rounded"
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
        <label className="block text-sm font-medium mb-1">
          Waktu janji (wajib jika tidak memilih slot)
        </label>
        <input
          type="datetime-local"
          className="border p-3 w-full rounded"
          value={appointmentDateLocal}
          onChange={(e) => setAppointmentDateLocal(e.target.value)}
          disabled={Boolean(slotId)}
        />
      </div>

      {appointmentType === "CLINIC_VISIT" && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Alamat klinik (min. 10 karakter)
          </label>
          <textarea
            required
            className="border p-3 w-full rounded min-h-[88px]"
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
          />
        </div>
      )}

      {appointmentType === "HOME_VISIT" && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Alamat kunjungan rumah (min. 10 karakter)
          </label>
          <textarea
            required
            className="border p-3 w-full rounded min-h-[88px]"
            value={homeVisitAddress}
            onChange={(e) => setHomeVisitAddress(e.target.value)}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Catatan</label>
        <textarea
          className="border p-3 w-full rounded min-h-[80px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={submitLoading || listLoading}
        className="bg-teal-500 text-white px-6 py-3 rounded w-full disabled:opacity-60"
      >
        {submitLoading ? "Mengirim…" : "Buat booking"}
      </button>
    </form>
  );
}
