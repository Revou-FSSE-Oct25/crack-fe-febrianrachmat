import { test } from "@playwright/test";

/** Skip unless local/CI E2E stack is running (BE + seeded DB + E2E_RUN=1). */
export function requireE2eRun(): void {
  test.skip(
    !process.env.E2E_RUN,
    "Set E2E_RUN=1 with backend + seeded DB running",
  );
}

export const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "password123";
