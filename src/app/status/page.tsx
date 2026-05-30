import { fetchApiHealth } from "@/lib/api/health";
import { widePageShell } from "@/components/ui/page-shell";
import { StatusHeader } from "./status-header";
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
      <StatusHeader />
      <StatusPanel initial={health} />
    </main>
  );
}
