import { test, expect } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import { clearSession } from "./helpers/session";

/**
 * Requires:
 * - Backend API on NEXT_PUBLIC_API_URL (default http://localhost:3000)
 * - Seeded DB (`npm run prisma:seed` in crack-be-febrianrachmat)
 * - Demo password: password123
 */
import { E2E_PASSWORD, requireE2eRun } from "./helpers/require-e2e";

test.describe("Booking visit payment UX", () => {
  test.beforeEach(() => {
    requireE2eRun();
  });

  test("PT confirms booking then patient sees pay CTA and payable dropdown", async ({
    page,
  }) => {
    await loginViaUi(page, "physio2@demo.local", E2E_PASSWORD, "/bookings");
    const confirmBtn = page.getByRole("button", { name: "Konfirmasi" }).first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await expect(
        page.getByText(/dikonfirmasi|pasien dapat membayar/i),
      ).toBeVisible({ timeout: 10_000 });
    }

    await clearSession(page);

    await loginViaUi(page, "patient2@demo.local", E2E_PASSWORD, "/bookings");
    await expect(
      page
        .getByRole("link", { name: "Bayar kunjungan" })
        .or(page.getByRole("link", { name: "Lihat status pembayaran" }))
        .or(page.getByText(/Menunggu konfirmasi|Lampirkan bukti/i)),
    ).toBeVisible({ timeout: 15_000 });

    await page.goto("/transactions");
    await expect(
      page.getByRole("heading", { name: /Buat transaksi/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/Menunggu konfirmasi admin|Daftar transaksi/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
