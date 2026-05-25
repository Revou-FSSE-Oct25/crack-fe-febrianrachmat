import { execSync } from "node:child_process";
import path from "node:path";

const beRoot = path.resolve(__dirname, "../../crack-be-febrianrachmat");

const defaultDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5433/physio_booking?schema=public";

export default async function globalSetup(): Promise<void> {
  if (process.env.E2E_RUN !== "1") {
    return;
  }

  if (process.env.E2E_SKIP_SEED === "1") {
    console.log("[e2e] E2E_SKIP_SEED=1 — skipping prisma seed.");
    return;
  }

  const databaseUrl = process.env.DATABASE_URL ?? defaultDatabaseUrl;

  console.log("[e2e] Reseeding demo database before tests…");
  execSync("npm run prisma:seed", {
    cwd: beRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
  });
}
