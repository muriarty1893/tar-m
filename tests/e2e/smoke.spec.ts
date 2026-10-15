import { test, expect } from "@playwright/test";

test("header CTA is hidden on phones and the menu holds it instead", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/hakkimizda");
  const headerCta = page.locator("header").getByRole("link", { name: "Erken erişim için kaydol" });
  await expect(headerCta).toBeHidden();
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  // The menu (shadcn Sheet) is portaled outside <header>; it holds the CTA instead.
  await expect(page.locator("#mobil-menu").getByRole("link", { name: "Erken erişim için kaydol" })).toBeVisible();
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

test("a sign-up button takes you to the form every time, not only the first time", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const name = page.locator("#kayit").getByLabel("Ad soyad");
  const heroCta = page.locator("[data-cine='card']").getByRole("link", { name: "Erken erişim için kaydol" });
  await heroCta.click();
  await expect(page).toHaveURL(/#kayit$/);
  await expect(name).toBeInViewport();

  // The address already ends in #kayit now; the button must still scroll.
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(name).not.toBeInViewport();
  await heroCta.click();
  await expect(name).toBeInViewport();

  const footerCta = page.locator("footer").getByRole("link", { name: "Erken erişim için kaydol" });
  await footerCta.scrollIntoViewIfNeeded();
  await footerCta.click();
  await expect(name).toBeInViewport();
});

test("on the home page, the menu's sign-up button closes the menu and shows the form", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 750 });
  await page.goto("/#kayit");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await page.locator("#mobil-menu").getByRole("link", { name: "Erken erişim için kaydol" }).click();
  await expect(page.locator("#mobil-menu")).toHaveCount(0);
  await expect(page.getByLabel("Ad soyad")).toBeInViewport();
});
