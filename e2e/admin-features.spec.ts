import { test, expect } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import { E2E_PASSWORD, requireE2eRun } from "./helpers/require-e2e";

/**
 * Admin surfaces added after MVP: audit log, analytics, operations CSV export.
 * Requires E2E_RUN=1, seeded DB, BE on NEXT_PUBLIC_API_URL.
 */
test.describe("Admin features (audit, analytics, CSV)", () => {
  test.beforeEach(() => {
    requireE2eRun();
  });

  test("audit log page loads and can filter payment confirmations", async ({
    page,
  }) => {
    await loginViaUi(page, "admin@demo.local", E2E_PASSWORD, "/admin/audit-logs");

    await expect(
      page.getByRole("heading", { name: "Audit log" }),
    ).toBeVisible({ timeout: 15_000 });

    await page.locator("#audit-filter-action").selectOption("TRANSACTION_MARK_PAID");
    await page.getByRole("button", { name: "Terapkan filter" }).click();

    const summary = page.getByText(/Menampilkan \d+ dari \d+ entri/);
    await expect(summary).toBeVisible({ timeout: 15_000 });

    const summaryText = (await summary.textContent()) ?? "";
    if (/Menampilkan 0 dari/.test(summaryText)) {
      await expect(page.getByText("Belum ada audit log")).toBeVisible();
    } else {
      await expect(
        page
          .locator("main ul")
          .getByRole("listitem")
          .filter({ hasText: "Konfirmasi pembayaran" })
          .first(),
      ).toBeVisible();
    }
  });

  test("analytics dashboard shows period summary and charts", async ({
    page,
  }) => {
    await loginViaUi(page, "admin@demo.local", E2E_PASSWORD, "/admin/analytics");

    await expect(
      page.getByRole("heading", { name: "Analytics" }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.locator("#analytics-days")).toBeVisible();
    const analyticsResponse = page.waitForResponse(
      (res) =>
        res.url().includes("/admin/dashboard/analytics") &&
        res.request().method() === "GET" &&
        res.ok(),
    );
    await page.locator("#analytics-days").selectOption("7");
    await analyticsResponse;

    await expect(page.getByText(/Periode: 7 hari/)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/entri audit log/i)).toBeVisible();
  });

  test("operations panel exports transactions CSV", async ({ page }) => {
    await loginViaUi(page, "admin@demo.local", E2E_PASSWORD, "/admin/operations");

    await expect(
      page.getByRole("heading", { name: "Operasional" }),
    ).toBeVisible({ timeout: 15_000 });

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 30_000 }),
      page.getByRole("button", { name: "Unduh CSV" }).first().click(),
    ]);

    const name = download.suggestedFilename();
    expect(name).toMatch(/transactions-export.*\.csv/i);
  });

  test("operations panel exports bookings CSV from monitoring tab", async ({
    page,
  }) => {
    await loginViaUi(page, "admin@demo.local", E2E_PASSWORD, "/admin/operations");

    await page.getByRole("button", { name: "Monitoring booking" }).click();

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 30_000 }),
      page.getByRole("button", { name: "Unduh CSV" }).click(),
    ]);

    const name = download.suggestedFilename();
    expect(name).toMatch(/bookings-export.*\.csv/i);
  });
});
