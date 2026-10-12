import { test, expect } from "@playwright/test";

// Logic tests: reduced motion keeps the phone still, so taps never race its intro spin.
test.use({ reducedMotion: "reduce" });

const DISCLAIMER = "Örnek gösterim — gerçek uygulamada kendi tarlanızın fotoğrafını yükleyeceksiniz.";

test("tapping a scenario analyses, then shows diagnosis, gauge and disclaimer", async ({ page }) => {
  await page.goto("/#demo");
  await expect(page.getByText(DISCLAIMER)).toBeVisible();

  await page.getByRole("button", { name: /Buğday tarlası/ }).click();
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
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /Ayçiçeği tarlası/ }).click();

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
