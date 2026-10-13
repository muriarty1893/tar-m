import { test, expect } from "@playwright/test";

// Logic tests: reduced motion keeps the phone still, so taps never race its intro spin.
test.use({ reducedMotion: "reduce" });

const DISCLAIMER = "Örnek gösterim — gerçek uygulamada kendi tarlanızın fotoğrafını yükleyeceksiniz.";

const SHUTTER = { name: "Fotoğraf çek", exact: true } as const;

test("picking a scenario opens the live camera; the shutter starts the analysis", async ({ page }) => {
  await page.goto("/#demo");
  await expect(page.getByText(DISCLAIMER)).toBeVisible();

  await page.getByRole("button", { name: /Buğday tarlası/ }).click();
  // Nothing is analysed until the photo is taken.
  await expect(page.locator("#demo").getByText("CANLI · Kamera")).toBeVisible();
  await page.waitForTimeout(2500);
  await expect(page.getByText("Analiz ediliyor…")).toHaveCount(0);
  await expect(page.getByTestId("demo-cevap")).toHaveCount(0);

  await page.locator("#demo").getByRole("button", SHUTTER).click();
  await expect(page.getByText("Analiz ediliyor…")).toBeVisible();
  await expect(page.getByTestId("demo-cevap")).toHaveCount(0);

  await expect(page.locator("#demo").getByText("Sarı pas (Puccinia striiformis) belirtileri — erken evre")).toBeVisible({ timeout: 4000 });
  const meter = page.locator("#demo").getByRole("meter", { name: "Hasat başarı tahmini" });
  await expect(meter).toHaveAttribute("aria-valuenow", "72");
  await expect(page.getByText("Analiz ediliyor…")).toHaveCount(0);
});

test("switching scenarios mid-analysis shows only the second answer", async ({ page }) => {
  await page.goto("/#demo");
  await page.getByRole("button", { name: /Buğday tarlası/ }).click();
  await page.locator("#demo").getByRole("button", SHUTTER).click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /Ayçiçeği tarlası/ }).click();
  await page.locator("#demo").getByRole("button", SHUTTER).click();

  // The first timer (due ~0.8 s from now) must not reveal the wheat answer.
  await page.waitForTimeout(1100);
  await expect(page.getByTestId("demo-cevap")).toHaveCount(0);
  await expect(page.locator("#demo").getByText(/Puccinia/)).toHaveCount(0);

  await expect(page.getByText("Sağlıklı gelişim — belirgin bir sorun görülmedi")).toBeVisible({ timeout: 4000 });
  await expect(page.locator("#demo").getByRole("meter")).toHaveAttribute("aria-valuenow", "91");
  await expect(page.locator("#demo").getByText(/Puccinia/)).toHaveCount(0);
});

test("demo CTA leads to the waitlist", async ({ page }) => {
  await page.goto("/#demo");
  const cta = page.locator("#demo").getByRole("link", { name: "Erken erişim için kaydol" });
  await expect(cta).toHaveAttribute("href", "/#kayit");
});

test("picking a field photo scrolls the phone into view", async ({ page }) => {
  await page.goto("/#demo");
  const picker = page.getByRole("button", { name: /Mısır tarlası/ });
  await picker.scrollIntoViewIfNeeded();
  await picker.click();
  const stage = page.locator("#demo").getByTestId("uygulama-ekrani");
  await expect(stage).toBeInViewport({ ratio: 0.5 });
});

test("the large button next to the phone also takes the photo", async ({ page }) => {
  await page.goto("/#demo");
  await page.getByRole("button", { name: /Mısır tarlası/ }).click();
  await page.getByRole("button", { name: "Fotoğrafı çek ve analiz et" }).click();
  await expect(page.getByText("Analiz ediliyor…")).toBeVisible();
  await expect(page.locator("#demo").getByRole("meter")).toHaveAttribute("aria-valuenow", "54", { timeout: 4000 });
});

test("after a scan, the in-app chat answers a suggested question and a typed one", async ({ page }) => {
  await page.goto("/#demo");
  const app = page.locator("#demo").getByTestId("uygulama-ekrani");
  await page.getByRole("button", { name: /Domates bahçesi/ }).click();
  await app.getByRole("button", SHUTTER).click();
  await expect(app.getByTestId("demo-cevap")).toBeVisible({ timeout: 4000 });

  await app.getByRole("button", { name: "Soru sor", exact: true }).click();
  const chat = app.getByRole("log", { name: "Sohbet" });
  await app.getByRole("button", { name: "Sağlam meyveleri yiyebilir miyim?" }).click();
  await expect(chat).toContainText("Lekesiz, sert ve sağlıklı görünen meyveler tüketilebilir.", { timeout: 3000 });
  // An asked suggestion disappears from the chips.
  await expect(app.getByRole("button", { name: "Sağlam meyveleri yiyebilir miyim?" })).toHaveCount(0);

  await app.getByLabel("Sorunuzu yazın").fill("Sulamayı ne zaman yapmalıyım?");
  await app.getByRole("button", { name: "Gönder" }).click();
  await expect(chat).toContainText("Bu bir demo", { timeout: 3000 });

  await app.getByRole("button", { name: "Sonuca dön" }).click();
  await expect(app.getByTestId("demo-cevap")).toBeVisible();
});

test("while analysing, the scan screen shows the animated image-analysis indicator", async ({ page }) => {
  await page.goto("/#demo");
  const app = page.locator("#demo").getByTestId("uygulama-ekrani");
  await page.getByRole("button", { name: /Ayçiçeği tarlası/ }).click();
  await app.getByRole("button", SHUTTER).click();
  const indicator = app.getByRole("status", { name: "Fotoğraf analiz ediliyor" });
  await expect(indicator).toBeVisible();
  await expect(indicator.locator("svg")).toHaveCount(2);
  // It goes away with the result.
  await expect(app.getByTestId("demo-cevap")).toBeVisible({ timeout: 4000 });
  await expect(indicator).toHaveCount(0);
});
