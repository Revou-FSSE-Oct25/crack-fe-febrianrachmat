import Link from "next/link";
import {
  cardSurface,
  PageHeader,
  pageShell,
} from "@/components/ui/page-shell";

const BACKEND_POLICY_DOC =
  "https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat/blob/main/docs/product-policy.md";

export default function KebijakanPage() {
  return (
    <main className={`${pageShell} space-y-8 pb-16`}>
      <PageHeader
        eyebrow="Informasi"
        title="Kebijakan produk & demo"
        description="Ringkasan untuk pengguna dan reviewer tugas. Perilaku sebenarnya mengikuti API backend dan dokumen teknis di repositori backend."
      />

      <section className={`${cardSurface} space-y-4 text-slate-700 text-sm leading-relaxed`}>
        <h2 className="text-base font-semibold text-slate-900">
          Status aplikasi
        </h2>
        <p>
          Kinova pada repositori ini adalah <strong>demo / prototype</strong>{" "}
          pemesanan fisioterapi dan konsultasi online. Pembayaran bersifat{" "}
          <strong>dummy</strong> (tanpa gateway uang sungguhan). Data sebaiknya
          fiktif — jangan memasukkan rahasia medis atau pribadi sensitif.
        </p>
      </section>

      <section className={`${cardSurface} space-y-4 text-slate-700 text-sm leading-relaxed`}>
        <h2 className="text-base font-semibold text-slate-900">
          Peran & alur singkat
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Pasien:</strong> booking visit, ajukan konsultasi, lampirkan
            bukti bayar, pantau transaksi; chat mengikuti status konsultasi dan
            konfirmasi pembayaran.
          </li>
          <li>
            <strong>Fisioterapis:</strong> kelola slot, terima/mutakhirkan status
            konsultasi dan booking sesuai aturan aplikasi.
          </li>
          <li>
            <strong>Admin:</strong> konfirmasi pembayaran dummy dan refund
            hanya jika aturan status di API memungkinkan; moderasi ulasan dan
            tugas admin lain sesuai modul.
          </li>
        </ul>
      </section>

      <section className={`${cardSurface} space-y-4 text-slate-700 text-sm leading-relaxed`}>
        <h2 className="text-base font-semibold text-slate-900">
          Pembayaran & bukti
        </h2>
        <p>
          Nominal transaksi ditetapkan <strong>di server</strong> dari snapshot
          booking atau konsultasi. Pasien wajib melampirkan{" "}
          <strong>bukti</strong> (unggah file atau tautan{" "}
          <code className="rounded bg-slate-100 px-1">https</code>) sebelum
          transaksi pending dibuat. Admin hanya dapat menandai lunas jika bukti
          sudah tercatat.
        </p>
        <p>
          Unggahan file dapat tidak permanen di hosting cloud; untuk demo yang
          perlu tautan stabil, gunakan URL bukti di penyimpanan eksternal.
        </p>
      </section>

      <section className={`${cardSurface} space-y-4 text-slate-700 text-sm leading-relaxed`}>
        <h2 className="text-base font-semibold text-slate-900">
          Privasi & disclaimer medis
        </h2>
        <p>
          Aplikasi memproses data akun, booking, konsultasi, chat, notifikasi,
          dan bukti pembayaran sebagaimana disimpan oleh backend. Ini{" "}
          <strong>bukan</strong> layanan kesehatan resmi dan{" "}
          <strong>bukan</strong> pengganti diagnosis atau kunjungan langsung ke
          tenaga profesional.
        </p>
      </section>

      <section className={`${cardSurface} space-y-3`}>
        <h2 className="text-base font-semibold text-slate-900">
          Dokumen lengkap
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Versi penuh (Bahasa Indonesia) dengan penjelasan SLA, refund otomatis,
          dan rujukan ke dokumentasi teknis:
        </p>
        <p>
          <a
            href={BACKEND_POLICY_DOC}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-700 font-medium underline hover:text-teal-800"
          >
            product-policy.md di repositori backend (GitHub)
          </a>
        </p>
        <p className="text-xs text-slate-500">
          Jika URL di atas tidak dapat diakses, buka file{" "}
          <code className="rounded bg-slate-100 px-1">docs/product-policy.md</code>{" "}
          di clone lokal repositori backend.
        </p>
      </section>

      <p className="text-center text-sm text-slate-600">
        <Link href="/" className="text-teal-700 hover:underline font-medium">
          Kembali ke beranda
        </Link>
      </p>
    </main>
  );
}
