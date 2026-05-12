import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="max-w-6xl mx-auto py-16 sm:py-20 px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Layanan kami
          </h2>
          <p className="mt-3 text-slate-600">
            Pendekatan berbasis bukti untuk pemulihan cedera, manajemen nyeri,
            dan peningkatan performa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <ServiceCard
            title="Fisioterapi"
            description="Terapi gerak dan rehabilitasi untuk mengembalikan fungsi dan mobilitas."
          />

          <ServiceCard
            title="Sports massage"
            description="Pijat olahraga untuk mengurangi ketegangan otot dan pemulihan pasca aktivitas."
          />

          <ServiceCard
            title="Performance training"
            description="Program latihan bertahap agar Anda kembali beraktivitas dengan aman."
          />
        </div>
      </section>
    </main>
  );
}