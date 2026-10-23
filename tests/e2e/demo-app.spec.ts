import { expect, test, type Page } from "@playwright/test";

const CANVAS = 'canvas[aria-label*="3B akıllı telefon"]';

/** The demo phone's app, loaded and resting on its home screen. */
async function openApp(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await expect(demo.locator(CANVAS)).toBeVisible({ timeout: 20_000 });
  const app = demo.getByTestId("uygulama-ekrani");
  await expect(app.getByText("Hızlı Menü Kısayolları")).toBeVisible();
  return app;
}

test("Pazar: search, favourite a listing, and find it under Favoriler", async ({ page }) => {
  const app = await openApp(page);
  await app.getByRole("navigation", { name: "Uygulama menüsü" }).getByRole("button", { name: "Pazar" }).click();
  const listings = app.getByRole("list", { name: "İlanlar" });
  await expect(app.getByText("14 ilan · Konya ve çevresi")).toBeVisible();

  await app.getByPlaceholder("Traktör, buğday, pulverizatör…").fill("traktor");
  await expect(listings.getByRole("button", { name: /Massey Ferguson 3085/ })).toBeVisible();
  await expect(listings.getByRole("button", { name: /Ekmeklik buğday/ })).toHaveCount(0);

  await listings.getByRole("button", { name: "Favorilere ekle" }).first().click();
  await app.getByRole("radio", { name: "Favoriler" }).click();
  await app.getByRole("button", { name: "Aramayı temizle" }).click();
  await expect(app.getByText("1 ilan")).toBeVisible();
});

test("a listing: the seller answers a message by script, and an offer gets a counter-offer", async ({ page }) => {
  const app = await openApp(page);
  await app.getByRole("list", { name: "Yeni ilanlar" }).getByRole("button", { name: /Massey Ferguson 3085/ }).click();
  await expect(app.getByText("Pazarlık payı var")).toBeVisible();

  await app.getByRole("button", { name: "Mesaj gönder" }).click();
  const chat = app.getByRole("log", { name: "Sohbet" });
  // The sample inbox already has a chat about this tractor, with the seller's counter-offer waiting.
  await expect(chat.getByText("645.000 ₺")).toBeVisible();
  await app.getByRole("button", { name: "Nerede görebilirim?" }).click();
  await expect(chat.getByText(/Ereğli, Konya tarafındayım/)).toBeVisible({ timeout: 4000 });

  await app.getByRole("button", { name: "Teklif ver", exact: true }).first().click();
  await app.getByLabel(/Teklifiniz/).fill("500.000");
  await app.getByRole("button", { name: "Teklifi gönder" }).click();
  await expect(chat.getByText("595.000 ₺")).toBeVisible({ timeout: 4000 });
  await expect(chat.getByRole("button", { name: "Kabul et" })).toBeVisible();
});

test("İlan ver: errors are listed before publishing, then the new listing opens and shows under İlanlarım", async ({ page }) => {
  const app = await openApp(page);
  await app.getByRole("button", { name: "İlan Ver" }).click();
  await app.getByRole("button", { name: "İlanı yayınla" }).click();
  await expect(app.getByText("Yayınlamadan önce düzeltin")).toBeVisible();

  await app.getByLabel("Başlık").fill("Az kullanılmış römork");
  await app.getByRole("radio", { name: "Araç" }).click();
  await app.getByLabel("Fiyat (₺)").fill("145.000");
  await app.getByRole("button", { name: "İlanı yayınla" }).click();
  await expect(app.getByText("İlanınız yayında. Gelen mesajlar Mesajlar’a düşecek.")).toBeVisible();
  await expect(app.getByText("145.000 ₺")).toBeVisible();

  await app.getByRole("button", { name: "Geri" }).click();
  await app.getByRole("navigation", { name: "Uygulama menüsü" }).getByRole("button", { name: "Pazar" }).click();
  await app.getByRole("radio", { name: "İlanlarım" }).click();
  await expect(app.getByRole("list", { name: "İlanlar" }).getByRole("button", { name: /Az kullanılmış römork/ })).toBeVisible();
});

test("the bell opens Mesajlar with the unread chats", async ({ page }) => {
  const app = await openApp(page);
  await app.getByRole("button", { name: /^Bildirimler: 2 okunmamış/ }).click();
  await expect(app.getByText("2 okunmamış sohbet")).toBeVisible();
  await app.getByRole("button", { name: /Hüseyin Öztürk/ }).click();
  await expect(app.getByRole("log", { name: "Sohbet" }).getByText("Selam, pompa hâlâ duruyor mu?")).toBeVisible();
  await app.getByRole("button", { name: "Geri" }).click();
  await expect(app.getByText("1 okunmamış sohbet")).toBeVisible();
});

test("Tarlalarım, a field, the field map and the prices open from the home screen", async ({ page }) => {
  const app = await openApp(page);
  await app.getByRole("button", { name: "Tarlalarım" }).click();
  await expect(app.getByText("103 dönüm")).toBeVisible();
  await app.getByRole("button", { name: /Domates serası/ }).click();
  await expect(app.getByText("Hemen müdahale gerekiyor")).toBeVisible();
  await expect(app.getByText("Damla sulamayı kontrol et")).toBeVisible();
  await app.getByRole("button", { name: "Geri" }).click();

  await app.getByRole("button", { name: "Haritada gör" }).click();
  // The map opens on the field that most needs a look; the name tags pick another.
  await expect(app.getByRole("button", { name: "Domates serası, Riskli" })).toHaveAttribute("aria-pressed", "true");
  await app.getByRole("button", { name: "Ayçiçeği tarlası, Sağlıklı" }).click();
  await expect(app.getByText("0,74")).toBeVisible();
  await app.getByRole("button", { name: "Geri" }).click();
  await app.getByRole("button", { name: "Geri" }).click();

  await app.getByRole("button", { name: "Tüm fiyatları gör" }).click();
  await expect(app.getByText("14 ürün · örnek fiyatlar")).toBeVisible();
  await app.getByRole("radio", { name: "Baklagil" }).click();
  await expect(app.getByText("3 ürün · örnek fiyatlar")).toBeVisible();
});
