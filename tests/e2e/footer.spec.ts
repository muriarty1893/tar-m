import { test, expect } from "@playwright/test";

test("the wheat scene grows in when the footer comes into view, behind the footer content", async ({ page }) => {
  await page.goto("/hakkimizda");
  const scene = page.getByTestId("wheat-scene");
  await expect(scene).toHaveAttribute("aria-hidden", "true");
  await expect(scene).toHaveAttribute("data-state", "waiting");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-state", /growing|idle/);
  await expect(scene).toHaveAttribute("data-state", "idle", { timeout: 6000 });
  // A real scene: the canvas covers the footer and was actually drawn on.
  const box = await scene.boundingBox();
  const footer = await page.locator("footer").boundingBox();
  expect(box!.height).toBeGreaterThan(footer!.height * 0.95);
  // A full field: roughly one stalk per 10 px of width or more.
  expect(Number(await scene.getAttribute("data-stalks"))).toBeGreaterThan(box!.width / 10);
});

test("moving over the field bends the wheat", async ({ page, isMobile }) => {
  test.skip(isMobile, "hover; touch drags use the same handler");
  await page.goto("/hakkimizda");
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  const scene = page.getByTestId("wheat-scene");
  await expect(scene).toHaveAttribute("data-state", "idle", { timeout: 6000 });
  await expect(scene).toHaveAttribute("data-stirred", "0");
  // The footer is taller than the screen: go to the bottom and sweep through the visible field.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const field = (await page.locator("[data-field-start]").boundingBox())!;
  const y = field.y + field.height * 0.55;
  await page.mouse.move(field.x + 100, y);
  await page.mouse.move(field.x + field.width - 100, y, { steps: 25 });
  await expect.poll(async () => Number(await scene.getAttribute("data-stirred"))).toBeGreaterThan(5);
});

test("no pause button; links and contact stay usable above the scene", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.getByRole("button", { name: /animasyon/i })).toHaveCount(0);
  const about = footer.getByRole("navigation", { name: "Alt menü" }).getByRole("link", { name: "Hakkımızda" });
  await about.scrollIntoViewIfNeeded();
  await expect(about).toBeVisible();
  await expect(footer.getByRole("link", { name: "iletisim@bereketai.com" })).toBeVisible();
  await expect(footer.getByText("Tüm hakları saklıdır.")).toBeVisible();
  await about.click();
  await expect(page).toHaveURL(/\/hakkimizda$/);
});

test("reduced motion: the field is drawn once, fully grown and still", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/hakkimizda");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("wheat-scene")).toHaveAttribute("data-state", "still");
});
