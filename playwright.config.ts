import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";

/** Must match JWT_SECRET on the backend used during E2E. */
const e2eJwtSecret =
  process.env.JWT_SECRET ?? "e2e-test-jwt-secret-min-32-chars-long";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    acceptDownloads: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        /** E2E_RUN needs JWT_SECRET aligned with backend — do not reuse a stale dev server. */
        reuseExistingServer: !process.env.CI && !process.env.E2E_RUN,
        timeout: 120_000,
        env: {
          ...process.env,
          JWT_SECRET: e2eJwtSecret,
          NEXT_PUBLIC_API_URL:
            process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
        },
      },
});
