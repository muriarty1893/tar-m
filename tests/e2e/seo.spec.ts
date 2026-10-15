import { test, expect } from "@playwright/test";

const SLUGS = ["bereket-ai-erken-erisim", "bugdayda-pas-hastaligi", "kis-oncesi-toprak-hazirligi"];

test("sitemap lists static routes and every article", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  for (const path of ["/haberler", "/hava", "/is-birligi", "/sss", "/hakkimizda", "/gizlilik", "/kaynaklar"]) {
    expect(xml).toContain(`${path}</loc>`);
  }
  for (const slug of SLUGS) expect(xml).toContain(`/haberler/${slug}</loc>`);
  expect(xml).toMatch(/<loc>http:\/\/localhost:3100\/?<\/loc>/);
});

test("robots.txt allows crawling and points at the sitemap", async ({ request }) => {
  const txt = await (await request.get("/robots.txt")).text();
  expect(txt).toMatch(/Allow: \//);
  expect(txt).toContain("Sitemap: http://localhost:3100/sitemap.xml");
});

test("home page has description and Open Graph tags with an absolute image", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Bereket AI/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Bereket AI/);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "tr_TR");
  const image = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(image).toMatch(/^http:\/\/localhost:3100\//);
  const img = await request.get(image!);
  expect(img.status()).toBe(200);
  expect(img.headers()["content-type"]).toBe("image/png");
});

test("article page has its own title and og:type article", async ({ page }) => {
  await page.goto(`/haberler/${SLUGS[1]}`);
  await expect(page).toHaveTitle(/^Buğdayda sarı pas/);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
});

// (The no-cover fallback to the site share image is unit-tested via shareImage in lib/news.)
test("article shares its cover image and the site name", async ({ page, request }) => {
  await page.goto(`/haberler/${SLUGS[1]}`);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Bereket AI");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `http://localhost:3100/haberler/${SLUGS[1]}`);
  const image = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(image).toBe("http://localhost:3100/demo/bugday-sari-pas.webp");
  expect((await request.get(image!)).headers()["content-type"]).toBe("image/webp");
});

test("the slogan names the page, and the logo badge shows in the header and the browser tab", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Bereket AI — Çiftçinin Akıllı Rehberi");
  const logo = page.locator("header").getByRole("link", { name: /Bereket AI/ }).locator("img");
  await expect(logo).toHaveAttribute("src", /brand%2Flogo|brand\/logo/);
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const icon = page.locator('link[rel="icon"]').first();
  await expect(icon).toHaveAttribute("href", /\/icon/);
  const res = await page.request.get((await icon.getAttribute("href"))!);
  expect(res.headers()["content-type"]).toMatch(/image\/png/);
});
