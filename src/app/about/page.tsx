import Link from "next/link";
import {
  btnPrimary,
  btnSecondary,
  cardSurface,
  PageHeader,
  widePageShell,
} from "@/components/ui/page-shell";

export default function AboutPage() {
  return (
    <main className={`${widePageShell} space-y-10 pb-16`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Tentang kami"
          title="Kinova Movement & Recovery"
          description="Kami mendampingi perjalanan pemulihan gerak Anda — dari edukasi awal hingga program yang disesuaikan dengan kebutuhan fungsional."
        />
        <div className="flex shrink-0 flex-col gap-3 self-stretch sm:flex-row sm:flex-wrap lg:self-auto">
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
            Booking
          </Link>
        </div>
      </div>

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="text-lg font-semibold text-slate-900">Visi</h2>
        <p className="text-slate-600 leading-relaxed">
          Menjadi mitra terpercaya dalam pemulihan cedera, manajemen nyeri, dan
          peningkatan performa gerak melalui pendekatan berbasis bukti dan
          komunikasi yang jelas antara pasien dan fisioterapis.
        </p>
      </section>

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="text-lg font-semibold text-slate-900">Apa yang kami tawarkan</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed">
          <li>Booking kunjungan klinik atau home visit dengan slot terstruktur.</li>
          <li>Konsultasi online dan chat setelah alur pembayaran demo selesai.</li>
          <li>Profil terapis, kategori layanan, dan transparansi tarif (visit &amp; konsultasi).</li>
        </ul>
      </section>

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="text-lg font-semibold text-slate-900">Demo aplikasi</h2>
        <p className="text-slate-600 leading-relaxed">
          Platform ini adalah <strong>prototype</strong> untuk pembelajaran dan
          demonstrasi alur bisnis. Pembayaran bersifat dummy; baca juga{" "}
          <Link
            href="/kebijakan"
            className="font-semibold text-teal-700 hover:underline"
          >
            kebijakan produk &amp; demo
          </Link>
          .
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-start">
        <Link
          href="/appointment"
          className={`${btnPrimary} min-h-[44px] justify-center text-center sm:inline-flex`}
        >
          Buat janji temu
        </Link>
        <Link
          href="/services"
          className={`${btnSecondary} min-h-[44px] justify-center text-center sm:inline-flex`}
        >
          Lihat layanan
        </Link>
      </div>
    </main>
  );
}
