import { expect, type Page } from "@playwright/test";

export async function loginViaUi(
  page: Page,
  email: string,
  password: string,
  nextPath = "/bookings",
): Promise<void> {
  const loginUrl = `/login?next=${encodeURIComponent(nextPath)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(loginUrl, { waitUntil: "domcontentloaded" });
      break;
    } catch (err) {
      if (attempt === 2) throw err;
      await page.waitForTimeout(400);
    }
  }
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: /masuk/i }).click();

  await page.waitForURL(
    (url) => !url.pathname.startsWith("/login"),
    { timeout: 45_000 },
  );

  if (!page.url().includes(nextPath)) {
    await page.goto(nextPath);
    await expect(page).toHaveURL(new RegExp(nextPath.replace(/\//g, "\\/")), {
      timeout: 15_000,
    });
  }
}
