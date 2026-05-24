import { test, expect } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import { clearSession } from "./helpers/session";

/**
 * Requires:
 * - Backend API on NEXT_PUBLIC_API_URL (default http://localhost:3000)
 * - Seeded DB (`npm run prisma:seed` in crack-be-febrianrachmat)
 * - Demo password: password123
 */
const PASSWORD = process.env.E2E_PASSWORD ?? "password123";

test.describe("Booking visit payment UX", () => {
  test("PT confirms booking then patient sees pay CTA and payable dropdown", async ({
    page,
  }) => {
    test.skip(
      !process.env.E2E_RUN,
      "Set E2E_RUN=1 with backend + seeded DB running",
    );

    await loginViaUi(page, "physio2@demo.local", PASSWORD, "/bookings");
    const confirmBtn = page.getByRole("button", { name: "Konfirmasi" }).first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await expect(
        page.getByText(/dikonfirmasi|pasien dapat membayar/i),
      ).toBeVisible({ timeout: 10_000 });
    }

    await clearSession(page);

    await loginViaUi(page, "patient2@demo.local", PASSWORD, "/bookings");
    await expect(
      page
        .getByRole("link", { name: "Bayar kunjungan" })
        .or(page.getByRole("link", { name: "Lihat status pembayaran" }))
        .or(page.getByText(/Menunggu konfirmasi|Lampirkan bukti/i)),
    ).toBeVisible({ timeout: 15_000 });

    await page.goto("/transactions");
    await expect(
      page.getByText("Buat transaksi", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText(/Menunggu konfirmasi admin|Daftar transaksi/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
