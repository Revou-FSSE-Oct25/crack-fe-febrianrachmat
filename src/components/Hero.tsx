import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden text-center py-20 sm:py-28 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 0%, transparent 45%), radial-gradient(circle at 80% 20%, rgb(94 234 212 / 0.4) 0%, transparent 40%)",
        }}
        aria-hidden
      />
      <div className="relative max-w-3xl mx-auto px-6">
        <p className="text-sm font-medium uppercase tracking-widest text-teal-100/90">
          Kinova
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-balance">
          Pulihkan gerak. Kembali beraktivitas.
        </h1>
        <p className="mt-5 text-lg text-teal-50/95 max-w-xl mx-auto text-pretty">
          Mitra fisioterapi dan pemulihan gerak Anda — dari konsultasi hingga
          program latihan.
        </p>
        <Link
          href="/appointment"
          className="mt-10 inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-teal-800 shadow-lg shadow-teal-950/25 hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
        >
          Buat janji temu
        </Link>
      </div>
    </section>
  );
}