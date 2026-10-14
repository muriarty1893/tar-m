import { test, expect, type Page } from "@playwright/test";

// The four white design candidates (lib/tasarim.ts), switchable on every page while the owner chooses.
const VARIANTS = ["a", "b", "c", "d"] as const;

const bodyBg = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const headingFont = (page: Page) => page.evaluate(() => getComputedStyle(document.querySelector("h1")!).fontFamily);

test("every design is white, also on a device set to dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  for (const v of VARIANTS) {
    await page.goto(`/?tasarim=${v}`);
    await expect(page.locator("html")).toHaveAttribute("data-tasarim", v);
    expect(await bodyBg(page), v).toBe("rgb(255, 255, 255)");
  }
});

test("the four designs really differ: typeface and button shape change", async ({ page }) => {
  const seen = new Map<string, string>();
  for (const v of VARIANTS) {
    await page.goto(`/hakkimizda?tasarim=${v}`);
    // The header's sign-up button (hidden on phones, where the menu holds it; its style still applies).
    const radius = await page.locator('header a[href="/#kayit"]').first().evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
    seen.set(v, `${await headingFont(page)}|${radius}`);
  }
  expect(new Set(seen.values()).size).toBe(4);
});

test("the switcher changes the design on the spot and remembers it", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-tasarim", "a");
  const switcher = page.getByRole("group", { name: "Tasarım seçimi" });
  await switcher.getByRole("button", { name: /Almanak/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-tasarim", "b");
  await expect(switcher.getByRole("button", { name: /Almanak/ })).toHaveAttribute("aria-pressed", "true");
  await page.goto(isMobile ? "/sss" : "/hava");
  await expect(page.locator("html")).toHaveAttribute("data-tasarim", "b");
});

test("the demo phone's app looks the same in every design", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const looks: string[] = [];
  for (const v of VARIANTS) {
    await page.goto(`/?tasarim=${v}#demo`);
    const app = page.getByTestId("uygulama-ekrani");
    await expect(app.getByText("Hızlı İşlemler")).toBeVisible({ timeout: 20_000 });
    looks.push(
      await app.evaluate((el) => {
        const cs = (e: Element) => getComputedStyle(e);
        const scan = [...el.querySelectorAll("button")].find((b) => /Hastalık Tara/.test(b.textContent ?? ""))!;
        return [cs(el).fontFamily, cs(el).color, cs(scan).backgroundColor, cs(scan).borderTopLeftRadius].join("|");
      }),
    );
  }
  expect(new Set(looks).size, looks.join("\n")).toBe(1);
});

test("the comparison page shows the four designs side by side", async ({ page }) => {
  await page.goto("/tasarim");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("tasarım");
  const frames = page.locator("iframe");
  await expect(frames).toHaveCount(4);
  for (const [i, v] of VARIANTS.entries()) {
    await expect(frames.nth(i)).toHaveAttribute("src", `/?tasarim=${v}`);
    await expect(page.getByRole("link", { name: new RegExp(`${v.toUpperCase()} sürümüyle gez`, "i") })).toHaveAttribute("href", `/?tasarim=${v}`);
  }
  // A preview page: kept out of search engines.
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
