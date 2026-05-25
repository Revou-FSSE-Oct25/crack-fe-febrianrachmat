import { test, expect } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";
import { clearSession } from "./helpers/session";
import { E2E_PASSWORD, requireE2eRun } from "./helpers/require-e2e";
import { confirmPendingConsultationPaymentIfAny } from "./helpers/transactions";

/**
 * Chat live stream (SSE) after consultation payment is confirmed.
 */
test.describe("Chat SSE live indicator", () => {
  test.beforeEach(() => {
    requireE2eRun();
  });

  test("patient sees Live (SSE) on conversation after admin confirms payment", async ({
    page,
  }) => {
    await loginViaUi(page, "admin@demo.local", E2E_PASSWORD, "/transactions");
    await confirmPendingConsultationPaymentIfAny(page);

    await clearSession(page);
    await loginViaUi(page, "patient2@demo.local", E2E_PASSWORD, "/consultations");

    const chatBtn = page.getByRole("button", { name: "Buka chat" }).first();
    await expect(chatBtn).toBeVisible({ timeout: 15_000 });
    await chatBtn.click();

    await expect(page.getByText(/Live \(SSE\)/i)).toBeVisible({
      timeout: 25_000,
    });
  });
});
