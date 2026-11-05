import { test, expect } from "@playwright/test";

// The "Sade" design (app/globals.css): white only, Onest, one green.

test("the site is white, also on a device set to dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  for (const route of ["/", "/hakkimizda"]) {
    await page.goto(route);
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), route).toBe("rgb(255, 255, 255)");
  }
});

test("headings and text are set in Onest", async ({ page }) => {
  await page.goto("/");
  const [heading, body] = await page.evaluate(() => [getComputedStyle(document.querySelector("h1")!).fontFamily, getComputedStyle(document.body).fontFamily]);
  expect(heading).toMatch(/^Onest/);
  expect(body).toMatch(/^Onest/);
});

test("the design-choice tools are gone", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("group", { name: "Tasarım seçimi" })).toHaveCount(0);
  const res = await page.goto("/tasarim");
  expect(res?.status()).toBe(404);
});
