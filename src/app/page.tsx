import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import { btnPrimary, btnSecondary } from "@/components/ui/page-shell";
import Link from "next/link";

export default function Home() {
  return (
    <main className="pb-16">
      <Hero />

      <section className="relative border-t border-slate-200/60 bg-gradient-to-b from-white via-slate-50/80 to-slate-50 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950">
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/50 to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <header className="mx-auto mb-12 max-w-2xl space-y-3 text-center sm:mb-16">
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

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
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

          <div className="mx-auto mt-14 max-w-4xl sm:mt-16">
            <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_12px_32px_rgb(15_23_42_/_0.06)] ring-1 ring-slate-900/[0.04] backdrop-blur-sm sm:p-8 dark:border-slate-600/60 dark:bg-slate-800/90 dark:shadow-[0_8px_32px_rgb(0_0_0_/_0.35)] dark:ring-slate-900/40">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2 text-center lg:max-w-md lg:text-left">
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                    Langkah berikutnya
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    Jelajahi profil fisioterapis atau langsung buat janji temu
                    sesuai jadwal Anda.
                  </p>
                </div>
                <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:shrink-0 lg:justify-end">
                  <Link
                    href="/therapists"
                    className={`${btnSecondary} min-h-[44px] px-6 text-center sm:min-w-[10rem]`}
                  >
                    Cari fisioterapis
                  </Link>
                  <Link
                    href="/appointment"
                    className={`${btnPrimary} min-h-[44px] px-6 text-center sm:min-w-[10rem]`}
                  >
                    Booking sekarang
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
