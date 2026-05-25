import { expect, type Page } from "@playwright/test";

/** Admin /transactions — first pending consultation payment, if any. */
export async function confirmPendingConsultationPaymentIfAny(
  page: Page,
): Promise<boolean> {
  await expect(
    page.getByRole("heading", { name: "Transaksi", exact: true }),
  ).toBeVisible({ timeout: 15_000 });

  const consultPending = page
    .locator("li")
    .filter({ hasText: "Konsultasi ·" })
    .filter({ hasText: "Menunggu konfirmasi" })
    .first();

  try {
    await expect(consultPending).toBeVisible({ timeout: 15_000 });
  } catch {
    return false;
  }

  await consultPending
    .getByRole("button", { name: /Konfirmasi pembayaran/i })
    .click();
  await expect(
    page.getByText(/Pembayaran dikonfirmasi|dikonfirmasi/i),
  ).toBeVisible({ timeout: 15_000 });
  return true;
}
