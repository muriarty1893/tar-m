import { test, expect } from "@playwright/test";

const H1 = "Tarlanızın fotoğrafını çekin, yapay zekâ size yol göstersin.";

test("the cinematic intro plays by itself and rests with the card, phone and CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(H1);
  const card = page.getByRole("heading", { level: 2, name: "Ziraat uzmanınız cebinizde." });
  await expect(card).toBeVisible({ timeout: 8000 });
  await expect(page.locator("html")).toHaveAttribute("data-cine-run", "1");
  const hero = page.locator("main section").first();
  await expect(hero.getByRole("link", { name: "Erken erişim için kaydol" })).toHaveAttribute("href", "/#kayit");
  await expect(hero.getByRole("link", { name: "Demoyu deneyin" })).toHaveAttribute("href", "/#demo");
  await expect(hero.getByRole("img", { name: /mobil uygulamasının ana ekranı/ })).toBeVisible();
  // No scroll-jacking: the page scrolls normally right away.
  await page.mouse.wheel(0, 900);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
});

test("reduced motion shows the final hero at once, without arming the intro", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/\bcine\b/);
  await expect(page.getByRole("heading", { level: 2, name: "Ziraat uzmanınız cebinizde." })).toBeVisible({ timeout: 1000 });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the hero content is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Ziraat uzmanınız cebinizde." })).toBeVisible();
  });
});

test("the hero stays still under the mouse: no phone tilt, no light following the pointer", async ({ page, isMobile }) => {
  test.skip(isMobile, "mouse interaction");
  await page.goto("/");
  const card = page.getByRole("heading", { level: 2, name: "Ziraat uzmanınız cebinizde." });
  await expect(card).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(3500); // let the intro finish
  const phone = page.locator("main section").first().getByRole("img", { name: /mobil uygulamasının ana ekranı/ }).locator("..");
  const before = await phone.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.move(80, 120);
  await page.mouse.move(1200, 700, { steps: 8 });
  await page.waitForTimeout(1500);
  expect(await phone.evaluate((el) => getComputedStyle(el).transform)).toBe(before);
  await expect(page.locator(".cine-sheen")).toHaveCount(0);
});
