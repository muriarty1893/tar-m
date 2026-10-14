import { test, expect } from "@playwright/test";
import { demoScenarios } from "../../data/demo-scenarios";

test.describe("PillNav (desktop navigation)", () => {
  test.skip(({ isMobile }) => isMobile, "the pill nav is the desktop bar; phones use the menu");

  test("marks the current page and rolls the label on hover, without a colour fill", async ({ page }) => {
    await page.goto("/haberler");
    const nav = page.getByRole("navigation", { name: "Ana menü" });
    await expect(nav.getByRole("link", { name: "Haberler", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(nav.locator(".pill-nav__circle")).toHaveCount(0);
    const pill = nav.getByRole("link", { name: "Demo", exact: true });
    const label = pill.locator(".pill-nav__label").first();
    const look = () => Promise.all([label.evaluate((el) => getComputedStyle(el).transform), pill.evaluate((el) => getComputedStyle(el).backgroundColor)]);
    const [restLabel, restBg] = await look();
    await pill.hover();
    await page.waitForTimeout(350);
    const [hoverLabel, hoverBg] = await look();
    expect(hoverLabel).not.toBe(restLabel);
    expect(hoverBg).toBe(restBg);
  });
});

test("SpringCheck: the result's recommendations are a to-do list the farmer can tick off", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await demo.getByRole("button", { name: /Buğday tarlası/ }).click();
  await demo.getByRole("button", { name: "Fotoğraf çek", exact: true }).click();
  await expect(demo.getByTestId("demo-cevap")).toBeVisible({ timeout: 4000 });
  const first = demo.getByRole("checkbox", { name: demoScenarios[0].suggestions[0] });
  await expect(first).toHaveAttribute("aria-checked", "false");
  await first.click();
  await expect(first).toHaveAttribute("aria-checked", "true");
  await expect(demo.getByRole("checkbox")).toHaveCount(demoScenarios[0].suggestions.length);
});

test("CircularText: a spinning free-early-access stamp on the sign-up panel", async ({ page, isMobile }) => {
  test.skip(isMobile, "tablet and up only, so the form stays in view on phones");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  // Scroll to the panel: the stamp itself spins, so it never counts as "stable" for scrolling.
  await page.locator("#kayit").scrollIntoViewIfNeeded();
  const stamp = page.locator("#kayit").getByTestId("circular-text");
  await expect(stamp).toHaveAttribute("aria-hidden", "true");
  await expect(stamp).toContainText("ÜCRETSİZ");
  const ring = stamp.locator(".circular-text");
  expect(await ring.evaluate((el) => getComputedStyle(el).animationName)).toBe("circular-text-spin");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await ring.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
});

test("MaskedHeading: the about page title shows the field through its letters", async ({ page }) => {
  await page.goto("/hakkimizda");
  const h1 = page.getByRole("heading", { level: 1, name: "Hakkımızda" });
  await expect(h1).toBeVisible();
  await expect(h1).toHaveAttribute("data-ready", "");
  await expect(h1.locator("clipPath text")).toHaveText("Hakkımızda");
  await expect(h1.locator("img")).toHaveAttribute("src", /hero-field/);
});

test.describe("MaskedHeading without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the title is still readable as plain text", async ({ page }) => {
    await page.goto("/hakkimizda");
    const word = page.getByRole("heading", { level: 1, name: "Hakkımızda" }).locator(".masked-heading__measure");
    const color = await word.evaluate((el) => getComputedStyle(el).color);
    expect(color).not.toBe("rgba(0, 0, 0, 0)");
  });
});
