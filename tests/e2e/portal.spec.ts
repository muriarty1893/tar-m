import { test, expect, type Page } from "@playwright/test";

// The home page below 1280 px (components/home/MobileHome.tsx), and the r10-style forum. These run at a
// phone's width in both projects. Signed out.

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
});

const weather = {
  current: { temperature_2m: 17.2, wind_speed_10m: 9, weather_code: 0, is_day: 1 },
  daily: {
    time: ["2026-11-05", "2026-11-06", "2026-11-07"],
    temperature_2m_min: [6, 5, 4],
    temperature_2m_max: [18, 17, 15],
    precipitation_probability_max: [5, 10, 20],
    precipitation_sum: [0, 0, 1],
    wind_speed_10m_max: [8, 10, 12],
    weather_code: [0, 1, 3],
    sunrise: ["2026-11-05T06:50", "2026-11-06T06:51", "2026-11-07T06:52"],
  },
};

async function mockWeather(page: Page) {
  await page.route("https://api.open-meteo.com/**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(weather) }));
}

const topic = (i: number) => ({
  id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
  title: `Örnek konu ${i}`,
  category: "bitki",
  excerpt: "",
  authorId: "user_test",
  authorName: "Test Çiftçi",
  authorHandle: "test",
  createdAt: "2026-11-01T09:00:00.000Z",
  replyCount: i,
  likeCount: 0,
  viewCount: 100 + i,
  lastReplyAt: null,
  lastReplyBy: null,
  photo: null,
  photoCount: 0,
  editedAt: null,
});

test("the Borsa home: search, sponsor, reklam, the news ticker, weather and Pazar side by side, then the forum", async ({ page }) => {
  await mockWeather(page);
  await page.goto("/");
  const main = page.locator("main");
  const search = main.getByRole("search", { name: "Sitede ara" });
  const sponsor = main.getByRole("button", { name: /sukocu\.com/ });
  const advertise = main.getByRole("link", { name: /Bu alanda reklam vermek için/ });
  const news = main.getByRole("region", { name: "Çiftçi destekleri & haberler" });
  const weatherBox = main.getByRole("link", { name: /^Hava durumu, Ankara: 17 derece/ });
  const market = main.getByRole("region", { name: "Pazar" });
  const forum = main.getByRole("region", { name: /^Forum/ });
  for (const part of [search, sponsor, advertise, news, weatherBox, market, forum]) await expect(part).toBeVisible();
  await expect(advertise).toHaveAttribute("href", "/is-birligi");
  await expect(news.getByRole("link", { name: "Çiftçi destekleri & haberler" })).toHaveAttribute("href", "/haberler");
  await expect(market.getByRole("link", { name: "Pazar", exact: true })).toHaveAttribute("href", "/pazar");
  await expect(weatherBox).toHaveAttribute("href", "/hava");

  // In that order, top to bottom; the two boxes share one line; the ticker is a bit thinner than the strips above it.
  const box = async (l: ReturnType<Page["locator"]>) => (await l.boundingBox())!;
  const order = [(await box(search)).y, (await box(sponsor)).y, (await box(advertise)).y, (await box(news)).y, (await box(weatherBox)).y, (await box(forum)).y];
  expect([...order].sort((a, b) => a - b)).toEqual(order);
  expect(Math.abs((await box(weatherBox)).y - (await box(market)).y)).toBeLessThan(2);
  expect((await box(news)).height).toBeLessThan((await box(sponsor)).height);

  await expect(forum.getByRole("link", { name: "Konu aç" })).toHaveAttribute("href", "/forum/yeni");
  await expect(forum.getByRole("group", { name: "Sıralama" }).getByRole("button")).toHaveText(["Son", "Yanıtlanan", "Popüler"]);
  await expect(forum.getByRole("link", { name: "Forumun tamamı" })).toHaveAttribute("href", "/forum");
});

test("topic rows end with their replies and views", async ({ page }) => {
  await page.route((url) => url.pathname === "/api/app/forum", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items: [topic(3)], total: 1, page: 1, pageSize: 20 }) }),
  );
  await page.goto("/");
  const forum = page.getByRole("region", { name: /^Forum/ });
  await forum.getByRole("button", { name: "Popüler" }).click();
  await expect(forum.getByRole("list", { name: "Popüler" }).getByRole("link")).toContainText(["3 yanıt, 103 görüntülenme"]);
});

test("the sponsor space says what it is when tapped", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /sukocu\.com/ }).click();
  const sheet = page.getByRole("dialog", { name: "Örnek sponsor alanı" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("link", { name: /iletişime geçin/ })).toHaveAttribute("href", "/is-birligi");
});

