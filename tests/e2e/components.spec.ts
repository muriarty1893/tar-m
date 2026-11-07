import { test, expect } from "@playwright/test";

test.describe("desktop menu", () => {
  test.skip(({ isMobile }) => isMobile, "the text menu is the wide-screen bar; phones use the tab bar");

  test("plain links, the current page in blue with a line under it", async ({ page }) => {
    await page.goto("/haberler");
    const nav = page.getByRole("navigation", { name: "Ana menü" });
    const current = nav.getByRole("link", { name: "Haberler", exact: true });
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(current).toHaveCSS("color", "rgb(29, 78, 216)");
    await expect(nav.getByRole("link", { name: "Pazar", exact: true })).not.toHaveAttribute("aria-current", "page");
  });
});

test("the about page's sign-up button carries the diagonal arrow, which turns to point ahead on hover", async ({ page, isMobile }) => {
  await page.goto("/hakkimizda");
  const cta = page.locator("main").getByRole("link", { name: "Ücretsiz hesap açın" });
  await expect(cta).toHaveAttribute("href", "/kayit");
  const arrow = cta.locator(".btn-arrow");
  await expect(arrow).toHaveCount(1);
  test.skip(isMobile, "hover is a pointer interaction");
  await expect(arrow).toHaveCSS("rotate", "none");
  await cta.hover();
  await expect(arrow).toHaveCSS("rotate", "45deg");
});
