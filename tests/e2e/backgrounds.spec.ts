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

test("the footer is one thin band: the info pages, the contact address and the copyright", async ({ page, isMobile }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  // Phones: two short lines (Hakkımızda and İş birliği are in the Hızlı menü there).
  const names = ["SSS", "Pazar kuralları", "Gizlilik ve KVKK", "Görsel kaynakları", ...(isMobile ? [] : ["Hakkımızda", "İş birliği"])];
  for (const name of names) await expect(footer.getByRole("link", { name, exact: true })).toBeVisible();
  await expect(footer.getByRole("link", { name: "iletisim@bereketai.com" })).toHaveAttribute("href", "mailto:iletisim@bereketai.com");
  await expect(footer.getByText(/© 2026 Çiftçi Destek/)).toBeVisible();
  // No maker credit, no big wordmark.
  await expect(footer).not.toContainText(/vibecoded/i);
  expect(await footer.textContent()).not.toMatch(/\p{Emoji_Presentation}|\uFE0F/u);
  const height = (await footer.boundingBox())!.height;
  expect(height).toBeLessThan(isMobile ? 100 : 70);
});
