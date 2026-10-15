import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// A first-time visitor: nothing remembered yet.
test.use({ storageState: { cookies: [], origins: [] } });

test("first visit: the welcome question must be answered before the site can be used", async ({ page }) => {
  // Motion off: on the home page the welcome otherwise waits for the hero's intro (tested below).
  await page.emulateMedia({ reducedMotion: "reduce" });
  const sent: unknown[] = [];
  await page.route("**/api/source", async (r) => {
    sent.push(r.request().postDataJSON());
    await r.fulfill({ json: { ok: true } });
  });
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: /hoş geldiniz/i });
  await expect(dialog).toBeVisible();
  const question = dialog.getByRole("radiogroup", { name: /Bizi nereden duydunuz/ });
  await expect(question).toBeVisible();

  // "Bitti" is greyed out and can't be pressed until an answer is chosen.
  const done = dialog.getByRole("button", { name: "Bitti" });
  await expect(done).toBeDisabled();
  await done.click({ force: true });
  await page.keyboard.press("Escape");
  await page.mouse.click(5, 5);
  await expect(dialog).toBeVisible();
  expect(sent).toHaveLength(0);

  await question.getByRole("radio", { name: "Sosyal medya" }).check();
  await expect(done).toBeEnabled();
  await done.click();
  await expect(dialog).toBeHidden();
  expect(sent).toEqual([expect.objectContaining({ source: "sosyal-medya" })]);

  // Only once: not again after a reload or on another page.
  await page.reload();
  await page.goto("/hakkimizda");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the welcome question works by keyboard alone", async ({ page }) => {
  await page.route("**/api/source", (r) => r.fulfill({ json: { ok: true } }));
  await page.goto("/sss");
  const dialog = page.getByRole("dialog", { name: /hoş geldiniz/i });
  await expect(dialog).toBeVisible();
  // Focus starts inside the dialog; arrows move through the choices, Tab reaches "Bitti".
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await expect(dialog.getByRole("radio").first()).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Bitti" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
});

test("the welcome dialog has no axe violations, before and after an answer is picked", async ({ page }) => {
  // No fade-in or colour transitions, so axe never measures a half-faded frame.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/hava");
  const dialog = page.getByRole("dialog", { name: /hoş geldiniz/i });
  await expect(dialog).toBeVisible();
  const scan = async () => (await new AxeBuilder({ page }).include("[role=dialog]").withTags(["wcag2a", "wcag2aa"]).analyze()).violations.map((v) => v.id);
  expect(await scan()).toEqual([]);
  await dialog.getByRole("radio", { name: "Diğer" }).check();
  expect(await scan()).toEqual([]);
});

test("picking 'Diğer' asks where, and 'Bitti' waits for an answer there too", async ({ page }) => {
  const sent: unknown[] = [];
  await page.route("**/api/source", async (r) => {
    sent.push(r.request().postDataJSON());
    await r.fulfill({ json: { ok: true } });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/sss");
  const dialog = page.getByRole("dialog", { name: /hoş geldiniz/i });
  const done = dialog.getByRole("button", { name: "Bitti" });
  const where = dialog.getByRole("textbox", { name: /Nereden duydunuz/ });
  await expect(where).toHaveCount(0);

  await dialog.getByRole("radio", { name: "Diğer" }).check();
  await expect(where).toBeVisible();
  await expect(where).toBeFocused();
  await expect(where).toHaveAttribute("aria-required", "true");
  await expect(done).toBeDisabled();
  await where.fill("a");
  await expect(done).toBeDisabled();

  // Another answer needs no text; back to "Diğer" keeps what was typed.
  await dialog.getByRole("radio", { name: "Sosyal medya" }).check();
  await expect(where).toHaveCount(0);
  await expect(done).toBeEnabled();
  await dialog.getByRole("radio", { name: "Diğer" }).check();
  await expect(where).toHaveValue("a");
  await expect(done).toBeDisabled();

  await where.fill("Tarım fuarı");
  await expect(done).toBeEnabled();
  await where.press("Enter");
  await expect(dialog).toBeHidden();
  expect(sent).toEqual([expect.objectContaining({ source: "diger", other: "Tarım fuarı" })]);
});

test("on the home page the welcome waits until the hero's opening animation has finished", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: /hoş geldiniz/i });
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  expect(await page.evaluate(() => document.documentElement.dataset.cineDone)).toBe("1");
});
