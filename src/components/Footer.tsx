import Link from "next/link";

const footerLink =
  "text-sm text-teal-100/95 hover:text-white transition-colors duration-150 underline-offset-4 hover:underline decoration-teal-300/80";

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-teal-950/20 bg-gradient-to-b from-teal-800 via-teal-900 to-slate-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 0% 100%, rgb(45 212 191) 0%, transparent 42%), radial-gradient(circle at 100% 0%, rgb(15 118 110) 0%, transparent 38%)",
        }}
        aria-hidden
      />
      <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">
          <div className="max-w-sm">
            <p className="text-lg font-bold tracking-tight text-white">Kinova</p>
            <p className="mt-3 text-sm text-teal-100/90 leading-relaxed">
              Movement &amp; Recovery Center — pendamping pemulihan gerak Anda
              dengan alur booking dan konsultasi yang jelas.
            </p>
          </div>
          <nav
            className="flex flex-wrap gap-x-8 gap-y-3 sm:justify-end"
            aria-label="Footer"
          >
            <Link href="/services" className={footerLink}>
              Layanan
            </Link>
            <Link href="/about" className={footerLink}>
              Tentang
            </Link>
            <Link href="/appointment" className={footerLink}>
              Janji temu
            </Link>
            <Link href="/kebijakan" className={footerLink}>
              Kebijakan
            </Link>
            <Link href="/login" className={footerLink}>
              Masuk
            </Link>
          </nav>
        </div>
        <p className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-teal-200/85">
          © {new Date().getFullYear()} Kinova. Hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
