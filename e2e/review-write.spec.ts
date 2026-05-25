import { test, expect } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import { E2E_PASSWORD, requireE2eRun } from "./helpers/require-e2e";

/**
 * Review write page supports booking and consultation targets.
 */
test.describe("Write review page", () => {
  test.beforeEach(() => {
    requireE2eRun();
  });

  test("patient can open review form with booking and consultation targets", async ({
    page,
  }) => {
    await loginViaUi(page, "patient1@demo.local", E2E_PASSWORD, "/reviews/write");

    await expect(
      page.getByRole("heading", { name: "Beri ulasan" }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText(/Kunjungan \(booking\)/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Konsultasi online/)).toBeVisible();
  });
});
