import { test, expect, type Page } from "@playwright/test";

async function fillWaitlist(page: Page) {
  await page.getByLabel("Ad soyad").fill("Şükrü Çağlar");
  await page.getByLabel("E-posta").fill("sukru@example.com");
  await page.getByLabel("İl").fill("Konya");
  await page.getByRole("checkbox").check();
}

test("validation library is not part of the initial page load", async ({ page }) => {
  const bodies: Promise<string>[] = [];
  page.on("response", (res) => {
    if (res.url().endsWith(".js")) bodies.push(res.text().catch(() => ""));
  });
  await page.goto("/", { waitUntil: "networkidle" });
  const scripts = await Promise.all(bodies);
  expect(scripts.length).toBeGreaterThan(0);
  expect(scripts.some((s) => s.includes("ZodError"))).toBe(false);
});

test("waitlist submits and shows the thank-you message", async ({ page }) => {
  let sent: Record<string, unknown> | null = null;
  await page.route("**/api/waitlist", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.goto("/#kayit");
  await fillWaitlist(page);
  await page.getByRole("button", { name: "Kaydol" }).click();
  await expect(page.getByText("Teşekkürler! Sizi bilgilendireceğiz.")).toBeVisible();
  expect(sent).toMatchObject({ name: "Şükrü Çağlar", email: "sukru@example.com", consent: true, website: "" });
});

test("waitlist upstream failure shows the error and keeps typed values", async ({ page }) => {
  await page.route("**/api/waitlist", (route) =>
    route.fulfill({ status: 502, contentType: "application/json", body: '{"ok":false,"error":"upstream"}' }),
  );
  await page.goto("/#kayit");
  await fillWaitlist(page);
  await page.getByRole("button", { name: "Kaydol" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Bir sorun" })).toContainText("Bir sorun oluştu, lütfen tekrar deneyin");
  await expect(page.getByRole("alert").filter({ hasText: "Bir sorun" })).toContainText("iletisim@bereketai.com");
  await expect(page.getByLabel("Ad soyad")).toHaveValue("Şükrü Çağlar");
  await expect(page.getByLabel("E-posta")).toHaveValue("sukru@example.com");
  await expect(page.getByRole("checkbox")).toBeChecked();
});

test("rate-limited submission explains to wait instead of a generic error", async ({ page }) => {
  await page.route("**/api/waitlist", (route) =>
    route.fulfill({ status: 429, contentType: "application/json", body: '{"ok":false,"error":"rate"}' }),
  );
  await page.goto("/#kayit");
  await fillWaitlist(page);
  await page.getByRole("button", { name: "Kaydol" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Çok fazla deneme" })).toContainText(
    "Çok fazla deneme yapıldı, lütfen birkaç dakika sonra tekrar deneyin.",
  );
  await expect(page.getByLabel("E-posta")).toHaveValue("sukru@example.com");
});

test("real API route with an unreachable Apps Script shows the error (no mocks)", async ({ page }) => {
  // playwright.config points APPS_SCRIPT_URL at a closed port.
  await page.goto("/#kayit");
  await fillWaitlist(page);
  await page.getByRole("button", { name: "Kaydol" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Bir sorun" })).toBeVisible();
  await expect(page.getByLabel("E-posta")).toHaveValue("sukru@example.com");
});

test("waitlist shows Turkish field errors without calling the API", async ({ page }) => {
  let called = false;
  await page.route("**/api/waitlist", (route) => {
    called = true;
    return route.fulfill({ status: 200, body: '{"ok":true}' });
  });
  await page.goto("/#kayit");
  await page.getByLabel("Ad soyad").fill("   ");
  await page.getByLabel("E-posta").fill("yanlis@");
  await page.getByRole("button", { name: "Kaydol" }).click();
  await expect(page.getByText("Ad soyad en az 2 karakter olmalı.")).toBeVisible();
  await expect(page.getByText("Geçerli bir e-posta adresi girin.")).toBeVisible();
  await expect(page.getByText("Devam etmek için KVKK onayı gerekli.")).toBeVisible();
  await expect(page.getByLabel("Ad soyad")).toHaveAttribute("aria-invalid", "true");
  expect(called).toBe(false);
});

test("consent label links to the privacy page", async ({ page }) => {
  await page.goto("/#kayit");
  await expect(page.getByRole("link", { name: "KVKK Aydınlatma Metni" })).toHaveAttribute("href", "/gizlilik");
});

test("partner form submits", async ({ page }) => {
  let sent: Record<string, unknown> | null = null;
  await page.route("**/api/partner", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.goto("/is-birligi");
  await page.getByLabel("Ad soyad").fill("Mehmet Demir");
  await page.getByLabel("Kurum adı").fill("Konya Tarım Kooperatifi");
  await page.getByLabel("E-posta").fill("mehmet@example.com");
  await page.getByLabel("Kurum türü").selectOption("kooperatif");
  await page.getByLabel("Mesajınız").fill("Pilot çalışma için görüşmek isteriz.");
  await page.getByRole("button", { name: "Mesajı gönder" }).click();
  await expect(page.getByText("Mesajınızı aldık")).toBeVisible();
  expect(sent).toMatchObject({ type: "kooperatif", organization: "Konya Tarım Kooperatifi" });
});
