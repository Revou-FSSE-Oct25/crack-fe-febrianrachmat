import Link from "next/link";

const footerLink =
  "text-sm text-teal-100/95 hover:text-white transition-colors duration-150 underline-offset-4 hover:underline decoration-teal-300/80";

const footerHeading = "text-xs font-semibold uppercase tracking-wider text-teal-200/90";

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
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="text-lg font-bold tracking-tight text-white">Kinova</p>
            <p className="mt-3 max-w-sm text-sm text-teal-100/90 leading-relaxed">
              Movement &amp; Recovery Center — pendamping pemulihan gerak Anda
              dengan alur booking dan konsultasi yang jelas.
            </p>
          </div>

          <div className="sm:col-span-1 lg:col-span-3">
            <p className={footerHeading}>Navigasi</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link href="/services" className={footerLink}>
                  Layanan
                </Link>
              </li>
              <li>
                <Link href="/about" className={footerLink}>
                  Tentang
                </Link>
              </li>
              <li>
                <Link href="/therapists" className={footerLink}>
                  Fisioterapis
                </Link>
              </li>
              <li>
                <Link href="/appointment" className={footerLink}>
                  Janji temu
                </Link>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-1 lg:col-span-4">
            <p className={footerHeading}>Akun &amp; kebijakan</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link href="/login" className={footerLink}>
                  Masuk
                </Link>
              </li>
              <li>
                <Link href="/register" className={footerLink}>
                  Daftar
                </Link>
              </li>
              <li>
                <Link href="/kebijakan" className={footerLink}>
                  Kebijakan produk &amp; demo
                </Link>
              </li>
              <li>
                <Link href="/status" className={footerLink}>
                  Status layanan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-teal-200/85">
          © {new Date().getFullYear()} Kinova. Hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
