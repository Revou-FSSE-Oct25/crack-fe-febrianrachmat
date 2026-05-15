import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";

export default function Home() {
  return (
    <main className="pb-16">
      <Hero />

      <section className="relative border-t border-slate-200/60 bg-gradient-to-b from-white via-slate-50/80 to-slate-50">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/50 to-transparent" aria-hidden />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <header className="mx-auto mb-14 max-w-2xl space-y-2 text-center sm:mb-16">
            <p className="mx-auto inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 ring-1 ring-teal-100">
              Yang kami tawarkan
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-balance sm:text-3xl">
              Layanan kami
            </h2>
            <p className="text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
              Pendekatan berbasis bukti untuk pemulihan cedera, manajemen nyeri,
              dan peningkatan performa.
            </p>
          </header>

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
