import { test, expect, type Locator } from "@playwright/test";

// Cards stay still under the mouse; buttons keep their hover feedback.
test.skip(({ isMobile }) => isMobile, "hover is a mouse interaction");

const look = (l: Locator) =>
  l.evaluate((el) => {
    const c = getComputedStyle(el);
    return [c.transform, c.boxShadow, c.filter, c.backgroundColor].join("|");
  });

async function unchangedOnHover(card: Locator) {
  await card.scrollIntoViewIfNeeded();
  await card.page().mouse.move(0, 0);
  const before = await look(card);
  await card.hover();
  await card.page().waitForTimeout(450);
  expect(await look(card)).toBe(before);
}

test("how-it-works, feature and news cards have no hover effect", async ({ page }) => {
  await page.goto("/");
  await unchangedOnHover(page.locator("#nasil-calisir li > div").first());
  await unchangedOnHover(page.locator("#haberler article").first());
  await unchangedOnHover(page.locator("#haberler article").first().locator("xpath=.."));
  await expect(page.locator("#ozellikler .glowing-effect")).toHaveCount(0);
});

test("hovering a demo field card does not blur or shrink the others", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#demo");
  const cards = page.locator("#demo").getByRole("button", { pressed: false });
  const second = cards.filter({ hasText: "Mısır" });
  await second.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const before = await look(second);
  await cards.filter({ hasText: "Buğday" }).hover();
  await page.waitForTimeout(450);
  expect(await look(second)).toBe(before);
});

test("buttons keep their hover feedback", async ({ page }) => {
  await page.goto("/");
  const button = page.getByRole("link", { name: "İş birliği için bize ulaşın" });
  await button.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const before = await look(button);
  await button.hover();
  await page.waitForTimeout(450);
  expect(await look(button)).not.toBe(before);
});
