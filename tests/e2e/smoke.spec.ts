import { test, expect } from "@playwright/test";

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
