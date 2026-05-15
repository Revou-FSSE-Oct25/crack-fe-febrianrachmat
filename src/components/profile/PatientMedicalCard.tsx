"use client";

import {
  AlertBanner,
  btnPrimary,
  cardSurface,
} from "@/components/ui/page-shell";
import { FieldError, inputWithFieldError } from "@/components/ui/field-error";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import {
  getMyPatientProfile,
  updateMyPatientProfile,
  type UpdatePatientProfileBody,
} from "@/lib/api/patient-me";
import type { PatientProfile } from "@/lib/api/types";
import { validatePatientProfileUpdate, type FieldErrors } from "@/lib/validation";
import { clearFieldError } from "@/lib/validation/form-helpers";
import { useCallback, useEffect, useState } from "react";

const labelClass = "block text-sm font-medium mb-1 text-slate-700";

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

type PatientMedicalCardProps = {
  enabled: boolean;
  onSaved?: (profile: PatientProfile) => void;
};

export function PatientMedicalCard({
  enabled,
  onSaved,
}: PatientMedicalCardProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const applyProfile = useCallback((p: PatientProfile) => {
    setDateOfBirth(toDateInputValue(p.dateOfBirth));
    setGender(p.gender ?? "");
    setAddress(p.address ?? "");
    setEmergencyContactName(p.emergencyContactName ?? "");
    setEmergencyContactPhone(p.emergencyContactPhone ?? "");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getMyPatientProfile();
      applyProfile(profile);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal memuat data medis.",
      );
    } finally {
      setLoading(false);
    }
  }, [applyProfile]);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavedMsg(null);
    setError(null);

    const validation = validatePatientProfileUpdate({
      dateOfBirth,
      gender,
      address,
      emergencyContactName,
      emergencyContactPhone,
    });
    if (!validation.ok) {
      setError(validation.message);
      setFieldErrors(validation.fieldErrors ?? {});
      return;
    }
    setFieldErrors({});

    const body: UpdatePatientProfileBody = {};
    const dob = dateOfBirth.trim();
    if (dob) body.dateOfBirth = dob;
    const g = gender.trim();
    if (g) body.gender = g as UpdatePatientProfileBody["gender"];
    const addr = address.trim();
    if (addr) body.address = addr;
    const ecName = emergencyContactName.trim();
    if (ecName) body.emergencyContactName = ecName;
    const ecPhone = emergencyContactPhone.trim();
    if (ecPhone) body.emergencyContactPhone = ecPhone;

    setSaving(true);
    try {
      const updated = await updateMyPatientProfile(body);
      applyProfile(updated);
      setSavedMsg("Data medis disimpan.");
      toast.success("Data medis diperbarui.");
      onSaved?.(updated);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Gagal menyimpan data medis.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!enabled) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className={`${cardSurface} mx-auto max-w-lg space-y-6`}
    >
      <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Data medis & kontak darurat
        </h2>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          Informasi ini membantu fisioterapis memahami kebutuhan Anda. Semua
          kolom opsional.
        </p>

        {error ? (
          <AlertBanner variant="error" className="mt-4">
            {error}
          </AlertBanner>
        ) : null}
        {savedMsg ? (
          <AlertBanner variant="success" className="mt-4">
            {savedMsg}
          </AlertBanner>
        ) : null}

        {loading ? (
          <div className="mt-4 space-y-3 animate-pulse">
            <div className="h-10 rounded-xl bg-slate-100" />
            <div className="h-10 rounded-xl bg-slate-100" />
            <div className="h-10 rounded-xl bg-slate-100" />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="patient-dob" className={labelClass}>
                Tanggal lahir
              </label>
              <input
                id="patient-dob"
                type="date"
                className={inputWithFieldError(Boolean(fieldErrors.dateOfBirth))}
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  clearFieldError(setFieldErrors, "dateOfBirth");
                }}
                disabled={saving}
              />
              <FieldError message={fieldErrors.dateOfBirth} />
            </div>
            <div>
              <label htmlFor="patient-gender" className={labelClass}>
                Jenis kelamin
              </label>
              <select
                id="patient-gender"
                className={inputWithFieldError(Boolean(fieldErrors.gender))}
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  clearFieldError(setFieldErrors, "gender");
                }}
                disabled={saving}
              >
                <option value="">— Pilih —</option>
                <option value="M">Laki-laki</option>
                <option value="F">Perempuan</option>
                <option value="OTHER">Lainnya</option>
              </select>
              <FieldError message={fieldErrors.gender} />
            </div>
            <div>
              <label htmlFor="patient-address" className={labelClass}>
                Alamat
              </label>
              <textarea
                id="patient-address"
                rows={2}
                className={`${inputWithFieldError(Boolean(fieldErrors.address))} resize-y min-h-[4.5rem]`}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  clearFieldError(setFieldErrors, "address");
                }}
                placeholder="Jl. Contoh No. 10, Jakarta"
                disabled={saving}
              />
              <FieldError message={fieldErrors.address} />
            </div>
            <div>
              <label htmlFor="patient-ec-name" className={labelClass}>
                Nama kontak darurat
              </label>
              <input
                id="patient-ec-name"
                className={inputWithFieldError(
                  Boolean(fieldErrors.emergencyContactName),
                )}
                value={emergencyContactName}
                onChange={(e) => {
                  setEmergencyContactName(e.target.value);
                  clearFieldError(setFieldErrors, "emergencyContactName");
                }}
                placeholder="Contoh: Siti Santoso"
                disabled={saving}
              />
              <FieldError message={fieldErrors.emergencyContactName} />
            </div>
            <div>
              <label htmlFor="patient-ec-phone" className={labelClass}>
                Telepon kontak darurat
              </label>
              <input
                id="patient-ec-phone"
                type="tel"
                className={inputWithFieldError(
                  Boolean(fieldErrors.emergencyContactPhone),
                )}
                value={emergencyContactPhone}
                onChange={(e) => {
                  setEmergencyContactPhone(e.target.value);
                  clearFieldError(setFieldErrors, "emergencyContactPhone");
                }}
                placeholder="08123456789"
                disabled={saving}
              />
              <FieldError message={fieldErrors.emergencyContactPhone} />
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
        <button
          type="submit"
          disabled={saving || loading}
          className={`${btnPrimary} min-h-[44px] justify-center sm:min-w-[10rem]`}
        >
          {saving ? "Menyimpan…" : "Simpan data medis"}
        </button>
      </div>
    </form>
  );
}
