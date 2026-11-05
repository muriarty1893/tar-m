import { test, expect } from "@playwright/test";

// The wide-screen home (the landing page); phones and tablets get the portal (portal.spec.ts).
const LANDING_SECTIONS = [
  "Sitede bugün açık olanlar",
  "Bugün tarlanızda hava nasıl?",
  "Son haberler",
  "İşinize uygun bir plan seçin",
  "Birlikte büyüyelim",
  "Aklınıza takılan bir şey mi var?",
];

test("landing page has every section in spec order", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones get the portal home");
  await page.route("https://api.open-meteo.com/**", (r) => r.fulfill({ status: 500, body: "{}" }));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const h2s = await page.locator("main h2").allInnerTexts();
  const found = LANDING_SECTIONS.map((s) => h2s.findIndex((h) => h.trim() === s));
  expect(found.every((i) => i >= 0), `missing sections; got ${JSON.stringify(h2s)}`).toBe(true);
  expect([...found].sort((a, b) => a - b)).toEqual(found);
});

test("the demo, the scan explainer and the early-access list are gone", async ({ page }) => {
  await page.goto("/");
  for (const gone of ["Uygulamayı deneyin", "Nasıl çalışacak?", "Neler yapabilir?", "Erken erişim listesine katılın"]) {
    await expect(page.getByRole("heading", { name: gone })).toHaveCount(0);
  }
  await expect(page.locator("#demo, #nasil-calisir, #kayit")).toHaveCount(0);
});

test("landing sections are visible without JavaScript (reveal animation is an enhancement)", async ({ browser, isMobile }) => {
  test.skip(isMobile, "phones get the portal home");
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto("/");
  for (const name of ["Sitede bugün açık olanlar", "Son haberler", "Birlikte büyüyelim"]) {
    const heading = page.getByRole("heading", { level: 2, name });
    await heading.scrollIntoViewIfNeeded();
    const opacity = await heading.evaluate((el) => {
      let node: Element | null = el;
      let o = 1;
      while (node) {
        o *= Number(getComputedStyle(node).opacity);
        node = node.parentElement;
      }
      return o;
    });
    expect(opacity, name).toBe(1);
  }
  await context.close();
});

test("landing CTA (a free account) is in the hero", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones get the portal home");
  await page.goto("/");
  await expect(page.locator("[data-cine='card']").getByRole("link", { name: "Ücretsiz hesap açın" })).toHaveAttribute("href", "/kayit");
});

test("landing shows the 3 latest news items", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#haberler article")).toHaveCount(3);
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
