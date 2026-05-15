import BookingForm from "@/components/BookingForm";
import { cardSurface, PageHeader, pageShell } from "@/components/ui/page-shell";

export default function AppointmentPage() {
  return (
    <main className={`${pageShell} space-y-8 pb-16`}>
      <PageHeader
        eyebrow="Booking"
        title="Buat janji temu"
        description="Pilih fisioterapis, tipe kunjungan, dan slot atau waktu manual. Hanya akun pasien yang dapat mengirim form ini."
      />
      <div className={`${cardSurface} p-6 sm:p-8`}>
        <BookingForm />
      </div>
    </main>
  );
}
