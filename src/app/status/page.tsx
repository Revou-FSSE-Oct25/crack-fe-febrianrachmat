import { fetchApiHealth } from "@/lib/api/health";
import Link from "next/link";
import {
  cardSurface,
  PageHeader,
  widePageShell,
} from "@/components/ui/page-shell";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  let health: Awaited<ReturnType<typeof fetchApiHealth>> | null = null;
  let error: string | null = null;

  try {
    health = await fetchApiHealth();
  } catch (e) {
    error = e instanceof Error ? e.message : "Tidak dapat menjangkau API.";
  }

  const apiOk = health?.status === "ok" && health.database === "connected";

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <PageHeader
        eyebrow="Operasional"
        title="Status layanan"
        description="Pemeriksaan koneksi ke backend Kinova (GET /health)."
      />

      <section className={`${cardSurface} max-w-lg space-y-4`}>
        {error ? (
          <>
            <p className="text-sm font-semibold text-red-800">Tidak terhubung</p>
            <p className="text-sm text-slate-600 leading-relaxed">{error}</p>
          </>
        ) : health ? (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">API</dt>
              <dd
                className={
                  health.status === "ok"
                    ? "font-semibold text-emerald-700"
                    : "font-semibold text-amber-800"
                }
              >
                {health.status}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Database</dt>
              <dd
                className={
                  health.database === "connected"
                    ? "font-semibold text-emerald-700"
                    : "font-semibold text-amber-800"
                }
              >
                {health.database}
              </dd>
            </div>
          </dl>
        ) : null}

        <p className="text-xs text-slate-500 border-t border-slate-100 pt-4">
          {apiOk
            ? "Layanan siap digunakan."
            : "Periksa NEXT_PUBLIC_API_URL dan status deploy Railway."}
        </p>
        <Link
          href="/"
          className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          Kembali ke beranda
        </Link>
      </section>
    </main>
  );
}
