import { test, expect } from "@playwright/test";
import { loginViaUi } from "./helpers/auth";

/**
 * Requires:
 * - Backend API on NEXT_PUBLIC_API_URL (default http://localhost:3000)
 * - Seeded DB (`npm run prisma:seed` in crack-be-febrianrachmat)
 * - Demo password: password123
 */
const PASSWORD = process.env.E2E_PASSWORD ?? "password123";

test.describe("Therapist browse discovery", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !process.env.E2E_RUN,
      "Set E2E_RUN=1 with backend + seeded DB running",
    );
    await loginViaUi(page, "patient1@demo.local", PASSWORD, "/therapists");
  });

  test("applies sort filter, syncs URL, and opens therapist profile", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "Cari fisioterapis" }),
    ).toBeVisible();

    await page.locator("#therapist-sort").selectOption("rating_desc");
    await page.getByRole("button", { name: "Terapkan" }).click();

    await expect(page).toHaveURL(/sort=rating_desc/, { timeout: 15_000 });
    await expect(page.getByRole("status")).toContainText(/fisioterapis/i);

    const profileLink = page
      .locator('a[href^="/therapists/"]')
      .filter({ hasText: /Lihat detail/i })
      .first();
    await expect(profileLink).toBeVisible({ timeout: 15_000 });

    const href = await profileLink.getAttribute("href");
    expect(href).toMatch(/^\/therapists\/[0-9a-f-]{36}$/i);

    await profileLink.click();
    await expect(page).toHaveURL(new RegExp(href!.replace("/", "\\/")), {
      timeout: 15_000,
    });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("loads browse page from shareable query string", async ({ page }) => {
    await page.goto("/therapists?sort=visit_fee_asc&page=1");

    await expect(
      page.getByRole("heading", { name: "Cari fisioterapis" }),
    ).toBeVisible();
    await expect(page.locator("#therapist-sort")).toHaveValue("visit_fee_asc");
    await expect(
      page.locator('a[href^="/therapists/"]').first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
