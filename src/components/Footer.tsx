import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-teal-800/20 bg-gradient-to-b from-teal-700 to-teal-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">
          <div>
            <p className="text-lg font-bold tracking-tight">Kinova</p>
            <p className="mt-2 text-sm text-teal-100/90 max-w-sm leading-relaxed">
              Movement &amp; Recovery Center — pendamping pemulihan gerak Anda.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <Link href="/services" className="text-teal-100 hover:text-white transition-colors">
              Layanan
            </Link>
            <Link href="/about" className="text-teal-100 hover:text-white transition-colors">
              Tentang
            </Link>
            <Link href="/appointment" className="text-teal-100 hover:text-white transition-colors">
              Janji temu
            </Link>
            <Link href="/login" className="text-teal-100 hover:text-white transition-colors">
              Masuk
            </Link>
          </nav>
        </div>
        <p className="mt-10 pt-8 border-t border-white/10 text-center text-xs text-teal-200/90">
          © {new Date().getFullYear()} Kinova. Hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}