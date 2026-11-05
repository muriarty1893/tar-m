import { test, expect } from "@playwright/test";

test("home page has Turkish lang and the brand name in the top bar", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page.locator("header")).toContainText("Çiftçi Destek");
});

test("phones: the top bar holds the logo, the name and Giriş yap; there is no burger menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/hakkimizda");
  const header = page.locator("header");
  await expect(header.getByRole("link", { name: "Çiftçi Destek" }).first()).toBeVisible();
  await expect(header.getByRole("link", { name: "Giriş yap" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Menüyü aç" })).toHaveCount(0);
});

test("phones: the tab bar has Ana sayfa, Pazar, Takvim & Hava and Hızlı menü, the current one marked", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/pazar");
  const tabs = page.getByRole("navigation", { name: "Alt menü" });
  await expect(tabs).toBeVisible();
  await expect(tabs.getByRole("link", { name: "Ana sayfa" })).toHaveAttribute("href", "/");
  await expect(tabs.getByRole("link", { name: "Pazar" })).toHaveAttribute("aria-current", "page");
  await expect(tabs.getByRole("link", { name: "Takvim & Hava" })).toHaveAttribute("href", "/takvim");
  await expect(tabs.getByRole("button", { name: "Hızlı menü" })).toBeVisible();
  // The page ends above the bar: the last of the footer isn't hidden under it.
  const bar = (await tabs.boundingBox())!;
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const legal = page.locator("footer").getByText(/© 2026/).first();
  const last = (await legal.boundingBox())!;
  expect(last.y + last.height).toBeLessThanOrEqual(bar.y + 1);
});

test("phones: Hızlı menü opens the other tools; a tile goes there and closes the sheet", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/pazar");
  await page.getByRole("button", { name: "Hızlı menü" }).click();
  const sheet = page.getByRole("dialog", { name: "Hızlı menü" });
  await expect(sheet).toBeVisible();
  for (const name of ["Forum", "Konu aç", "İlan ver", "Fiyatlar", "Hava durumu", "Tarım takvimi", "Tarlalarım", "Haberler"]) {
    await expect(sheet.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(sheet.getByRole("link", { name: "Giriş yap" })).toBeVisible();
  await sheet.getByRole("link", { name: "Fiyatlar", exact: true }).click();
  await expect(page).toHaveURL(/\/fiyatlar$/);
  await expect(sheet).toHaveCount(0);
});

test("wide screens keep the top menu and have no tab bar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pazar");
  await expect(page.getByRole("navigation", { name: "Ana menü" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Alt menü" })).toBeHidden();
});
