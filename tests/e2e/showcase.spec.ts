import { test, expect } from "@playwright/test";

const CANVAS = 'canvas[aria-label*="3B akıllı telefon"]';

test("the 3D phone loads near the demo and runs the app on its screen", async ({ page }) => {
  // Reduced motion keeps the phone still (and skips the auto tour) so taps land deterministically.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  // The app screen lives on the phone exactly once (no leftover 2D fallback copy).
  await expect(demo.getByText("Hızlı İşlemler")).toHaveCount(1);
  await expect(demo.getByText("Hızlı İşlemler")).toBeVisible();

  await demo.getByRole("button", { name: /Hastalık Tara/ }).click();
  await expect(demo.getByText("Analiz ediliyor…")).toBeVisible();
  await expect(demo.getByTestId("demo-cevap")).toBeVisible({ timeout: 4000 });

  await demo.getByRole("button", { name: "Yeni tarama" }).click();
  await expect(demo.getByText("Hızlı İşlemler")).toBeVisible();
});

test("without interaction the phone plays one example scan by itself", async ({ page }) => {
  await page.goto("/#demo");
  // On phones the stage sits below the scenario grid; the tour starts once it is in view.
  await page.locator(CANVAS).scrollIntoViewIfNeeded();
  await expect(page.locator("#demo").getByTestId("demo-cevap")).toBeVisible({ timeout: 15_000 });
});

test("reduced motion: no auto tour and no motion toggle", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(6000);
  await expect(demo.getByTestId("demo-cevap")).toHaveCount(0);
  await expect(demo.getByRole("button", { name: /Hareketi/ })).toHaveCount(0);
});

test("the motion toggle pauses and resumes the floating phone", async ({ page }) => {
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  await demo.getByRole("button", { name: "Hareketi durdur" }).click();
  await expect(demo.getByRole("button", { name: "Hareketi başlat" })).toBeVisible();
});

test("without WebGL the app screen shows in a flat phone frame", async ({ page }) => {
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error -- test stub: report no WebGL support
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      return /webgl/.test(type) ? null : orig.call(this, type as "2d", ...(rest as []));
    };
  });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.getByText("Hızlı İşlemler")).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(demo.locator("canvas")).toHaveCount(0);
});

test("credits the 3D model under CC BY 4.0", async ({ page }) => {
  await page.goto("/#demo");
  const credit = page.locator("#demo").getByRole("link", { name: /iPhone 17 Pro/ });
  await expect(credit).toHaveAttribute("href", /sketchfab\.com/);
  await expect(page.locator("#demo").getByRole("link", { name: "CC BY 4.0" })).toHaveAttribute("href", /creativecommons\.org\/licenses\/by\/4\.0/);
});
