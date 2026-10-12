import { test, expect } from "@playwright/test";

test("news list shows sample articles newest first and opens one", async ({ page }) => {
  await page.goto("/haberler");
  await expect(page.getByRole("heading", { level: 1, name: "Haberler" })).toBeVisible();

  const titles = page.locator("article h2");
  await expect(titles).toHaveCount(3);
  await expect(titles.first()).toHaveText("Bereket AI erken erişim listesi açıldı");

  await page.getByRole("link", { name: "Buğdayda sarı pas hastalığına karşı erken uyarı işaretleri" }).click();
  await expect(page).toHaveURL(/\/haberler\/bugdayda-pas-hastaligi$/);
  // Cache Components keeps the previous route mounted but hidden; assert on visible content only.
  await expect(page.getByRole("heading", { level: 1 }).filter({ visible: true })).toHaveText(
    "Buğdayda sarı pas hastalığına karşı erken uyarı işaretleri",
  );
  await expect(page.getByText("3 Ekim 2026").filter({ visible: true })).toBeVisible();
  await expect(page).toHaveTitle(/Buğdayda sarı pas.*\| Bereket AI/);
});

test("unknown article slug shows a Turkish not-found page that is not indexed", async ({ page }) => {
  await page.goto("/haberler/boyle-bir-haber-yok");
  await expect(page.getByRole("heading", { name: "Sayfa bulunamadı" })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
});
