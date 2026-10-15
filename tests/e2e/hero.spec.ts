import { test, expect } from "@playwright/test";
import sharp from "sharp";

const H1 = "Çiftçinin Akıllı Rehberi";

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
  // No scroll-jacking: the page scrolls right away. (Phone emulation divides a synthetic wheel's
  // delta by the pixel ratio, 2.625 on the Pixel 7, so 900 arrives as ~343 there.)
  await page.mouse.wheel(0, 900);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
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

test("the hero card is filled with a ripe wheat field, unlike the bare soil behind it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const card = page.locator("[data-cine='card']");
  const photo = card.locator("img[data-card-photo]");
  await expect(photo).toHaveAttribute("src", /susehri-wheat/);
  // Inside the card, not behind it: the photo fills the card's box exactly.
  const [c, p] = await Promise.all([card.boundingBox(), photo.boundingBox()]);
  expect(Math.round(p!.width)).toBe(Math.round(c!.width));
  expect(Math.round(p!.height)).toBe(Math.round(c!.height));
  // Text over the photo turns white; the floating badges stay dark on their white chips.
  const heading = card.getByRole("heading", { name: "Ziraat uzmanınız cebinizde." });
  await expect(heading).toHaveCSS("color", "rgb(255, 255, 255)");
  const badges = card.locator(".cine-badge");
  if (await badges.first().isVisible()) await expect(badges.first()).toHaveCSS("color", "rgb(15, 46, 29)");
});

test("the hero card, its text and buttons are there from the first frame: no blank space while the intro runs", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __card: string[] };
    w.__card = [];
    const tick = () => {
      const card = document.querySelector("[data-cine='card']");
      const left = document.querySelector("[data-cine='left']");
      if (card && left) w.__card.push(`${getComputedStyle(card).opacity}/${getComputedStyle(card).visibility}/${getComputedStyle(left).opacity}`);
      if (w.__card.length < 90) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __card: string[] }).__card.length)).toBe(90);
  const samples = await page.evaluate(() => (window as unknown as { __card: string[] }).__card);
  expect(new Set(samples)).toEqual(new Set(["1/visible/1"]));
});

test("the field photo fills the hero up to the headline: no white band between the headline and the card", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const h1 = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
  const card = (await page.locator("[data-cine='card']").boundingBox())!;
  const top = Math.ceil(h1.y + h1.height + 4);
  const height = Math.floor(card.y - 4) - top;
  test.skip(height < 8, "no gap between the headline and the card at this size");
  const shot = await page.screenshot({ clip: { x: 0, y: top, width: page.viewportSize()!.width, height } });
  const { channels } = await sharp(shot).stats();
  const mean = (channels[0].mean + channels[1].mean + channels[2].mean) / 3;
  // Plain white is 255; the washed-out field reads clearly darker.
  expect(mean).toBeLessThan(235);
});

test("the field photo carries on below the hero and fades out before the next heading: no blank band", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const heroBottom = await page.locator("main section").first().evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
  const eyebrowTop = await page.locator("#nasil-calisir .eyebrow").first().evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const width = page.viewportSize()!.width;
  const meanOf = async (y: number, height: number) => {
    const shot = await page.screenshot({ fullPage: true, clip: { x: 0, y, width, height } });
    const { channels } = await sharp(shot).stats();
    return (channels[0].mean + channels[1].mean + channels[2].mean) / 3;
  };
  // Just below the hero: still the photo, not white.
  expect(await meanOf(Math.round(heroBottom) + 2, 24)).toBeLessThan(235);
  // Right above the next heading: faded out to white, so the heading reads as before.
  expect(await meanOf(Math.round(eyebrowTop) - 10, 8)).toBeGreaterThan(245);
});
