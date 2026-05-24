import BookingForm from "@/components/BookingForm";
import { cardSurface, PageHeader, widePageShell } from "@/components/ui/page-shell";

export default function AppointmentPage() {
  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <div className="mx-auto max-w-3xl space-y-8">
        <PageHeader
          eyebrow="Booking"
          title="Buat janji temu"
          description="Pilih fisioterapis, tipe kunjungan, dan slot atau waktu manual. Setelah terapis mengonfirmasi, bayar kunjungan di halaman Transaksi dengan bukti pembayaran."
        />
        <div className={`${cardSurface} p-6 sm:p-8`}>
          <BookingForm />
        </div>
      </div>
    </main>
  );
}
