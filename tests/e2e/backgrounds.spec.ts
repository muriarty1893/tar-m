import { test, expect } from "@playwright/test";

const SHAPES = ".blob-bg, [class*='dot-texture'], [class*='bg-blob']";

for (const path of ["/", "/hava", "/haberler", "/is-birligi", "/sss", "/hakkimizda", "/gizlilik", "/haberler/bugdayda-pas-hastaligi"]) {
  test(`${path}: no decorative shapes behind sections`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(SHAPES)).toHaveCount(0);
  });
}

test("subpage header band: a compact white band with the title, no photo", async ({ page }) => {
  await page.goto("/sss");
  const band = page.getByTestId("page-hero");
  await expect(band.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(band.locator("img")).toHaveCount(0);
  await expect(band).toHaveCSS("background-color", "rgb(255, 255, 255)");
  expect((await band.boundingBox())!.height).toBeLessThan(200);
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
