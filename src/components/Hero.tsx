import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden text-center py-20 sm:py-28 lg:py-32 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 0%, transparent 45%), radial-gradient(circle at 80% 20%, rgb(94 234 212 / 0.45) 0%, transparent 40%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent opacity-90"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="inline-flex items-center justify-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-50 ring-1 ring-white/25 backdrop-blur-sm">
          Kinova
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-balance leading-[1.1]">
          Pulihkan gerak. Kembali beraktivitas.
        </h1>
        <p className="mt-6 mx-auto max-w-2xl text-pretty text-base leading-relaxed text-teal-50/95 sm:text-lg">
          Mitra fisioterapi dan pemulihan gerak Anda — dari konsultasi hingga
          program latihan.
        </p>
        <div className="mt-11 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/appointment"
            className="inline-flex w-full sm:w-auto min-w-[200px] items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-teal-800 shadow-lg shadow-teal-950/30 hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-[transform,colors] duration-150 hover:-translate-y-0.5 active:translate-y-0"
          >
            Buat janji temu
          </Link>
          <Link
            href="/services"
            className="inline-flex w-full sm:w-auto min-w-[200px] items-center justify-center rounded-xl border-2 border-white/35 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/15 hover:border-white/50 transition-[transform,colors,border-color] duration-150"
          >
            Lihat layanan
          </Link>
        </div>
      </div>
    </section>
  );
}
