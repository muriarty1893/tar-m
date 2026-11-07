import { test, expect } from "@playwright/test";

// The home page is the Borsa portal on every screen (portal.spec.ts has the phone's details).

test("wide screens: the portal in the phone's order, the ad strips side by side, the forum's sections beside the topics", async ({ page, isMobile }) => {
  test.skip(isMobile, "the wide layout");
  await page.route("https://api.open-meteo.com/**", (r) => r.fulfill({ status: 500, body: "{}" }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const main = page.locator("main");
  await expect(main.getByRole("heading", { level: 1 })).toHaveCount(1);
  const box = async (l: ReturnType<typeof main.locator>) => (await l.boundingBox())!;
  const search = await box(main.getByRole("search", { name: "Sitede ara" }));
  const sponsor = await box(main.getByRole("button", { name: /sukocu\.com/ }));
  const advertise = await box(main.getByRole("link", { name: /Bu alanda reklam vermek için/ }));
  const weather = await box(main.getByRole("link", { name: /^Hava durumu/ }));
  const market = await box(main.getByRole("region", { name: "Pazar" }));
  const forum = await box(main.locator("#forum"));
  const sections = await box(main.getByRole("region", { name: "Forum bölümleri" }));
  expect(search.y).toBeLessThan(sponsor.y);
  expect(Math.abs(sponsor.y - advertise.y)).toBeLessThan(2);
  expect(advertise.y).toBeLessThan(weather.y);
  expect(Math.abs(weather.y - market.y)).toBeLessThan(2);
  expect(weather.y).toBeLessThan(forum.y);
  expect(Math.abs(forum.y - sections.y)).toBeLessThan(2);
  expect(sections.x).toBeGreaterThan(forum.x + forum.width - 1);
});

test("the old landing page is gone: no hero, no pricing", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-cine]")).toHaveCount(0);
  for (const gone of ["İşinize uygun bir plan seçin", "Sitede bugün açık olanlar", "Birlikte büyüyelim"]) {
    await expect(page.getByRole("heading", { name: gone })).toHaveCount(0);
  }
});

test("the demo, the scan explainer and the early-access list are gone", async ({ page }) => {
  await page.goto("/");
  for (const gone of ["Uygulamayı deneyin", "Nasıl çalışacak?", "Neler yapabilir?", "Erken erişim listesine katılın"]) {
    await expect(page.getByRole("heading", { name: gone })).toHaveCount(0);
  }
  await expect(page.locator("#demo, #nasil-calisir, #kayit")).toHaveCount(0);
});

const ROUTES = ["/", "/forum", "/pazar", "/takvim", "/ara", "/haberler", "/hava", "/is-birligi", "/sss", "/hakkimizda", "/gizlilik", "/kaynaklar"];

test("every route returns 200 with a unique title", async ({ page }) => {
  const titles = new Set<string>();
  for (const route of ROUTES) {
    const res = await page.goto(route);
    expect(res?.status(), route).toBe(200);
    const title = await page.title();
    expect(title, route).toContain("Çiftçi Destek");
    expect(titles.has(title), `duplicate title on ${route}: ${title}`).toBe(false);
    titles.add(title);
  }
});

test("no horizontal scroll at 375 px on any route", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const route of ROUTES) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, route).toBeLessThanOrEqual(0);
  }
});

test("FAQ has at least 6 questions that expand", async ({ page }) => {
  await page.goto("/sss");
  const triggers = page.locator('main [data-slot="accordion-trigger"]');
  expect(await triggers.count()).toBeGreaterThanOrEqual(6);
  const first = triggers.first();
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Türkçe bir dijital tarım rehberi", { exact: false })).toBeVisible();
});

test("privacy page is a KVKK draft with the legal-review note", async ({ page }) => {
  await page.goto("/gizlilik");
  await expect(page.getByText("Taslak — hukuki inceleme gereklidir.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("KVKK");
});

test("partner page covers problem, solution and market and has the form", async ({ page }) => {
  await page.goto("/is-birligi");
  for (const h of ["Sorun", "Çözümümüz", "Pazar ve fırsat"]) {
    await expect(page.getByRole("heading", { name: h })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Mesajı gönder" })).toBeVisible();
});
