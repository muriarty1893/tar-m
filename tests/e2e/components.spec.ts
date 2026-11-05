import { test, expect } from "@playwright/test";

test.describe("PillNav (desktop navigation)", () => {
  test.skip(({ isMobile }) => isMobile, "the pill nav is the desktop bar; phones use the tab bar");

  test("marks the current page and rolls the label on hover, without a colour fill", async ({ page }) => {
    await page.goto("/haberler");
    const nav = page.getByRole("navigation", { name: "Ana menü" });
    await expect(nav.getByRole("link", { name: "Haberler", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(nav.locator(".pill-nav__circle")).toHaveCount(0);
    const pill = nav.getByRole("link", { name: "Pazar", exact: true });
    const label = pill.locator(".pill-nav__label").first();
    const look = () => Promise.all([label.evaluate((el) => getComputedStyle(el).transform), pill.evaluate((el) => getComputedStyle(el).backgroundColor)]);
    const [restLabel, restBg] = await look();
    await pill.hover();
    await page.waitForTimeout(350);
    const [hoverLabel, hoverBg] = await look();
    expect(hoverLabel).not.toBe(restLabel);
    expect(hoverBg).toBe(restBg);
  });
});

test("MaskedHeading: the about page title shows the field through its letters", async ({ page }) => {
  await page.goto("/hakkimizda");
  const h1 = page.getByRole("heading", { level: 1, name: "Hakkımızda" });
  await expect(h1).toBeVisible();
  await expect(h1).toHaveAttribute("data-ready", "");
  await expect(h1.locator("clipPath text")).toHaveText("Hakkımızda");
  await expect(h1.locator("img")).toHaveAttribute("src", /hero-field/);
});

test.describe("MaskedHeading without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the title is still readable as plain text", async ({ page }) => {
    await page.goto("/hakkimizda");
    const word = page.getByRole("heading", { level: 1, name: "Hakkımızda" }).locator(".masked-heading__measure");
    const color = await word.evaluate((el) => getComputedStyle(el).color);
    expect(color).not.toBe("rgba(0, 0, 0, 0)");
  });
});

test("every sign-up button carries the diagonal arrow, which turns to point ahead on hover", async ({ page, isMobile }) => {
  test.skip(isMobile, "the buttons are on the wide-screen home; hover is a pointer interaction");
  await page.goto("/");
  const signups = page.locator('a[href="/kayit"]').filter({ visible: true });
  const n = await signups.count();
  expect(n).toBeGreaterThanOrEqual(2);
  for (let i = 0; i < n; i++) await expect(signups.nth(i).locator(".btn-arrow svg"), `sign-up button ${i}`).toHaveCount(1);
  await expect(page.locator("main section").filter({ visible: true }).first().getByRole("link", { name: "Pazar’a göz atın" }).locator(".btn-arrow")).toHaveCount(1);

  const cta = page.locator("[data-cine='card']").getByRole("link", { name: "Ücretsiz hesap açın" });
  const arrow = cta.locator(".btn-arrow");
  await expect(arrow).toHaveCSS("rotate", "none");
  await cta.hover();
  await expect(arrow).toHaveCSS("rotate", "45deg");
});
