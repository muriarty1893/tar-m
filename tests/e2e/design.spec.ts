import { test, expect } from "@playwright/test";

// The "Borsa" design (app/globals.css): a light grey page of white boxes, Fira Sans with Fira Code
// for figures, blue links and tabs, red "create" buttons.

test("a light grey page of white boxes, also on a device set to dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  for (const route of ["/", "/hakkimizda"]) {
    await page.goto(route);
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), route).toBe("rgb(241, 243, 245)");
  }
  await page.goto("/");
  expect(await page.locator("#forum").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(255, 255, 255)");
});

test("text is set in Fira Sans, figures in Fira Code", async ({ page }) => {
  await page.goto("/");
  const [body, heading] = await page.evaluate(() => [getComputedStyle(document.body).fontFamily, getComputedStyle(document.querySelector("h2")!).fontFamily]);
  expect(body).toMatch(/^"?Fira Sans/);
  expect(heading).toMatch(/^"?Fira Sans/);
  expect(await page.locator(".font-borsa-mono").first().evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Fira Code/);
});

test("blue for the selected tab, red for Konu aç", async ({ page }) => {
  await page.goto("/forum");
  await expect(page.locator("main").getByRole("link", { name: "Konu aç" }).first()).toHaveCSS("background-color", "rgb(220, 38, 38)");
  await expect(page.getByRole("group", { name: "Sıralama" }).getByRole("button", { pressed: true })).toHaveCSS("color", "rgb(29, 78, 216)");
});

test("the design-choice tools are gone", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("group", { name: "Tasarım seçimi" })).toHaveCount(0);
  const res = await page.goto("/tasarim");
  expect(res?.status()).toBe(404);
});
