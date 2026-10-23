import { test, expect } from "@playwright/test";

const CANVAS = 'canvas[aria-label*="3B akıllı telefon"]';

test("the 3D phone loads near the demo and runs the app on its screen", async ({ page }) => {
  // Reduced motion keeps the phone still (and skips the auto tour) so taps land deterministically.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  // The app screen lives on the phone exactly once (no leftover 2D fallback copy).
  await expect(demo.getByText("Hızlı Menü Kısayolları")).toHaveCount(1);
  await expect(demo.getByText("Hızlı Menü Kısayolları")).toBeVisible();

  await demo.getByRole("button", { name: /Hastalık Tara/ }).click();
  await demo.getByRole("button", { name: "Fotoğraf çek", exact: true }).click();
  await expect(demo.getByText("Analiz ediliyor…")).toBeVisible();
  await expect(demo.getByTestId("demo-cevap")).toBeVisible({ timeout: 4000 });

  await demo.getByRole("button", { name: "Yeni tarama" }).click();
  await expect(demo.getByText("Hızlı Menü Kısayolları")).toBeVisible();
});

test("without interaction the phone waits on the app's home screen, pointing at the scan button", async ({ page }) => {
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  // The canvas is created only once the stage nears the screen: scroll to the stage, then wait for it.
  await demo.locator(".stage-bg").scrollIntoViewIfNeeded();
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(6000);
  // No photo is taken by itself: still on the home screen, camera closed, no result.
  await expect(demo.getByText("Hızlı Menü Kısayolları")).toBeVisible();
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
  await expect(demo.getByText("Hızlı Menü Kısayolları")).toBeVisible();
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

test("there is no pause-motion button under the phone", async ({ page }) => {
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  await expect(demo.getByRole("button", { name: /Hareketi/ })).toHaveCount(0);
});

test("the camera's X closes it, back to the app's home screen, also mid-analysis", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  const app = demo.getByTestId("uygulama-ekrani");

  await demo.getByRole("button", { name: /Ayçiçeği tarlası/ }).click();
  await expect(app.getByText("CANLI · Kamera")).toBeVisible();
  await app.getByRole("button", { name: "Kamerayı kapat" }).click();
  await expect(app.getByText("CANLI · Kamera")).toHaveCount(0);
  await expect(app.getByText("Hızlı Menü Kısayolları")).toBeVisible();
  await expect(demo.locator(".stage-bg")).not.toHaveAttribute("data-scene");

  await demo.getByRole("button", { name: /Ayçiçeği tarlası/ }).click();
  await app.getByRole("button", { name: "Fotoğraf çek", exact: true }).click();
  await expect(app.getByText("CANLI · Tarama")).toBeVisible();
  await app.getByRole("button", { name: "Kamerayı kapat" }).click();
  await expect(app.getByText("Hızlı Menü Kısayolları")).toBeVisible();
  // The cancelled analysis must not pop its result up later.
  await page.waitForTimeout(2600);
  await expect(demo.getByTestId("demo-cevap")).toHaveCount(0);
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
  await expect(demo.getByText("Hızlı Menü Kısayolları")).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(demo.locator("canvas")).toHaveCount(0);
});

test("the field picker sits beside the phone on desktop and above it on phones", async ({ page, isMobile }) => {
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  // Measure both in one go: opening /#demo smooth-scrolls, so separate reads would straddle the scroll.
  await expect(demo.getByRole("button", { name: /Buğday tarlası/ })).toBeVisible();
  const [picker, stage] = await demo.evaluate((root) =>
    [root.querySelector("button[aria-pressed]")!, root.querySelector(".stage-bg")!].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }),
  );
  if (isMobile) {
    expect(picker.y + picker.height).toBeLessThan(stage.y);
  } else {
    // Side by side: the picker overlaps the stage vertically and sits to its left.
    expect(picker.x + picker.width).toBeLessThanOrEqual(stage.x);
    expect(picker.y).toBeLessThan(stage.y + stage.height);
  }
});

test("no credit lines under the demo; they live on the image sources page, linked from the footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#demo")).not.toContainText("3B telefon modeli");
  await expect(page.locator("#demo")).not.toContainText("Wikimedia Commons");
  await page.locator("footer").getByRole("link", { name: "Görsel kaynakları" }).click();
  await expect(page).toHaveURL(/\/kaynaklar$/);
  const model = page.getByRole("listitem").filter({ hasText: "iPhone 17 Pro" });
  await expect(model.getByRole("link", { name: /iPhone 17 Pro/ })).toHaveAttribute("href", /sketchfab\.com/);
  await expect(model.getByRole("link", { name: "CC BY 4.0" })).toHaveAttribute("href", /creativecommons\.org\/licenses\/by\/4\.0/);
  for (const author of ["Rasbak", "CraneStation", "Maurice Flesier", "John Sutton"]) await expect(page.getByText(author, { exact: false }).first()).toBeVisible();
});

