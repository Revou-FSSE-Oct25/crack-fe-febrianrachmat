import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";
import {
  btnPrimary,
  PageHeader,
  pageShell,
} from "@/components/ui/page-shell";

export default function ServicesPage() {
  return (
    <main className={`${pageShell} space-y-12 pb-16`}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <PageHeader
          eyebrow="Layanan"
          title="Solusi gerak & pemulihan"
          description="Pilih layanan yang sesuai fase pemulihan Anda. Tarif visit dan konsultasi online mengikuti profil fisioterapis dan dicatat saat booking dibuat."
        />
        <Link
          href="/appointment"
          className={`${btnPrimary} shrink-0 self-start lg:self-auto`}
        >
          Booking sekarang
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
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

      <p className="text-center text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
        Ingin diskusi singkat sebelum janji? Gunakan menu{" "}
        <Link href="/consultations" className="text-teal-700 font-medium hover:underline">
          Konsultasi
        </Link>{" "}
        setelah masuk sebagai pasien.
      </p>
    </main>
  );
}
