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
  await demo.getByRole("button", { name: "Fotoğraf çek", exact: true }).click();
  await expect(demo.getByText("Analiz ediliyor…")).toBeVisible();
  await expect(demo.getByTestId("demo-cevap")).toBeVisible({ timeout: 4000 });

  await demo.getByRole("button", { name: "Yeni tarama" }).click();
  await expect(demo.getByText("Hızlı İşlemler")).toBeVisible();
});

test("without interaction the phone waits on the app's home screen, pointing at the scan button", async ({ page }) => {
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await page.locator(CANVAS).scrollIntoViewIfNeeded();
  await page.waitForTimeout(6000);
  // No photo is taken by itself: still on the home screen, camera closed, no result.
  await expect(demo.getByText("Hızlı İşlemler")).toBeVisible();
  await expect(demo.getByText("CANLI · Kamera")).toHaveCount(0);
  await expect(demo.getByTestId("demo-cevap")).toHaveCount(0);
  await expect(demo.getByTestId("tap-hint")).toHaveCount(1);
  await expect(demo.getByTestId("tap-hint")).toContainText("Taramayı başlatın");
});

test("the tap pointer walks the visitor through scan, photo and question", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  const hint = demo.getByTestId("tap-hint");

  await demo.getByRole("button", { name: /Hastalık Tara/ }).click();
  await expect(hint).toContainText("Fotoğrafı çekin");
  await demo.getByRole("button", { name: "Fotoğraf çek", exact: true }).click();
  await expect(hint).toHaveCount(0); // nothing to tap while analysing
  await expect(demo.getByTestId("demo-cevap")).toBeVisible({ timeout: 4000 });
  await expect(hint).toContainText("Soru sorun");

  await demo.getByRole("button", { name: "Soru sor", exact: true }).click();
  await expect(hint).toContainText("Bir soru seçin");
  await demo.getByRole("log", { name: "Sohbet" }).locator("..").getByRole("button").filter({ hasText: "?" }).first().click();
  await expect(hint).toHaveCount(0);

  // Steps already done are not pointed at again.
  await demo.getByRole("button", { name: "Sonuca dön" }).click();
  await demo.getByRole("button", { name: "Yeni tarama" }).click();
  await expect(demo.getByText("Hızlı İşlemler")).toBeVisible();
  await expect(hint).toHaveCount(0);
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
  const modelCredit = page.locator("#demo p", { hasText: "3B telefon modeli" });
  await expect(modelCredit.getByRole("link", { name: "CC BY 4.0" })).toHaveAttribute("href", /creativecommons\.org\/licenses\/by\/4\.0/);
});

test("the phone's bottom bar switches screens and opens past scans", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  const app = demo.getByTestId("uygulama-ekrani");
  const nav = app.getByRole("navigation", { name: "Uygulama menüsü" });

  await nav.getByRole("button", { name: "Hava" }).click();
  await expect(app.getByText("5 günlük tarım tahmini")).toBeVisible();
  await expect(nav.getByRole("button", { name: "Hava" })).toHaveAttribute("aria-current", "page");

  await nav.getByRole("button", { name: "Geçmiş" }).click();
  await app.getByRole("button", { name: /Domates bahçesi/ }).click();
  await expect(app.getByTestId("demo-cevap")).toBeVisible();
  await expect(app.getByRole("meter")).toHaveAttribute("aria-valuenow", "48");

  await nav.getByRole("button", { name: "Ana sayfa" }).click();
  await expect(app.getByText("Hızlı İşlemler")).toBeVisible();
});

test("the picked field becomes the scene behind the phone, live in its camera", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  const stage = demo.locator(".stage-bg");
  await expect(stage).not.toHaveAttribute("data-scene");

  await demo.getByRole("button", { name: /Ayçiçeği tarlası/ }).click();
  await expect(stage).toHaveAttribute("data-scene", "/demo/aycicegi-tarlasi.webp");
  await expect(demo.getByTestId("uygulama-ekrani").getByText("CANLI · Kamera")).toBeVisible();
  await demo.getByRole("button", { name: "Fotoğraf çek", exact: true }).click();
  await expect(demo.getByTestId("uygulama-ekrani").getByText("CANLI · Tarama")).toBeVisible();

  await expect(demo.getByTestId("demo-cevap")).toBeVisible({ timeout: 4000 });
  await demo.getByRole("button", { name: "Yeni tarama" }).click();
  await expect(stage).not.toHaveAttribute("data-scene");
});
