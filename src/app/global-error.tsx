"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import { useEffect } from "react";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body className={`${plusJakarta.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-16">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-800">
              Kesalahan sistem
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Aplikasi tidak dapat dimuat
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Terjadi gangguan pada layout utama. Muat ulang halaman atau coba
              lagi nanti.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-teal-700 px-6 text-sm font-semibold text-white hover:bg-teal-600"
            >
              Coba lagi
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
