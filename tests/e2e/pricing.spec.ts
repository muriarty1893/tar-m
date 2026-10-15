import { test, expect, type Page } from "@playwright/test";

// The "Planlar" section on the home page: three plans, the middle one the most popular, with a
// monthly / yearly switch whose prices roll to the new figures (NumberFlow).

const plansOf = (page: Page) => {
  const section = page.locator("#planlar");
  const plans = section.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3 }) });
  return { section, plans, solo: plans.nth(0), pro: plans.nth(1), corp: plans.nth(2) };
};

test("the home page shows three plans with prices, the middle one marked most popular", async ({ page }) => {
  await page.goto("/");
  const { section, plans, solo, pro, corp } = plansOf(page);
  await expect(section.getByRole("heading", { level: 2, name: "İşinize uygun bir plan seçin" })).toBeVisible();
  await expect(section).toContainText("7 gün ücretsiz deneyin; kredi kartı gerekmez.");

  await expect(plans).toHaveCount(3);
  await expect(solo.getByRole("heading", { level: 3 })).toHaveText("Bireysel");
  await expect(solo.locator("[data-price]")).toHaveText("₺149 / ay");
  await expect(pro.getByRole("heading", { level: 3 })).toHaveText("Profesyonel");
  await expect(pro.locator("[data-price]")).toHaveText("₺399 / ay");
  await expect(pro).toContainText("En popüler");
  await expect(corp.getByRole("heading", { level: 3 })).toHaveText("Kurumsal");
  await expect(corp).toContainText("Size özel");
  for (const plan of [solo, pro, corp]) expect(await plan.getByRole("listitem").count()).toBeGreaterThanOrEqual(4);

  await expect(solo.getByRole("link", { name: "Ücretsiz dene: Bireysel" })).toHaveAttribute("href", "/#kayit");
  await expect(pro.getByRole("link", { name: "Ücretsiz dene: Profesyonel" })).toHaveAttribute("href", "/#kayit");
  await expect(corp.getByRole("link", { name: "Teklif alın" })).toHaveAttribute("href", "/is-birligi");
  await expect(section).toContainText("Fiyatlar güncellenebilir; kesin tutar kayıt ve ödeme adımında gösterilir.");
});

test("the yearly plan rolls the prices down to the 20% lower monthly figure, and back", async ({ page }) => {
  await page.goto("/");
  const { section, solo, pro, corp } = plansOf(page);
  const period = section.getByRole("group", { name: "Faturalandırma dönemi" });
  const monthly = period.getByRole("button", { name: "Aylık plan" });
  const yearly = period.getByRole("button", { name: /Yıllık plan/ });
  await expect(monthly).toHaveAttribute("aria-pressed", "true");
  await expect(solo).toContainText("Aylık faturalandırılır");

  await yearly.scrollIntoViewIfNeeded();
  await yearly.click();
  await expect(yearly).toHaveAttribute("aria-pressed", "true");
  await expect(solo.locator("[data-price]")).toHaveText("₺119 / ay");
  await expect(pro.locator("[data-price]")).toHaveText("₺319 / ay");
  await expect(solo).toContainText("Yıllık faturalandırılır");
  await expect(corp).toContainText("Size özel");
  // The figure is one rolling number, not a swapped text node.
  await expect(solo.locator("number-flow-react")).toHaveCount(1);

  await monthly.click();
  await expect(solo.locator("[data-price]")).toHaveText("₺149 / ay");
  await expect(pro.locator("[data-price]")).toHaveText("₺399 / ay");
});

test("with reduced motion, switching to yearly sends no confetti", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const yearly = page.locator("#planlar").getByRole("button", { name: /Yıllık plan/ });
  await yearly.scrollIntoViewIfNeeded();
  const canvases = await page.locator("body > canvas").count();
  await yearly.click();
  await page.waitForTimeout(400);
  await expect(page.locator("body > canvas")).toHaveCount(canvases);
});

test("a plan's trial button takes you to the sign-up form", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const btn = page.locator("#planlar").getByRole("link", { name: "Ücretsiz dene: Profesyonel" });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(page.locator("#kayit").getByLabel("Ad soyad")).toBeInViewport();
});
