import { test, expect } from "@playwright/test";

const H1 = "Çiftçinin Akıllı Rehberi";

const VIDEO = "[data-cine='phone'] video";

test("the hero's video plays once on load and rests on its last frame, with the content there from the start", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(H1);
  // No intro animation: the card's text and buttons show at once.
  await expect(page.getByRole("heading", { level: 2, name: "Ziraat uzmanınız cebinizde." })).toBeVisible({ timeout: 1500 });
  const hero = page.locator("main section").first();
  await expect(hero.getByRole("link", { name: "Erken erişim için kaydol" })).toHaveAttribute("href", "/#kayit");
  await expect(hero.getByRole("link", { name: "Demoyu deneyin" })).toHaveAttribute("href", "/#demo");

  const video = page.locator(VIDEO);
  await expect(video).toHaveAttribute("aria-label", /mobil uygulamasının ana ekranı/);
  const attrs = await video.evaluate((v: HTMLVideoElement) => ({ muted: v.muted, inline: v.playsInline, loop: v.loop }));
  expect(attrs).toEqual({ muted: true, inline: true, loop: false });
  await expect(page.locator("html")).toHaveAttribute("data-cine-run", "1");
  await expect(page.locator("html")).toHaveAttribute("data-cine-done", "1", { timeout: 12_000 });
  const end = await video.evaluate((v: HTMLVideoElement) => ({ ended: v.ended, at: v.currentTime, of: v.duration }));
  expect(end.ended).toBe(true);
  expect(end.of - end.at).toBeLessThan(0.1);

  // No scroll-jacking: the page scrolls right away. (Phone emulation divides a synthetic wheel's
  // delta by the pixel ratio, 2.625 on the Pixel 7, so 900 arrives as ~343 there.)
  await page.mouse.wheel(0, 900);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
});

test("reduced motion shows the video's last frame as a still, without playing it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/\bcine\b/);
  await expect(page.getByRole("heading", { level: 2, name: "Ziraat uzmanınız cebinizde." })).toBeVisible({ timeout: 1000 });
  await expect(page.locator("[data-hero-endframe]")).toBeVisible();
  await page.waitForTimeout(1500);
  expect(await page.locator(VIDEO).evaluate((v: HTMLVideoElement) => v.paused && v.currentTime === 0)).toBe(true);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the hero content and the video's last frame are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Ziraat uzmanınız cebinizde." })).toBeVisible();
    await expect(page.locator("[data-hero-endframe]")).toBeVisible();
  });
});

test("the hero stays still under the mouse: no tilt, no light following the pointer", async ({ page, isMobile }) => {
  test.skip(isMobile, "mouse interaction");
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-cine-done", "1", { timeout: 12_000 });
  const frame = page.locator("[data-cine='phone']");
  const before = await frame.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.move(80, 120);
  await page.mouse.move(1200, 700, { steps: 8 });
  await page.waitForTimeout(1500);
  expect(await frame.evaluate((el) => getComputedStyle(el).transform)).toBe(before);
  await expect(page.locator(".cine-sheen")).toHaveCount(0);
});

test("the video is the card's background: the whole card on desktop, the card's top on phones", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const card = page.locator("[data-cine='card']");
  await expect(card.locator("img[data-card-photo]")).toHaveCount(0);
  const media = card.locator("[data-cine='phone']");
  await expect(media.locator("video source").first()).toHaveAttribute("src", /hero-video/);
  const [c, m] = await Promise.all([card.boundingBox(), media.boundingBox()]);
  expect(Math.round(m!.width)).toBe(Math.round(c!.width));
  expect(Math.round(m!.y)).toBe(Math.round(c!.y));
  if (isMobile) expect(m!.height).toBeLessThan(c!.height * 0.7);
  else expect(Math.round(m!.height)).toBe(Math.round(c!.height));
  // Text over the video turns white; the floating badges stay dark on their white chips.
  const heading = card.getByRole("heading", { name: "Ziraat uzmanınız cebinizde." });
  await expect(heading).toHaveCSS("color", "rgb(255, 255, 255)");
  const badges = card.locator(".cine-badge");
  if (await badges.first().isVisible()) await expect(badges.first()).toHaveCSS("color", "rgb(15, 46, 29)");
});
