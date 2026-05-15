import Link from "next/link";
import {
  btnPrimary,
  btnSecondary,
  cardSurface,
  PageHeader,
  pageShell,
} from "@/components/ui/page-shell";

export default function AboutPage() {
  return (
    <main className={`${pageShell} space-y-10 pb-16`}>
      <PageHeader
        eyebrow="Tentang kami"
        title="Kinova Movement & Recovery"
        description="Kami mendampingi perjalanan pemulihan gerak Anda — dari edukasi awal hingga program yang disesuaikan dengan kebutuhan fungsional."
      />

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

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-start">
        <Link href="/appointment" className={`${btnPrimary} text-center sm:inline-flex`}>
          Buat janji temu
        </Link>
        <Link href="/services" className={btnSecondary}>
          Lihat layanan
        </Link>
      </div>
    </main>
  );
}
