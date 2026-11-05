import { test, expect } from "@playwright/test";

// The website's tools. These run signed out; the signed-in flows (posting, chats, offers,
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

test("Pazar: search, categories and the post-a-listing button are in view", async ({ page, isMobile }) => {
  await page.goto("/pazar");
  await expect(page.getByRole("heading", { level: 1, name: isMobile ? "Pazar" : "Çiftçi Pazarı" })).toBeVisible();
  await expect(page.getByRole("search", { name: "İlan ara" })).toBeVisible();
  const cats = page.getByRole("navigation", { name: "Kategoriler" });
  for (const name of ["Ürün", "Tohum & Gübre", "Alet", "Ekipman", "Araç"]) await expect(cats.getByRole("link", { name })).toBeVisible();
  if (!isMobile) await expect(cats.getByRole("link", { name: "Tümü" })).toBeVisible();
  await expect(page.getByRole("link", { name: "İlan ver" }).first()).toHaveAttribute("href", "/pazar/ilan-ver");
  // One safety note per layout (above the listings on wide screens, below them on phones).
  await expect(page.getByText(/Güvenli alışveriş/).filter({ visible: true })).toBeVisible();
});

test("Pazar on phones, as on sahibinden: a category list with counts, then the listings as rows", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phones only");
  await page.goto("/pazar");
  const cats = page.getByRole("navigation", { name: "Kategoriler" });
  await expect(cats.getByText("Kategoriler")).toBeVisible();
  await expect(cats.getByRole("link", { name: /^Araç \(\d+\)$/ })).toBeVisible();
  await expect(page.getByText("Son ilanlar")).toBeVisible();
  // The grid of cards is the wide-screen view; phones list rows with the photo on the left.
  await expect(page.locator("main ul.grid").filter({ visible: true })).toHaveCount(0);
});

test("Pazar: a category is kept in the address and marked as current", async ({ page, isMobile }) => {
  await page.goto("/pazar");
  await page.getByRole("navigation", { name: "Kategoriler" }).getByRole("link", { name: /^Araç/ }).click();
  await expect(page).toHaveURL(/\/pazar\?kategori=arac$/);
  if (isMobile) {
    // The phone shows where you are, with a way back to every category.
    await expect(page.getByText("Pazar ›")).toBeVisible();
    await expect(page.getByRole("link", { name: "Kategoriyi kaldır" })).toHaveAttribute("href", "/pazar");
  } else {
    await expect(page.getByRole("navigation", { name: "Kategoriler" }).getByRole("link", { name: "Araç" })).toHaveAttribute("aria-current", "page");
  }
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
  await expect(page.getByRole("link", { name: "Ücretsiz hesap aç", exact: true })).toHaveAttribute("href", "/kayit?redirect_url=%2Ftarlalarim");
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

test("the wide-screen home shows what works today, and says nothing of an AI scan", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones get the portal home (portal.spec.ts)");
  await page.goto("/");
  const tools = page.locator("#araclar");
  await expect(tools.getByRole("heading", { level: 2, name: "Sitede bugün açık olanlar" })).toBeVisible();
  for (const name of [/^Pazar/, /^Borsa fiyatları/, /^Hava durumu/, /^Tarım takvimi/, /^Tarlalarım/]) await expect(tools.getByRole("link", { name })).toBeVisible();
  // What is on screen (innerText leaves out the phone layout, hidden here), news aside: articles are
  // written by the admins on /yonetim/haberler, not by the site.
  const text = await page.locator("main").evaluate((el) => {
    const copy = el.cloneNode(true) as HTMLElement;
    copy.querySelector("#haberler")?.remove();
    document.body.appendChild(copy);
    const visible = copy.innerText;
    copy.remove();
    return visible;
  });
  expect(text).not.toMatch(/yapay zek|taraması|Hastalık Tara/i);
});

test("the admin dashboard asks signed-out visitors to sign in", async ({ page }) => {
  for (const path of ["/yonetim", "/yonetim/haberler/yeni"]) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`/giris\\?redirect_url=${encodeURIComponent(path)}`));
  }
});

test("news come from the dashboard: published articles are listed, without admin links for visitors", async ({ page }) => {
  await page.goto("/haberler");
  await expect(page.locator("main article").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Haber ekle" })).toHaveCount(0);
});
