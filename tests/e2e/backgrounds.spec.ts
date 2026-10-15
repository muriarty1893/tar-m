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

test("footer credits the maker with a link to their website and a plain-text heart", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer).toContainText("vibecoded with ♡ by Murat Eker");
  await expect(footer.getByRole("link", { name: "Murat Eker" })).toHaveAttribute("href", "https://murateker.com.tr");
  expect(await footer.textContent()).not.toMatch(/\p{Emoji_Presentation}|\uFE0F/u);
});

test("footer: the brand name spans the full width, with Türkiye's time and the contact address", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  const mark = footer.getByTestId("footer-wordmark");
  await expect(mark).toHaveText("BEREKET AI");
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
  await expect(footer.getByTestId("footer-clock")).toHaveText(/TÜRKİYE \(GMT\+3\) \d{2}:\d{2}/);
  await expect(footer.getByRole("link", { name: "iletisim@bereketai.com" })).toHaveAttribute("href", "mailto:iletisim@bereketai.com");
  for (const name of ["Hakkımızda", "İş Birliği", "Haberler", "Hava Durumu", "SSS", "Gizlilik ve KVKK", "Görsel kaynakları"])
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
