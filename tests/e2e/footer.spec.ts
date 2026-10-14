import { test, expect } from "@playwright/test";

test("the footer has a swaying wheat field that can be paused", async ({ page }) => {
  await page.goto("/hakkimizda");
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  const field = footer.getByTestId("wheat-field");
  await expect(field).toHaveAttribute("aria-hidden", "true");
  expect(await field.locator(".wheat-clump").count()).toBeGreaterThan(20);
  await expect(field).toHaveAttribute("data-run", "true");
  const sway = await field.locator(".wheat-clump").first().evaluate((el) => getComputedStyle(el).animationName);
  expect(sway).toBe("wheat-sway");

  await footer.getByRole("button", { name: "Buğday animasyonunu durdur" }).click();
  await expect(field).toHaveAttribute("data-run", "false");
  await expect(footer.getByRole("button", { name: "Buğday animasyonunu başlat" })).toBeVisible();
});

test("reduced motion: the wheat stands still and there is nothing to pause", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/hakkimizda");
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  const name = await footer.locator(".wheat-clump").first().evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe("none");
  await expect(footer.getByRole("button", { name: /Buğday animasyonunu/ })).toHaveCount(0);
});

test("footer links and contact stay readable above the field", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.getByRole("navigation", { name: "Alt menü" }).getByRole("link", { name: "Hakkımızda" })).toBeVisible();
  await expect(footer.getByRole("link", { name: "iletisim@bereketai.com" })).toBeVisible();
  await expect(footer.getByText("Tüm hakları saklıdır.")).toBeVisible();
});
