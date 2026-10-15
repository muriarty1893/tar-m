import { test, expect } from "@playwright/test";

const SHAPES = ".blob-bg, [class*='dot-texture'], [class*='bg-blob']";

for (const path of ["/", "/hava", "/haberler", "/is-birligi", "/sss", "/hakkimizda", "/gizlilik", "/haberler/bugdayda-pas-hastaligi"]) {
  test(`${path}: no decorative shapes behind sections`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(SHAPES)).toHaveCount(0);
  });
}

test("subpage header band: a real wheat-field photo behind the title, credited in the band", async ({ page }) => {
  await page.goto("/sss");
  const band = page.getByTestId("page-hero");
  await expect(band.locator("img")).toHaveAttribute("src", /susehri-wheat/);
  await expect(band.getByRole("heading", { level: 1 })).toBeVisible();
  const credit = band.getByRole("link", { name: /Maurice Flesier/ });
  await expect(credit).toHaveAttribute("href", /commons\.wikimedia\.org/);
  await expect(band.getByRole("link", { name: "CC BY-SA 4.0" })).toHaveAttribute("href", /by-sa\/4\.0/);
});

test("about page keeps the photo inside its title instead of behind it", async ({ page }) => {
  await page.goto("/hakkimizda");
  const band = page.getByTestId("page-hero");
  await expect(band.locator("h1 img")).toHaveCount(1);
  await expect(band.locator(":scope > img, [data-hero-photo]")).toHaveCount(0);
});

test("footer credit reads like the reference: 'BY ME' rolls into the maker's full name", async ({ page, isMobile }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  const credit = footer.getByRole("link", { name: "vibecoded with love by Murat Eker" });
  await expect(credit).toHaveAttribute("href", "https://murateker.com.tr");
  await expect(credit).toContainText("VIBECODED WITH ♡ BY");
  expect(await footer.textContent()).not.toMatch(/\p{Emoji_Presentation}|\uFE0F/u);
  test.skip(isMobile, "hover is a pointer interaction");
  const full = credit.locator(".site-footer__fullname");
  await credit.scrollIntoViewIfNeeded();
  await expect(full).toHaveCSS("translate", /0px [1-9]/);
  await credit.hover();
  await expect(full).toHaveCSS("translate", "0px");
  await expect(credit.locator(".site-footer__initials")).toHaveCSS("translate", /0px -/);
});

test("footer bracket links roll their letters on hover, a copy rolling in from below", async ({ page, isMobile }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  for (const name of ["SSS", "Gizlilik ve KVKK", "Görsel kaynakları"]) {
    const link = footer.getByRole("link", { name, exact: true });
    await expect(link).toBeVisible();
    await expect(link.locator(".roll__row")).toHaveCount(2);
  }
  test.skip(isMobile, "hover is a pointer interaction");
  const link = footer.getByRole("link", { name: "Gizlilik ve KVKK", exact: true });
  const first = link.locator(".roll__row").first().locator("span").first();
  const clone = link.locator(".roll__row--clone span").first();
  await link.scrollIntoViewIfNeeded();
  await expect(first).toHaveCSS("translate", "none");
  await link.hover();
  await expect(first).toHaveCSS("translate", "0px -100%");
  await expect(clone).toHaveCSS("translate", "0px");
});

test("footer: the brand name spans the full width, with Türkiye's time and the contact address", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  const mark = footer.getByTestId("footer-wordmark");
  await expect(mark).toHaveText("ÇİFTÇİ DESTEK");
  const [markW, innerW, overflow] = await mark.evaluate((el) => {
    const box = el.parentElement!.getBoundingClientRect();
    const cs = getComputedStyle(el.parentElement!);
    const inner = box.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const range = document.createRange();
    range.selectNodeContents(el);
    return [range.getBoundingClientRect().width, inner, document.documentElement.scrollWidth - innerWidth];
  });
  expect(markW / innerW).toBeGreaterThan(0.9);
  expect(markW / innerW).toBeLessThanOrEqual(1.01);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(footer.getByTestId("footer-clock")).toHaveText(/TÜRKİYE: \(GMT\+3\) \d{2}:\d{2}/);
  await expect(footer.getByRole("link", { name: "iletisim@bereketai.com" })).toHaveAttribute("href", "mailto:iletisim@bereketai.com");
  for (const name of ["Hakkımızda", "İş Birliği", "Haberler", "Hava Durumu"])
    await expect(footer.getByRole("link", { name, exact: true })).toBeVisible();
});

test("demo result: the success estimate is a half donut chart", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#demo");
  const demo = page.locator("#demo");
  await demo.getByRole("button", { name: /Domates bahçesi/ }).click();
  await demo.getByRole("button", { name: "Fotoğraf çek", exact: true }).click();
  const meter = demo.getByRole("meter", { name: "Hasat başarı tahmini" });
  await expect(meter).toHaveAttribute("aria-valuenow", "48", { timeout: 4000 });
  await expect(meter.locator(".recharts-pie-sector")).toHaveCount(2);
});

test("footer runs from one side of a wide screen to the other, with only a small margin", async ({ page, isMobile }) => {
  test.skip(isMobile, "wide screens only");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  const mark = page.locator("footer").getByTestId("footer-wordmark");
  await mark.scrollIntoViewIfNeeded();
  const box = (await mark.boundingBox())!;
  expect(box.x).toBeLessThan(1920 * 0.05);
  expect(box.width).toBeGreaterThan(1920 * 0.88);
  const email = (await page.locator("footer").getByRole("link", { name: "iletisim@bereketai.com" }).boundingBox())!;
  expect(1920 - (email.x + email.width)).toBeLessThan(1920 * 0.05);
});
