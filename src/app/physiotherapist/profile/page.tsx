"use client";

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
    if (clinicAddress.trim().length >= 10) {
      body.clinicAddress = clinicAddress.trim();
    }

    setSaving(true);
    try {
      await updateMyPhysiotherapistProfile(body);
      setSuccess("Profil disimpan. Status verifikasi dapat kembali ke menunggu review admin.");
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
    return (
      <main className="max-w-2xl mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto py-16 px-6 text-center">
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  if (user.role !== "PHYSIOTHERAPIST") {
    return (
      <main className="max-w-2xl mx-auto py-16 px-6">
        <p>Halaman ini untuk akun fisioterapis.</p>
        <Link href="/" className="text-teal-600 underline">
          Beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-6 space-y-6">
      <div>
        <Link
          href="/physiotherapist/availability"
          className="text-sm text-teal-700 hover:underline"
        >
          Kelola slot jadwal →
        </Link>
        <h1 className="text-3xl font-bold mt-2">Profil fisioterapis</h1>
        <p className="text-sm text-gray-600 mt-1">
          PATCH /physiotherapists/me — isi sesuai validasi DTO (min. panjang
          teks, dll.)
        </p>
        <p className="text-xs text-teal-900 mt-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2">
          Tab ini juga menjaga status &quot;online&quot; untuk pasien (ping
          otomatis setiap menit).
        </p>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-800 text-sm bg-green-50 border border-green-100 rounded p-3">
          {success}
        </p>
      )}

      {loading ? (
        <p className="text-gray-600">Memuat…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select
              className="border rounded-lg w-full p-3"
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
            <label className="block text-sm font-medium mb-1">
              Bio (min. 10 karakter jika diisi)
            </label>
            <textarea
              className="border rounded-lg w-full p-3 min-h-[100px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Pendidikan (min. 5 karakter jika diisi)
            </label>
            <textarea
              className="border rounded-lg w-full p-3 min-h-[80px]"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tahun pengalaman (0–60)
            </label>
            <input
              type="number"
              min={0}
              max={60}
              className="border rounded-lg w-full p-3"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              URL sertifikasi
            </label>
            <input
              className="border rounded-lg w-full p-3"
              value={certificationUrl}
              onChange={(e) => setCertificationUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Nomor lisensi (min. 5 karakter jika diisi)
            </label>
            <input
              className="border rounded-lg w-full p-3"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Biaya konsultasi
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="border rounded-lg w-full p-3"
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Alamat klinik (min. 10 karakter jika diisi)
            </label>
            <textarea
              className="border rounded-lg w-full p-3 min-h-[88px]"
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {saving ? "Menyimpan…" : "Simpan profil"}
          </button>
        </form>
      )}
    </main>
  );
}
