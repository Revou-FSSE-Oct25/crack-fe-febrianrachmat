"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { createConsultation } from "@/lib/api/consultations";
import { getPhysiotherapistById } from "@/lib/api/physiotherapists";
import { listPublicReviewsForPhysiotherapist } from "@/lib/api/reviews";
import type { PhysiotherapistBrowseItem } from "@/lib/api/types";
import {
  AlertBanner,
  btnOutline,
  btnPrimary,
  btnSecondary,
  cardSurface,
  inputBase,
  PageHeader,
  PageLoading,
  SignInRequired,
  widePageShell,
} from "@/components/ui/page-shell";
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
  const [consultSla, setConsultSla] = useState<"STANDARD" | "FAST_ONLINE">(
    "STANDARD",
  );

  const load = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    try {
      const found = await getPhysiotherapistById(profileId);
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
    return <PageLoading />;
  }

  if (!user) {
    return (
      <SignInRequired message="Masuk untuk melihat profil fisioterapis." />
    );
  }

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <nav
        className="border-b border-slate-200/90 pb-4"
        aria-label="Navigasi profil"
      >
        <Link
          href="/therapists"
          className="inline-flex min-h-[40px] items-center rounded-xl px-2 py-1.5 text-sm font-semibold text-teal-800 ring-1 ring-transparent transition-[background,ring,colors] hover:bg-teal-50 hover:ring-teal-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          ← Kembali ke daftar
        </Link>
      </nav>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
            aria-hidden
          />
          Memuat profil…
        </p>
      ) : !therapist ? (
        <div className={`${cardSurface} text-center py-10`}>
          <p className="text-slate-700 font-medium">Profil tidak ditemukan.</p>
          <Link
            href="/therapists"
            className={`${btnPrimary} mt-6 inline-flex min-h-[44px] items-center justify-center px-6`}
          >
            Ke daftar fisioterapis
          </Link>
        </div>
      ) : (
        <>
          <PageHeader
            eyebrow="Profil terapis"
            title={therapist.user.fullName}
            description={
              therapist.category ? (
                <span className="text-teal-700 font-medium">
                  {therapist.category.name}
                </span>
              ) : null
            }
          />

          <div className={`${cardSurface} space-y-4`}>
            {therapist.bio ? (
              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                {therapist.bio}
              </p>
            ) : (
              <p className="text-slate-500 text-sm italic">Belum ada bio.</p>
            )}
            {therapist.clinicAddress ? (
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-800">Klinik: </span>
                {therapist.clinicAddress}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 pt-1 border-t border-slate-100">
              <span>
                Konsultasi online:{" "}
                <strong className="text-slate-900">
                  {formatRupiah(therapist.consultationFee ?? null)}
                </strong>
              </span>
              <span className="text-slate-300">·</span>
              <span>
                Visit:{" "}
                <strong className="text-slate-900">
                  {formatRupiah(therapist.visitFee ?? null)}
                </strong>
              </span>
              {therapist.onlineUntil &&
              new Date(String(therapist.onlineUntil)) > new Date() ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
                  Online
                </span>
              ) : null}
            </div>

            {user.role === "PATIENT" && (
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowConsultForm((v) => !v)}
                  className={`${btnPrimary} min-h-[44px] justify-center px-5 text-center sm:min-w-[14rem]`}
                >
                  Konsultasi online (
                  {formatRupiah(therapist.consultationFee ?? null)})
                </button>
                <Link
                  href="/appointment"
                  className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[14rem]`}
                >
                  Booking visit (
                  {formatRupiah(therapist.visitFee ?? null)})
                </Link>
              </div>
            )}
          </div>

          {showConsultForm && user.role === "PATIENT" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (complaint.trim().length < 10) {
                  setError("Keluhan minimal 10 karakter.");
                  return;
                }
                const therapistOnline =
                  therapist.onlineUntil != null &&
                  new Date(String(therapist.onlineUntil)) > new Date();
                if (consultSla === "FAST_ONLINE" && !therapistOnline) {
                  setError(
                    "Respons cepat hanya saat terapis sedang online. Pilih Standar atau tunggu badge Online.",
                  );
                  return;
                }
                setError(null);
                setSubmittingConsult(true);
                try {
                  await createConsultation({
                    physiotherapistId: profileId,
                    complaint: complaint.trim(),
                    slaTier:
                      consultSla === "FAST_ONLINE"
                        ? "FAST_ONLINE"
                        : undefined,
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
              className={`${cardSurface} space-y-4 border-teal-100/80 bg-teal-50/30`}
            >
              <p className="text-sm text-slate-700 leading-relaxed">
                Alur: kirim keluhan → terapis menerima → kamu bayar{" "}
                <strong>
                  {formatRupiah(therapist.consultationFee ?? null)}
                </strong>{" "}
                → chat aktif setelah pembayaran dikonfirmasi.
              </p>
              <fieldset className="space-y-2.5 text-sm text-slate-700">
                <legend className="font-semibold text-slate-800 mb-1">
                  Batas balasan terapis setelah bayar
                </legend>
                <label className="flex items-start gap-2.5 cursor-pointer rounded-lg p-2 hover:bg-white/60">
                  <input
                    type="radio"
                    name="consultSla"
                    checked={consultSla === "STANDARD"}
                    onChange={() => setConsultSla("STANDARD")}
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Standar (~24 jam)</span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer rounded-lg p-2 hover:bg-white/60">
                  <input
                    type="radio"
                    name="consultSla"
                    checked={consultSla === "FAST_ONLINE"}
                    onChange={() => setConsultSla("FAST_ONLINE")}
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <span>
                    Respons cepat (~10 menit) — hanya jika badge{" "}
                    <strong>Online</strong> tampil.
                  </span>
                </label>
              </fieldset>
              <div>
                <label
                  htmlFor="consult-complaint"
                  className="block text-sm font-medium text-slate-800 mb-1.5"
                >
                  Keluhan (min. 10 karakter)
                </label>
                <textarea
                  id="consult-complaint"
                  required
                  minLength={10}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className={`${inputBase} min-h-[100px]`}
                  placeholder="Ceritakan keluhan kamu agar terapis bisa siap menerima sesi."
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="submit"
                  disabled={submittingConsult}
                  className={`${btnPrimary} min-h-[44px] justify-center sm:min-w-[12rem]`}
                >
                  {submittingConsult ? "Mengirim…" : "Kirim permintaan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConsultForm(false);
                    setComplaint("");
                    setConsultSla("STANDARD");
                    setError(null);
                  }}
                  className={`${btnOutline} min-h-[44px] justify-center sm:min-w-[8rem]`}
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {!loading && therapist ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Ulasan publik</h2>
          <p className="text-xs text-slate-500">
            Ulasan dari pasien setelah sesi booking selesai.
          </p>
          {reviews.length === 0 ? (
            <div className={`${cardSurface} text-center py-8 text-slate-600 text-sm`}>
              Belum ada ulasan.
            </div>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className={cardSurface}>
                  <div className="flex justify-between gap-2 items-start">
                    <span className="font-semibold text-slate-900">
                      {r.patientName}
                    </span>
                    <span className="text-amber-700 font-medium text-sm shrink-0">
                      {r.rating}/5
                    </span>
                  </div>
                  {r.comment ? (
                    <p className="text-slate-700 mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                      {r.comment}
                    </p>
                  ) : null}
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(r.createdAt).toLocaleString("id-ID")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </main>
  );
}
