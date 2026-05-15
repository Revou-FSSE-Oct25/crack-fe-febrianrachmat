"use client";

import {
  AlertBanner,
  btnPrimary,
  cardSurface,
  inputBase,
  PageHeader,
  PageLoading,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useTherapistOnlineHeartbeat } from "@/hooks/use-therapist-online-heartbeat";
import { ApiRequestError } from "@/lib/api/client";
import { listCategories } from "@/lib/api/categories";
import type { Category } from "@/lib/api/types";
import {
  getMyPhysiotherapistProfile,
  updateMyPhysiotherapistProfile,
  type UpdatePhysiotherapistProfileBody,
} from "@/lib/api/physiotherapist-me";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const therapistShell =
  "max-w-2xl mx-auto py-10 sm:py-14 px-4 sm:px-6 lg:px-8 space-y-6 pb-16";

export default function PhysiotherapistProfilePage() {
  const { user, isReady } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [certificationUrl, setCertificationUrl] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [visitFee, setVisitFee] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");

  useTherapistOnlineHeartbeat(
    Boolean(isReady && user?.role === "PHYSIOTHERAPIST"),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prof] = await Promise.all([
        listCategories(),
        getMyPhysiotherapistProfile(),
      ]);
      setCategories(cats);
      const p = prof as Record<string, unknown>;
      const catObj = p.category as { id?: string } | null | undefined;
      setCategoryId(
        catObj?.id ??
          (p.categoryId != null ? String(p.categoryId) : ""),
      );
      setBio(p.bio != null ? String(p.bio) : "");
      setEducation(p.education != null ? String(p.education) : "");
      setExperienceYears(
        p.experienceYears != null ? String(p.experienceYears) : "0",
      );
      setCertificationUrl(
        p.certificationUrl != null ? String(p.certificationUrl) : "",
      );
      setLicenseNumber(
        p.licenseNumber != null ? String(p.licenseNumber) : "",
      );
      setConsultationFee(
        p.consultationFee != null ? String(p.consultationFee) : "",
      );
      setVisitFee(p.visitFee != null ? String(p.visitFee) : "");
      setClinicAddress(
        p.clinicAddress != null ? String(p.clinicAddress) : "",
      );
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memuat profil.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady || user?.role !== "PHYSIOTHERAPIST") return;
    void load();
  }, [isReady, user?.role, load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const body: UpdatePhysiotherapistProfileBody = {};
    if (categoryId) body.categoryId = categoryId;
    if (bio.trim().length >= 10) body.bio = bio.trim();
    if (education.trim().length >= 5) body.education = education.trim();
    const exp = parseInt(experienceYears, 10);
    if (!Number.isNaN(exp) && exp >= 0) body.experienceYears = exp;
    if (certificationUrl.trim()) body.certificationUrl = certificationUrl.trim();
    if (licenseNumber.trim().length >= 5) {
      body.licenseNumber = licenseNumber.trim();
    }
    const fee = parseFloat(consultationFee);
    if (!Number.isNaN(fee) && fee >= 0) body.consultationFee = fee;
    const visit = parseFloat(visitFee);
    if (!Number.isNaN(visit) && visit >= 0) body.visitFee = visit;
    if (clinicAddress.trim().length >= 10) {
      body.clinicAddress = clinicAddress.trim();
    }

    setSaving(true);
    try {
      await updateMyPhysiotherapistProfile(body);
      setSuccess(
        "Profil disimpan. Status verifikasi dapat kembali menunggu tinjauan admin.",
      );
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal menyimpan.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message="Silakan masuk untuk mengelola profil fisioterapis." />;
  }

  if (user.role !== "PHYSIOTHERAPIST") {
    return (
      <main className={therapistShell}>
        <div className={`${cardSurface} space-y-4`}>
          <PageHeader
            eyebrow="Profil"
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
    <main className={therapistShell}>
      <div className="flex flex-col gap-2">
        <Link
          href="/physiotherapist/availability"
          className="inline-flex text-sm font-medium text-teal-700 hover:text-teal-800 self-start"
        >
          Kelola slot jadwal →
        </Link>
        <PageHeader
          eyebrow="Fisioterapis"
          title="Profil"
          description="Perbarui bio, tarif, dan data profesional. Isi hanya field yang ingin diubah; validasi panjang minimum tetap berlaku."
        />
      </div>

      <div
        className="rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 text-xs text-teal-950 shadow-sm ring-1 ring-teal-900/5"
        role="note"
      >
        Tab ini juga menjaga status &quot;online&quot; untuk pasien (ping
        otomatis setiap menit).
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}
      {success ? <AlertBanner variant="success">{success}</AlertBanner> : null}

      {loading ? (
        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
            aria-hidden
          />
          Memuat…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className={`${cardSurface} space-y-4`}>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Kategori
            </label>
            <select
              className={inputBase}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">— Pilih —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Bio (min. 10 karakter jika diisi)
            </label>
            <textarea
              className={`${inputBase} min-h-[100px] resize-y`}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Pendidikan (min. 5 karakter jika diisi)
            </label>
            <textarea
              className={`${inputBase} min-h-[80px] resize-y`}
              value={education}
              onChange={(e) => setEducation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Tahun pengalaman (0–60)
            </label>
            <input
              type="number"
              min={0}
              max={60}
              className={inputBase}
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              URL sertifikasi
            </label>
            <input
              className={inputBase}
              value={certificationUrl}
              onChange={(e) => setCertificationUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Nomor lisensi (min. 5 karakter jika diisi)
            </label>
            <input
              className={inputBase}
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Biaya konsultasi online
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputBase}
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Biaya visit (klinik / kunjungan rumah)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputBase}
              value={visitFee}
              onChange={(e) => setVisitFee(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              Alamat klinik (min. 10 karakter jika diisi)
            </label>
            <textarea
              className={`${inputBase} min-h-[88px] resize-y`}
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
            />
          </div>
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? "Menyimpan…" : "Simpan profil"}
          </button>
        </form>
      )}
    </main>
  );
}
