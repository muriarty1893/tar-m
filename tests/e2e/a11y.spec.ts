import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/haberler", "/hava", "/is-birligi", "/sss", "/hakkimizda", "/gizlilik", "/kaynaklar"];

test("headings never skip a level", async ({ page }) => {
  await page.route("https://api.open-meteo.com/**", (r) => r.fulfill({ status: 500, body: "{}" }));
  for (const route of ROUTES) {
    await page.goto(route);
    const { violations } = await new AxeBuilder({ page }).withRules(["heading-order"]).analyze();
    expect(violations.map((v) => v.nodes.map((n) => n.html)).flat(), route).toEqual([]);
  }
});

// The site is white only (no dark mode); each of the four design candidates must pass on its own.
for (const v of ["a", "b", "c", "d"] as const) {
  test(`no axe violations (design ${v.toUpperCase()})`, async ({ page }) => {
    await page.addInitScript((id) => localStorage.setItem("tasarim", id), v);
    await page.route("https://api.open-meteo.com/**", (r) => r.fulfill({ status: 500, body: "{}" }));
    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-tasarim", v);
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
      expect(summary, `${route} (design ${v})`).toEqual([]);
    }
  });
}
