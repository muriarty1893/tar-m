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

test("footer credits the maker with a LinkedIn link", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer).toContainText("vibecoded with");
  await expect(footer.getByRole("link", { name: "Murat Eker" })).toHaveAttribute("href", "https://www.linkedin.com/in/murat-eker");
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
