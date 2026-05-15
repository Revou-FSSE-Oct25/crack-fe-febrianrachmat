import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="relative border-t border-slate-200/60 bg-gradient-to-b from-white via-slate-50/80 to-slate-50">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/50 to-transparent" aria-hidden />
        <div className="max-w-6xl mx-auto py-16 sm:py-24 px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Yang kami tawarkan
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              Layanan kami
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
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
        </div>
      </section>
    </main>
  );
}
