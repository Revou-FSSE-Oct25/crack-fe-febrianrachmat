import type { Page } from "@playwright/test";

export async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
  });
}
