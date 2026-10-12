import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/haberler", "/hava", "/is-birligi", "/sss", "/hakkimizda", "/gizlilik"];

test("headings never skip a level", async ({ page }) => {
  await page.route("https://api.open-meteo.com/**", (r) => r.fulfill({ status: 500, body: "{}" }));
  for (const route of ROUTES) {
    await page.goto(route);
    const { violations } = await new AxeBuilder({ page }).withRules(["heading-order"]).analyze();
    expect(violations.map((v) => v.nodes.map((n) => n.html)).flat(), route).toEqual([]);
  }
});

for (const scheme of ["light", "dark"] as const) {
  test(`no axe violations (${scheme} mode)`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.route("https://api.open-meteo.com/**", (r) => r.fulfill({ status: 500, body: "{}" }));
    for (const route of ROUTES) {
      await page.goto(route);
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
      expect(summary, `${route} (${scheme})`).toEqual([]);
    }
  });
}
