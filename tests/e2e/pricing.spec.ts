import { test, expect } from "@playwright/test";

// The "Planlar" section on the home page: three plans, the middle one marked as the most popular.

test("the home page shows three plans with prices, the middle one marked most popular", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#planlar");
  await expect(section.getByRole("heading", { level: 2, name: "İşinize uygun bir plan seçin" })).toBeVisible();
  await expect(section).toContainText("7 gün ücretsiz deneyin; kredi kartı gerekmez.");

  const plans = section.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3 }) });
  await expect(plans).toHaveCount(3);
  const [solo, pro, corp] = [plans.nth(0), plans.nth(1), plans.nth(2)];
  await expect(solo.getByRole("heading", { level: 3 })).toHaveText("Bireysel");
  await expect(solo).toContainText("₺149");
  await expect(pro.getByRole("heading", { level: 3 })).toHaveText("Profesyonel");
  await expect(pro).toContainText("₺399");
  await expect(pro).toContainText("En popüler");
  await expect(corp.getByRole("heading", { level: 3 })).toHaveText("Kurumsal");
  await expect(corp).toContainText("Size özel");
  for (const plan of [solo, pro, corp]) expect(await plan.getByRole("listitem").count()).toBeGreaterThanOrEqual(4);

  await expect(solo.getByRole("link", { name: "Ücretsiz dene: Bireysel" })).toHaveAttribute("href", "/#kayit");
  await expect(pro.getByRole("link", { name: "Ücretsiz dene: Profesyonel" })).toHaveAttribute("href", "/#kayit");
  await expect(corp.getByRole("link", { name: "Teklif alın" })).toHaveAttribute("href", "/is-birligi");
  await expect(section).toContainText("Fiyatlar güncellenebilir; kesin tutar kayıt ve ödeme adımında gösterilir.");
});

test("a plan's trial button takes you to the sign-up form", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const btn = page.locator("#planlar").getByRole("link", { name: "Ücretsiz dene: Profesyonel" });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(page.locator("#kayit").getByLabel("Ad soyad")).toBeInViewport();
});
