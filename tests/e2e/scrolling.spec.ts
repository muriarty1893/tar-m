import { test, expect } from "@playwright/test";

// Wheel scrolling is smoothed (Lenis) unless motion is reduced.

test("wheel scrolling glides over several frames to where the wheel sent it", async ({ page, isMobile }) => {
  test.skip(isMobile, "wheel scrolling is a desktop interaction; touch stays native");
  // A long page: the privacy notice.
  await page.goto("/gizlilik");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  await page.mouse.move(700, 400);
  await page.evaluate(() => {
    const w = window as unknown as { __ys: number[] };
    w.__ys = [];
    const tick = () => {
      w.__ys.push(window.scrollY);
      if (w.__ys.length < 120) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __ys: number[] }).__ys.length), { timeout: 5000 }).toBe(120);
  const ys = await page.evaluate(() => (window as unknown as { __ys: number[] }).__ys);
  expect(new Set(ys.filter((y) => y > 0 && y < 590)).size).toBeGreaterThanOrEqual(5);
  expect(ys.at(-1)).toBeGreaterThan(550);
});

test("with reduced motion the page scrolls natively, without the smoothing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForLoadState("load");
  await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
});

test("while the welcome box is open, the wheel does not scroll the page behind it", async ({ browser, isMobile }) => {
  test.skip(isMobile, "wheel scrolling is a desktop interaction");
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto("/sss");
  await expect(page.getByRole("dialog", { name: /hoş geldiniz/i })).toBeVisible();
  await page.mouse.move(40, 400);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await context.close();
});
