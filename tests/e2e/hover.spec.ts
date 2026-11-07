import { test, expect, type Locator } from "@playwright/test";

// Rows stay still under the mouse (a light tint at most, no lift or shadow); buttons keep their hover feedback.
test.skip(({ isMobile }) => isMobile, "hover is a mouse interaction");

const motion = (l: Locator) =>
  l.evaluate((el) => {
    const c = getComputedStyle(el);
    return [c.transform, c.boxShadow, c.filter].join("|");
  });

test("news rows don't lift or cast a shadow on hover", async ({ page }) => {
  await page.goto("/haberler");
  const row = page.locator("main article").first();
  await row.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const before = await motion(row);
  await row.hover();
  await page.waitForTimeout(450);
  expect(await motion(row)).toBe(before);
});

test("buttons keep their hover feedback", async ({ page }) => {
  await page.goto("/pazar");
  const button = page.locator("main").getByRole("link", { name: "İlan ver" }).filter({ visible: true }).first();
  await button.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const before = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
  await button.hover();
  await page.waitForTimeout(450);
  expect(await button.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
});