test("the weather tile follows the province picked on the weather page", async ({ page }) => {
  await mockWeather(page);
  await page.goto("/hava");
  await page.getByLabel("İl ara").fill("Konya");
  await page.getByRole("button", { name: "Konya", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Konya" })).toBeVisible();
  await page.goto("/");
  await expect(page.locator("main").getByRole("link", { name: /^Hava durumu, Konya/ })).toBeVisible();
  // Takvim shows the same place above the calendar.
  await page.goto("/takvim");
  await expect(page.locator("main").getByRole("link", { name: /^Hava durumu, Konya/ })).toBeVisible();
});

test("the forum grows with “Daha fazla göster”, as on r10.net", async ({ page }) => {
  const asked: string[] = [];
  await page.route((url) => url.pathname === "/api/app/forum", (route) => {
    const url = new URL(route.request().url());
    asked.push(url.search);
    const sayfa = Number(url.searchParams.get("sayfa"));
    const items = sayfa === 1 ? Array.from({ length: 20 }, (_, i) => topic(i + 1)) : Array.from({ length: 5 }, (_, i) => topic(i + 21));
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items, total: 25, page: sayfa, pageSize: 20 }) });
  });
  await page.goto("/");
  const forum = page.getByRole("region", { name: "Forum" });
  await forum.getByRole("button", { name: "Popüler" }).click();
  const list = forum.getByRole("list", { name: "Popüler" });
  await expect(list.getByRole("listitem")).toHaveCount(20);
  await forum.getByRole("button", { name: "Daha fazla göster" }).click();
  await expect(list.getByRole("listitem")).toHaveCount(25);
  await expect(list.getByRole("link", { name: /Örnek konu 25/ })).toBeVisible();
  await expect(forum.getByRole("button", { name: "Daha fazla göster" })).toHaveCount(0);
  await expect(forum.getByText("Hepsi bu kadar.")).toBeVisible();
  expect(asked).toEqual(["?sirala=populer&sayfa=1", "?sirala=populer&sayfa=2"]);
});

test("/forum lists the sections r10-style, and a section's page has its topics", async ({ page }) => {
  await page.goto("/forum");
  const sections = page.getByRole("region", { name: "Kategoriler" });
  await expect(sections).toBeVisible();
  for (const name of ["Bitkisel üretim", "Hayvancılık", "Makine ve ekipman", "Destek ve teşvik", "Fiyat ve pazar", "Genel"]) {
    await expect(sections.getByRole("link", { name: new RegExp(`^${name}`) })).toBeVisible();
  }
  await sections.getByRole("link", { name: /^Bitkisel üretim/ }).click();
  await expect(page).toHaveURL(/\/forum\/k\/bitki$/);
  await expect(page.getByRole("heading", { level: 1, name: "Bitkisel üretim" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Konum" }).getByRole("link", { name: "Forum" })).toHaveAttribute("href", "/forum");
  // Signed out, "konu aç" asks to sign in first and comes back to this section's form.
  await expect(page.getByRole("link", { name: "Bu kategoride konu aç" })).toHaveAttribute("href", /\/giris\?redirect_url=.*kategori%3Dbitki/);
});

test("an unknown category shows the Turkish not-found page, not indexed", async ({ page }) => {
  // The page streams (Suspense), so the status is already sent; Next marks the page noindex instead.
  await page.goto("/forum/k/boyle-bir-kategori-yok");
  await expect(page.getByRole("heading", { name: "Sayfa bulunamadı" })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
});

test("signed out, Konu aç and the admins' category page ask to sign in", async ({ page }) => {
  for (const path of ["/forum/yeni", "/yonetim/forum"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/giris\?redirect_url=/);
  }
});

test("the search box lists results while typing, each with its kind, and opens one", async ({ page }) => {
  await page.route(
    (url) => url.pathname === "/api/ara",
    (route) =>
      route.fulfill({
        json: {
          items: [
            { kind: "konu", key: "konu-1", title: "Traktörde hidrolik ısınıyor", detail: "Makine ve ekipman · 7 yanıt", href: "/forum" },
            { kind: "yanit", key: "yanit-1", title: "Filtreyi temizleyin", detail: "Hasan D. · “Traktörde hidrolik ısınıyor”", href: "/forum" },
            { kind: "ilan", key: "ilan-1", title: "Traktör, 75 beygir", detail: "1.350.000 ₺ · Merkez, Konya", href: "/pazar" },
            { kind: "haber", key: "haber-1", title: "Kış öncesi traktör bakımı", detail: "Haber · 6 Kasım 2026", href: "/haberler" },
          ],
        },
      }),
  );
  await page.goto("/");
  const box = page.locator("main").getByRole("combobox", { name: "Forumda, Pazar’da ve haberlerde ara" });
  await box.fill("traktör");
  const options = page.getByRole("listbox", { name: "Arama önerileri" }).getByRole("option");
  await expect(options).toHaveText([/^Konu\s*Traktörde/, /^Yanıt\s*Filtreyi/, /^Pazar\s*Traktör, 75/, /^Haber\s*Kış öncesi/, "“traktör” için tüm sonuçlar →"]);
  await expect(box).toHaveAttribute("aria-expanded", "true");
  for (let i = 0; i < 3; i++) await box.press("ArrowDown");
  await expect(box).toHaveAttribute("aria-activedescendant", /oneri-2$/);
  await box.press("Enter");
  await expect(page).toHaveURL(/\/pazar$/);
});

test("the home search looks through the forum and Pazar", async ({ page }) => {
  await page.goto("/");
  await page.locator("main").getByRole("combobox", { name: "Forumda, Pazar’da ve haberlerde ara" }).fill("zzqq yok böyle");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/ara\?q=/);
  await expect(page.getByRole("heading", { level: 1, name: "“zzqq yok böyle” için sonuçlar" })).toBeVisible();
  await expect(page.getByText("Forumda bu kelimelerle konu yok.")).toBeVisible();
  await expect(page.getByText("Pazar’da bu kelimelerle ilan yok.")).toBeVisible();
});

test("Takvim: today's weather sits on top of the calendar, reached from the Hızlı menü", async ({ page }) => {
  await mockWeather(page);
  await page.goto("/takvim");
  const tile = page.locator("main").getByRole("link", { name: /^Hava durumu, Ankara/ });
  await expect(tile).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Alt menü" }).getByRole("button", { name: "Hızlı menü" })).toHaveAttribute("aria-current", "page");
});
