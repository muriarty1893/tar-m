import { test, expect } from "@playwright/test";

// The website's tools without AI. These run signed out; the signed-in flows (posting, chats, offers,
// calendar, fields) were checked by hand with Clerk test users (docs/accounts-and-market.md).

test("the header menu lists the tools that work on the site", async ({ page, isMobile }) => {
  test.skip(isMobile, "the pill nav is the desktop bar");
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Ana menü" });
  for (const name of ["Pazar", "Fiyatlar", "Hava Durumu", "Takvim", "Tarlalarım", "Haberler"]) {
    await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(page.locator("header").getByRole("link", { name: "Giriş yap" })).toBeVisible();
});

test("Pazar: search, categories and the post-a-listing button are in view", async ({ page }) => {
  await page.goto("/pazar");
  await expect(page.getByRole("heading", { level: 1, name: "Çiftçi Pazarı" })).toBeVisible();
  await expect(page.getByRole("search", { name: "İlan ara" })).toBeVisible();
  const cats = page.getByRole("navigation", { name: "Kategoriler" });
  for (const name of ["Tümü", "Ürün", "Tohum & Gübre", "Alet", "Ekipman", "Araç"]) await expect(cats.getByRole("link", { name })).toBeVisible();
  await expect(page.getByRole("link", { name: "İlan ver" }).first()).toHaveAttribute("href", "/pazar/ilan-ver");
  await expect(page.getByText(/Güvenli alışveriş/)).toBeVisible();
});

test("Pazar: a category is kept in the address and marked as current", async ({ page }) => {
  await page.goto("/pazar");
  await page.getByRole("navigation", { name: "Kategoriler" }).getByRole("link", { name: "Araç" }).click();
  await expect(page).toHaveURL(/\/pazar\?kategori=arac$/);
  await expect(page.getByRole("navigation", { name: "Kategoriler" }).getByRole("link", { name: "Araç" })).toHaveAttribute("aria-current", "page");
});

test("signed out, private pages send you to sign in and back", async ({ page }) => {
  await page.goto("/mesajlar");
  await expect(page).toHaveURL(/\/giris\?redirect_url=%2Fmesajlar/);
  await expect(page.getByRole("heading", { level: 1, name: "Giriş yapın" })).toBeVisible();
});

test("signed out, Takvim and Tarlalarım explain the account instead of failing", async ({ page }) => {
  await page.goto("/takvim");
  await expect(page.getByRole("heading", { name: "Takviminizi kaydetmek için giriş yapın" })).toBeVisible();
  await page.goto("/tarlalarim");
  await expect(page.getByRole("heading", { name: "Tarlalarınızı kaydetmek için giriş yapın" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ücretsiz hesap aç" })).toHaveAttribute("href", "/kayit?redirect_url=%2Ftarlalarim");
});

test("Fiyatlar: sample prices are labelled, and search and groups narrow the list", async ({ page }) => {
  await page.goto("/fiyatlar");
  await expect(page.getByRole("note")).toContainText("Örnek veriler");
  await expect(page.getByText("14 ürün")).toBeVisible();
  await page.getByRole("group", { name: "Ürün grupları" }).getByRole("button", { name: "Baklagil" }).click();
  await expect(page.getByText("3 ürün")).toBeVisible();
  await page.getByLabel("Ürün ya da borsa ara").fill("nohut");
  await expect(page.getByText("1 ürün")).toBeVisible();
});

test("the home page shows what works today, and marks the AI scan as coming", async ({ page }) => {
  await page.goto("/");
  const tools = page.locator("#araclar");
  await expect(tools.getByRole("heading", { level: 2, name: "Sitede bugün açık olanlar" })).toBeVisible();
  for (const name of [/^Pazar/, /^Borsa fiyatları/, /^Hava durumu/, /^Tarım takvimi/, /^Tarlalarım/]) await expect(tools.getByRole("link", { name })).toBeVisible();
  await expect(page.locator("#ozellikler").getByText("Yakında, uygulamada").first()).toBeVisible();
  await expect(page.locator("#demo")).toContainText("yapay zekâ taraması yakında");
});
