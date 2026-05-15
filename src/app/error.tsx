"use client";

import {
  btnOutline,
  btnPrimary,
  cardSurface,
  pageShell,
} from "@/components/ui/page-shell";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
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
    <main
      className={`${pageShell} flex min-h-[50vh] flex-col items-center justify-center pb-16`}
    >
      <div className={`${cardSurface} w-full max-w-md text-center space-y-5`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-red-800">
          Terjadi kesalahan
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-balance">
          Maaf, ada yang tidak beres
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Halaman ini gagal dimuat. Anda bisa mencoba lagi atau kembali ke
          beranda.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => reset()}
            className={`${btnPrimary} min-h-[44px] justify-center px-6`}
          >
            Coba lagi
          </button>
          <Link
            href="/"
            className={`${btnOutline} min-h-[44px] justify-center px-6`}
          >
            Ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
