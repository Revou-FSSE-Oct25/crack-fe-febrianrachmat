import { fetchApiHealth } from "@/lib/api/health";
import { PageHeader, widePageShell } from "@/components/ui/page-shell";
import { StatusPanel } from "./status-panel";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  let health: Awaited<ReturnType<typeof fetchApiHealth>> | null = null;

  try {
    health = await fetchApiHealth();
  } catch {
    health = null;
  }

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <PageHeader
        eyebrow="Operasional"
        title="Status layanan"
        description="Pemeriksaan koneksi ke backend Kinova (GET /health). Gunakan tombol periksa ulang saat menyiapkan demo."
      />
      <StatusPanel initial={health} />
    </main>
  );
}
