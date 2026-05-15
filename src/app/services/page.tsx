import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";
import {
  btnPrimary,
  btnSecondary,
  cardSurface,
  PageHeader,
  widePageShell,
} from "@/components/ui/page-shell";

export default function ServicesPage() {
  return (
    <main className={`${widePageShell} space-y-12 pb-16`}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Layanan"
          title="Solusi gerak & pemulihan"
          description="Pilih layanan yang sesuai fase pemulihan Anda. Tarif visit dan konsultasi online mengikuti profil fisioterapis dan dicatat saat booking dibuat."
        />
        <div className="flex shrink-0 flex-col gap-3 self-stretch sm:flex-row sm:items-center lg:self-auto">
          <Link
            href="/therapists"
            className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
          >
            Cari fisioterapis
          </Link>
          <Link
            href="/appointment"
            className={`${btnPrimary} min-h-[44px] justify-center text-center sm:min-w-[11rem]`}
          >
            Booking sekarang
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        <ServiceCard
          title="Fisioterapi"
          description="Terapi gerak dan rehabilitasi untuk mengembalikan fungsi dan mobilitas setelah cedera atau operasi."
        />
        <ServiceCard
          title="Sports massage"
          description="Pijat olahraga untuk meredakan ketegangan otot dan mempercepat pemulihan pasca aktivitas."
        />
        <ServiceCard
          title="Performance training"
          description="Program latihan bertahap agar Anda kembali beraktivitas dengan aman dan percaya diri."
        />
      </div>

      <div className="mx-auto max-w-3xl">
        <div className={`${cardSurface} p-6 sm:p-8`}>
          <h3 className="text-center text-lg font-semibold tracking-tight text-slate-900 sm:text-left">
            Setelah memilih layanan
          </h3>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-600 sm:text-left">
            Ingin diskusi singkat sebelum janji? Setelah masuk sebagai pasien,
            buka menu{" "}
            <Link
              href="/consultations"
              className="font-semibold text-teal-700 underline-offset-2 hover:underline"
            >
              Konsultasi
            </Link>{" "}
            di pintasan atas. Atau lanjut ke booking untuk memilih slot dan
            terapis.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href="/appointment"
              className={`${btnPrimary} min-h-[44px] flex-1 justify-center text-center sm:flex-none sm:px-8`}
            >
              Buat janji temu
            </Link>
            <Link
              href="/consultations"
              className={`${btnSecondary} min-h-[44px] flex-1 justify-center text-center sm:flex-none sm:px-8`}
            >
              Menuju konsultasi
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
