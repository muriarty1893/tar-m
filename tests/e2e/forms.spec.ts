import { test, expect, type Page } from "@playwright/test";

// The question form ("Cevabını bulamadınız mı?") at the bottom of /sss: on every screen size. The
// shared form handling (errors, rate limits, upstream failures) is tested through it.
const soru = (page: Page) => page.locator("#soru form");

async function fillQuestion(page: Page) {
  await soru(page).getByLabel("Adınız").fill("Şükrü Çağlar");
  await soru(page).getByLabel("E-posta", { exact: true }).fill("sukru@example.com");
  await soru(page).getByLabel("Sorunuz").fill("Buğday ekimi için en uygun ay hangisi?");
  await soru(page).getByRole("checkbox").check();
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

test("the question form submits and thanks the visitor", async ({ page }) => {
  let sent: Record<string, unknown> | null = null;
  await page.route("**/api/question", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.goto("/sss#soru");
  await fillQuestion(page);
  await soru(page).getByRole("button", { name: "Soruyu gönder" }).click();
  await expect(page.getByText("Teşekkürler! Sorunuzu aldık.")).toBeVisible();
  expect(sent).toMatchObject({ name: "Şükrü Çağlar", email: "sukru@example.com", question: "Buğday ekimi için en uygun ay hangisi?", consent: true, website: "" });
});

test("an upstream failure shows the error and keeps the typed values", async ({ page }) => {
  await page.route("**/api/question", (route) =>
    route.fulfill({ status: 502, contentType: "application/json", body: '{"ok":false,"error":"upstream"}' }),
  );
  await page.goto("/sss#soru");
  await fillQuestion(page);
  await soru(page).getByRole("button", { name: "Soruyu gönder" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Bir sorun" })).toContainText("Bir sorun oluştu, lütfen tekrar deneyin");
  await expect(page.getByRole("alert").filter({ hasText: "Bir sorun" })).toContainText("iletisim@bereketai.com");
  await expect(soru(page).getByLabel("Adınız")).toHaveValue("Şükrü Çağlar");
  await expect(soru(page).getByLabel("E-posta", { exact: true })).toHaveValue("sukru@example.com");
  await expect(soru(page).getByRole("checkbox")).toBeChecked();
});

test("rate-limited submission explains to wait instead of a generic error", async ({ page }) => {
  await page.route("**/api/question", (route) =>
    route.fulfill({ status: 429, contentType: "application/json", body: '{"ok":false,"error":"rate"}' }),
  );
  await page.goto("/sss#soru");
  await fillQuestion(page);
  await soru(page).getByRole("button", { name: "Soruyu gönder" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Çok fazla deneme" })).toContainText(
    "Çok fazla deneme yapıldı, lütfen birkaç dakika sonra tekrar deneyin.",
  );
  await expect(soru(page).getByLabel("E-posta", { exact: true })).toHaveValue("sukru@example.com");
});

test("real API route with an unreachable Apps Script shows the error (no mocks)", async ({ page }) => {
  // playwright.config points APPS_SCRIPT_URL at a closed port.
  await page.goto("/sss#soru");
  await fillQuestion(page);
  await soru(page).getByRole("button", { name: "Soruyu gönder" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Bir sorun" })).toBeVisible();
  await expect(soru(page).getByLabel("E-posta", { exact: true })).toHaveValue("sukru@example.com");
});

test("the question form shows Turkish field errors without calling the API", async ({ page }) => {
  let called = false;
  await page.route("**/api/question", (route) => {
    called = true;
    return route.fulfill({ status: 200, body: '{"ok":true}' });
  });
  await page.goto("/sss#soru");
  await soru(page).getByLabel("E-posta", { exact: true }).fill("yanlis@");
  await soru(page).getByLabel("Sorunuz").fill("Neden?");
  await soru(page).getByRole("button", { name: "Soruyu gönder" }).click();
  await expect(soru(page).getByText("Geçerli bir e-posta adresi girin.")).toBeVisible();
  await expect(soru(page).getByText("Sorunuz en az 10 karakter olmalı.")).toBeVisible();
  await expect(soru(page).getByText("Devam etmek için KVKK onayı gerekli.")).toBeVisible();
  await expect(soru(page).getByLabel("Sorunuz")).toHaveAttribute("aria-invalid", "true");
  expect(called).toBe(false);
});

test("consent label links to the privacy page", async ({ page }) => {
  await page.goto("/sss#soru");
  await expect(soru(page).getByRole("link", { name: "KVKK Aydınlatma Metni" })).toHaveAttribute("href", "/gizlilik");
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

test("on wide screens, the home page's question form sends a question too", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones get the portal home; the form is on /sss");
  let sent: Record<string, unknown> | null = null;
  await page.route("**/api/question", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.goto("/#sorular");
  const form = page.locator("#sorular form");
  await form.getByLabel("E-posta", { exact: true }).fill("hasan@example.com");
  await form.getByLabel("Sorunuz").fill("Forumda fotoğraf nasıl eklenir?");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Soruyu gönder" }).click();
  await expect(page.getByText("Teşekkürler! Sorunuzu aldık.")).toBeVisible();
  expect(sent).toMatchObject({ email: "hasan@example.com", question: "Forumda fotoğraf nasıl eklenir?", consent: true });
});
