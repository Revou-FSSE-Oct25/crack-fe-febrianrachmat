import type { Page } from "@playwright/test";

export async function loginViaUi(
  page: Page,
  email: string,
  password: string,
  nextPath = "/bookings",
): Promise<void> {
  await page.goto(`/login?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel("Email", { exact: false }).fill(email);
  await page.getByLabel("Kata sandi", { exact: false }).fill(password);
  await page.getByRole("button", { name: /masuk/i }).click();
  await page.waitForURL(`**${nextPath}**`, { timeout: 30_000 });
}
