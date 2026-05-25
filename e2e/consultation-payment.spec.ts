import { test, expect } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import { E2E_PASSWORD, requireE2eRun } from "./helpers/require-e2e";
import { clearSession } from "./helpers/session";
import { confirmPendingConsultationPaymentIfAny } from "./helpers/transactions";

const PROOF_URL = "https://example.com/e2e/consultation-payment-proof.png";

test.describe("Consultation pay-first flow", () => {
  test.beforeEach(() => {
    requireE2eRun();
  });

  test("admin confirms seeded consultation payment and patient can open chat", async ({
    page,
  }) => {
    await loginViaUi(page, "admin@demo.local", E2E_PASSWORD, "/transactions");
    // May already be confirmed by chat-sse.spec.ts earlier in the suite.
    await confirmPendingConsultationPaymentIfAny(page);

    await clearSession(page);
    await loginViaUi(page, "patient2@demo.local", E2E_PASSWORD, "/consultations");

    await expect(
      page.getByText(/Sesi aktif|Pembayaran dikonfirmasi/i),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: "Buka chat" }).first(),
    ).toBeVisible();
  });

  test("REQUESTED to IN_PROGRESS: accept, pay, admin confirm, chat unlocks", async ({
    page,
  }) => {
    await loginViaUi(page, "physio1@demo.local", E2E_PASSWORD, "/consultations");

    const requestedCard = page
      .locator("li")
      .filter({ hasText: "menunggu persetujuan terapis" });
    const acceptBtn = requestedCard.getByRole("button", {
      name: "Terima permintaan",
    });
    await expect(acceptBtn).toBeVisible({ timeout: 15_000 });
    await acceptBtn.click();
    await expect(
      page.getByText(/diterima|pasien dapat membayar/i),
    ).toBeVisible({ timeout: 10_000 });

    await clearSession(page);
    await loginViaUi(page, "patient1@demo.local", E2E_PASSWORD, "/consultations");

    const payCard = page
      .locator("li")
      .filter({ hasText: "Nyeri lutut setelah lari" });
    const payPanel = payCard.locator('input[type="url"]');
    await expect(payPanel).toBeVisible({ timeout: 15_000 });
    await payPanel.fill(PROOF_URL);
    await payCard.getByRole("button", { name: /Bayar/i }).click();
    await expect(
      page.getByText(/terkirim|Menunggu konfirmasi admin|Transaksi/i),
    ).toBeVisible({ timeout: 15_000 });

    await clearSession(page);
    await loginViaUi(page, "admin@demo.local", E2E_PASSWORD, "/transactions");

    expect(await confirmPendingConsultationPaymentIfAny(page)).toBe(true);

    await clearSession(page);
    await loginViaUi(page, "patient1@demo.local", E2E_PASSWORD, "/consultations");

    await expect(
      page.getByRole("button", { name: "Buka chat" }).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
