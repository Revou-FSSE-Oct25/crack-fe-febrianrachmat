import { test, expect } from "@playwright/test";

test.describe("Demo guide (static)", () => {
  test("demo page lists accounts and happy paths", async ({ page }) => {
    await page.goto("/demo");
    await expect(
      page.getByRole("heading", { name: "Panduan demo Kinova" }),
    ).toBeVisible();
    await expect(page.getByText("admin@demo.local")).toBeVisible();
    await expect(page.getByText("password123")).toBeVisible();
    await expect(page.getByText("Kunjungan: booking")).toBeVisible();
  });

  test("login shows demo account picker", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Akun demo (seed)")).toBeVisible();
    await expect(page.getByRole("link", { name: "Panduan demo lengkap" })).toBeVisible();
  });
});
