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
const PROOF_URL = "https://example.com/e2e/consultation-payment-proof.png";

test.describe("Consultation pay-first flow", () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.E2E_RUN,
      "Set E2E_RUN=1 with backend + seeded DB running",
    );
  });

  test("admin confirms seeded consultation payment and patient can open chat", async ({
    page,
  }) => {
    await loginViaUi(page, "admin@demo.local", PASSWORD, "/transactions");

    const consultPendingCard = page
      .locator("li")
      .filter({ hasText: "Konsultasi ·" })
      .filter({ hasText: "Menunggu konfirmasi" })
      .first();

    await expect(consultPendingCard).toBeVisible({ timeout: 15_000 });
    await consultPendingCard
      .getByRole("button", { name: /Konfirmasi pembayaran/i })
      .click();

    await expect(
      page.getByText(/Pembayaran dikonfirmasi|dikonfirmasi/i),
    ).toBeVisible({ timeout: 15_000 });

    await clearSession(page);
    await loginViaUi(page, "patient2@demo.local", PASSWORD, "/consultations");

    await expect(
      page.getByText(/Sesi aktif|Pembayaran dikonfirmasi/i),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: "Buka chat" }),
    ).toBeVisible();
  });

  test("REQUESTED to IN_PROGRESS: accept, pay, admin confirm, chat unlocks", async ({
    page,
  }) => {
    await loginViaUi(page, "physio1@demo.local", PASSWORD, "/consultations");

    const acceptBtn = page
      .getByRole("button", { name: "Terima permintaan" })
      .first();
    await expect(acceptBtn).toBeVisible({ timeout: 15_000 });
    await acceptBtn.click();
    await expect(
      page.getByText(/diterima|pasien dapat membayar/i),
    ).toBeVisible({ timeout: 10_000 });

    await clearSession(page);
    await loginViaUi(page, "patient1@demo.local", PASSWORD, "/consultations");

    const payPanel = page.locator('input[type="url"]').first();
    await expect(payPanel).toBeVisible({ timeout: 15_000 });
    await payPanel.fill(PROOF_URL);
    await page.getByRole("button", { name: /Bayar/i }).first().click();
    await expect(
      page.getByText(/terkirim|Menunggu konfirmasi admin|Transaksi/i),
    ).toBeVisible({ timeout: 15_000 });

    await clearSession(page);
    await loginViaUi(page, "admin@demo.local", PASSWORD, "/transactions");

    const newestConsultTx = page
      .locator("li")
      .filter({ hasText: "Konsultasi ·" })
      .filter({ hasText: "Menunggu konfirmasi" })
      .first();
    await expect(newestConsultTx).toBeVisible({ timeout: 15_000 });
    await newestConsultTx
      .getByRole("button", { name: /Konfirmasi pembayaran/i })
      .click();
    await expect(
      page.getByText(/Pembayaran dikonfirmasi|dikonfirmasi/i),
    ).toBeVisible({ timeout: 15_000 });

    await clearSession(page);
    await loginViaUi(page, "patient1@demo.local", PASSWORD, "/consultations");

    await expect(
      page.getByRole("button", { name: "Buka chat" }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