test("the phone's bottom bar switches screens, and past scans open from under the calendar", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  const app = demo.getByTestId("uygulama-ekrani");
  const nav = app.getByRole("navigation", { name: "Uygulama menüsü" });

  await nav.getByRole("button", { name: "Pazar" }).click();
  await expect(app.getByRole("list", { name: "İlanlar" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Pazar" })).toHaveAttribute("aria-current", "page");

  // The weather moved off the bar, as in the app: it opens from the home screen's shortcut.
  await nav.getByRole("button", { name: "Ana sayfa" }).click();
  await app.getByRole("button", { name: "Hava Durumu" }).click();
  await expect(app.getByText("5 günlük tarım tahmini")).toBeVisible();

  await expect(nav.getByRole("button")).toHaveText(["Ana sayfa", "Taramalar", "Pazar", "Takvim"]);
  await nav.getByRole("button", { name: "Takvim" }).click();
  await expect(app.getByText("Geçmiş taramalar")).toBeVisible();
  await app.getByRole("button", { name: /Domates bahçesi/ }).click();
  await expect(app.getByTestId("demo-cevap")).toBeVisible();
  await expect(app.getByRole("meter")).toHaveAttribute("aria-valuenow", "48");

  await nav.getByRole("button", { name: "Ana sayfa" }).click();
  await expect(app.getByText("Hızlı Menü Kısayolları")).toBeVisible();
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

test("each app screen sets its own scene behind the phone: grass, then photos of sky, ploughed field, straw bales", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  const stage = demo.locator(".stage-bg");
  const app = demo.getByTestId("uygulama-ekrani");
  const nav = app.getByRole("navigation", { name: "Uygulama menüsü" });
  await expect(stage).toHaveAttribute("data-backdrop", "meadow");
  // Real photographs behind the weather, calendar and market screens; home keeps the 3D meadow.
  const photos = { sky: /sahne-gokyuzu/, furrows: /sahne-surulmus-tarla/, harvest: /sahne-balyalar/ } as const;
  await expect(stage.locator("[data-scene-layer] img")).toHaveCount(0);
  for (const [tab, backdrop] of [["Hava Durumu", "sky"], ["Takvim", "furrows"], ["Pazar", "harvest"], ["Ana sayfa", "meadow"]] as const) {
    // The weather opens from the home screen's shortcut; the rest are on the bottom bar.
    await (tab === "Hava Durumu" ? app : nav).getByRole("button", { name: tab, exact: true }).click();
    await expect(stage).toHaveAttribute("data-backdrop", backdrop);
    const layer = stage.locator(`[data-scene-layer="${backdrop}"]`);
    await expect(layer).toHaveCSS("opacity", "1");
    if (backdrop !== "meadow") await expect(layer.locator("img")).toHaveAttribute("src", photos[backdrop]);
  }
});

test("the calendar tab lists the month's farm tasks by day, and tasks can be ticked off", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  const app = demo.getByTestId("uygulama-ekrani");
  await app.getByRole("navigation", { name: "Uygulama menüsü" }).getByRole("button", { name: "Takvim" }).click();
  await expect(app.getByText("Tarım takvimi")).toBeVisible();
  const month = app.getByRole("group", { name: "Ekim 2026" });
  // Today is picked to start with, and its tasks are listed.
  await expect(month.getByRole("button", { name: /^14 Ekim/ })).toHaveAttribute("aria-pressed", "true");
  const tasks = app.getByRole("list", { name: /görevler/ });
  await expect(tasks).toContainText("Taban gübresi");

  await month.getByRole("button", { name: /^16 Ekim/ }).click();
  await expect(tasks).toContainText("Buğday ekimi");
  const check = tasks.getByRole("checkbox", { name: /Buğday ekimi/ });
  await expect(check).toHaveAttribute("aria-checked", "false");
  await check.click();
  await expect(check).toHaveAttribute("aria-checked", "true");

  // A day without tasks says so.
  await month.getByRole("button", { name: /^2 Ekim/ }).click();
  await expect(app.getByText("Bu gün için görev yok")).toBeVisible();
});

test("the demo section's intro no longer mentions the pointing finger", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#demo")).toContainText("Telefondaki uygulamayı kendiniz kullanın");
  await expect(page.locator("#demo")).not.toContainText("Parmak işareti");
});

test("while the 3D phone loads, the demo window shows the bars loader, then the phone", async ({ page }) => {
  // Hold the model back so the loading state is long enough to see.
  await page.route("**/models/phone.glb", async (r) => {
    await new Promise((res) => setTimeout(res, 2500));
    await r.continue();
  });
  await page.goto("/");
  const demo = page.locator("#demo");
  await demo.locator(".stage-bg").scrollIntoViewIfNeeded();
  const loader = demo.getByRole("status", { name: "Demo yükleniyor" });
  await expect(loader).toBeVisible();
  await expect(loader.locator("span.rounded-full")).toHaveCount(4);
  // In the brand green, like the rest of the demo.
  await expect(loader).toHaveCSS("color", "rgb(11, 122, 59)");
  // The flat stand-in phone is not shown while the real one is on its way.
  await expect(demo.locator(".stage-bg").getByText("Hızlı Menü Kısayolları")).toBeHidden();
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  await expect(loader).toHaveCount(0, { timeout: 20_000 });
  await expect(demo.getByText("Hızlı Menü Kısayolları")).toBeVisible();
});

test("the 3D phone starts downloading once the page has loaded, before the demo is reached", async ({ page }) => {
  const model = page.waitForRequest(/\/models\/phone\.glb/, { timeout: 15_000 });
  await page.goto("/");
  // Never scrolled: the request still goes out.
  expect((await model).url()).toMatch(/phone\.glb/);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("if the 3D phone fails to load, the flat phone appears instead of an endless loader", async ({ page }) => {
  await page.route("**/models/phone.glb", (r) => r.abort());
  await page.goto("/");
  const demo = page.locator("#demo");
  await demo.locator(".stage-bg").scrollIntoViewIfNeeded();
  await expect(demo.getByText("Hızlı Menü Kısayolları")).toBeVisible({ timeout: 15_000 });
  await expect(demo.getByRole("status", { name: "Demo yükleniyor" })).toHaveCount(0);
});
