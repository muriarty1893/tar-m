import { test, expect } from "@playwright/test";

test("header CTA is hidden on phones and the menu holds it instead", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/hakkimizda");
  const headerCta = page.locator("header").getByRole("link", { name: "Erken erişim için kaydol" });
  await expect(headerCta).toBeHidden();
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await expect(headerCta).toBeVisible();
});

test("CTA inside the mobile menu closes the menu so the form is visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 750 });
  await page.goto("/haberler");
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await page.locator("#mobil-menu").getByRole("link", { name: "Erken erişim için kaydol" }).click();
  await expect(page).toHaveURL(/#kayit$/);
  await expect(page.locator("#mobil-menu")).toHaveCount(0);
  await expect(page.getByLabel("Ad soyad")).toBeInViewport();
});

test("home page has Turkish lang, brand name and CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page.locator("header")).toContainText("Bereket AI");
  await expect(
    page
      .getByRole("link", { name: "Erken erişim için kaydol" })
      .filter({ visible: true })
      .first(),
  ).toBeVisible();
});
