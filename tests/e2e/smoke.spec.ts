import { test, expect } from "@playwright/test";

test("header CTA is hidden on phones and the menu holds it instead", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/hakkimizda");
  const headerCta = page.locator("header").getByRole("link", { name: "Erken erişim için kaydol" });
  await expect(headerCta).toBeHidden();
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await expect(headerCta).toBeVisible();
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
