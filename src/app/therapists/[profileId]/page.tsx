"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { createConsultation } from "@/lib/api/consultations";
import { browsePhysiotherapists } from "@/lib/api/physiotherapists";
import { listPublicReviewsForPhysiotherapist } from "@/lib/api/reviews";
import type { PhysiotherapistBrowseItem } from "@/lib/api/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function formatRupiah(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

type PublicReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  patientName: string;
};

function asPublicReviews(data: unknown): PublicReviewRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    const patient = r.patient as
      | { user?: { fullName?: string } }
      | undefined;
    return {
      id: String(r.id ?? ""),
      rating: Number(r.rating ?? 0),
      comment: r.comment != null ? String(r.comment) : null,
      createdAt: String(r.createdAt ?? ""),
      patientName: String(patient?.user?.fullName ?? "Pasien"),
    };
  });
}

export default function TherapistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.profileId as string;
  const { user, isReady } = useAuth();

  const [therapist, setTherapist] = useState<PhysiotherapistBrowseItem | null>(
    null,
  );
  const [reviews, setReviews] = useState<PublicReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingConsult, setSubmittingConsult] = useState(false);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [complaint, setComplaint] = useState("");

  const load = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    try {
      const browse = await browsePhysiotherapists({ limit: 200, page: 1 });
      const found = browse.items.find((x) => x.id === profileId) ?? null;
      setTherapist(found);
      const rev = await listPublicReviewsForPhysiotherapist(profileId, {
        page: 1,
        limit: 50,
      });
      setReviews(asPublicReviews(rev));
    } catch (err) {
      setTherapist(null);
      setReviews([]);
      setError(
        err instanceof ApiRequestError ? err.message : "Gagal memuat halaman.",
      );
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    if (!isReady || !user || !profileId) return;
    void load();
  }, [isReady, user, profileId, load]);

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

  return (
    <main className="max-w-3xl mx-auto py-12 px-6 space-y-8">
      <Link href="/therapists" className="text-sm text-teal-700 hover:underline">
        ← Daftar fisioterapis
      </Link>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border rounded p-3">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-600">Memuat…</p>
      ) : !therapist ? (
        <p className="text-gray-600">Profil tidak ditemukan.</p>
      ) : (
        <section className="space-y-3">
          <h1 className="text-3xl font-bold">{therapist.user.fullName}</h1>
          {therapist.category && (
            <p className="text-teal-700">{therapist.category.name}</p>
          )}
          {therapist.bio && (
            <p className="text-gray-800 whitespace-pre-wrap">{therapist.bio}</p>
          )}
          {therapist.clinicAddress && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Klinik: </span>
              {therapist.clinicAddress}
            </p>
          )}
          <p className="text-sm text-gray-600">
            Biaya konsultasi online:{" "}
            <span className="font-medium">
              {formatRupiah(therapist.consultationFee ?? null)}
            </span>
          </p>

          {user.role === "PATIENT" && (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowConsultForm((v) => !v)}
                className="inline-flex items-center rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700 transition-colors"
              >
                Konsultasi online ({formatRupiah(therapist.consultationFee ?? null)})
              </button>
              <Link
                href="/appointment"
                className="inline-flex items-center rounded-lg border border-teal-200 bg-white px-5 py-2 text-teal-800 hover:bg-teal-50 transition-colors"
              >
                Booking visit fisik
              </Link>
            </div>
          )}

          {showConsultForm && user.role === "PATIENT" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (complaint.trim().length < 10) {
                  setError("Keluhan minimal 10 karakter.");
                  return;
                }
                setError(null);
                setSubmittingConsult(true);
                try {
                  await createConsultation({
                    physiotherapistId: profileId,
                    complaint: complaint.trim(),
                  });
                  router.push("/consultations");
                } catch (err) {
                  setError(
                    err instanceof ApiRequestError
                      ? err.message
                      : "Gagal mengirim permintaan konsultasi.",
                  );
                } finally {
                  setSubmittingConsult(false);
                }
              }}
              className="mt-4 rounded-lg border border-teal-100 bg-teal-50/40 p-4 space-y-3"
            >
              <p className="text-sm text-slate-700">
                Alur: kirim keluhan → terapis menerima → kamu bayar{" "}
                <strong>{formatRupiah(therapist.consultationFee ?? null)}</strong>{" "}
                → chat aktif setelah pembayaran dikonfirmasi.
              </p>
              <label className="block text-sm font-medium text-slate-800">
                Keluhan (min. 10 karakter)
                <textarea
                  required
                  minLength={10}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 min-h-[100px]"
                  placeholder="Ceritakan keluhan kamu agar terapis bisa siap menerima sesi."
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submittingConsult}
                  className="inline-flex items-center rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700 transition-colors disabled:opacity-60"
                >
                  {submittingConsult ? "Mengirim…" : "Kirim permintaan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConsultForm(false);
                    setComplaint("");
                  }}
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Ulasan publik</h2>
        <p className="text-xs text-gray-500 mb-4">
          GET /physiotherapists/:id/reviews
        </p>
        {reviews.length === 0 ? (
          <p className="text-gray-600">Belum ada ulasan.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{r.patientName}</span>
                  <span className="text-amber-600">{r.rating}/5</span>
                </div>
                {r.comment && (
                  <p className="text-gray-800 mt-2 whitespace-pre-wrap">
                    {r.comment}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
