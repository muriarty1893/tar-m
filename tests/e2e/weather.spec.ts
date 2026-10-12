import { test, expect, type Page } from "@playwright/test";

const body = {
  current: { temperature_2m: 17.4, wind_speed_10m: 9.2, weather_code: 3 },
  daily: {
    time: ["2026-10-12", "2026-10-13", "2026-10-14"],
    temperature_2m_min: [-1, 4.2, 6],
    temperature_2m_max: [12, 18, 20],
    precipitation_probability_max: [10, 85, 5],
    precipitation_sum: [0, 22.5, 0],
    wind_speed_10m_max: [12.3, 25.1, 8],
  },
};

async function mockWeather(page: Page, status = 200) {
  const calls: string[] = [];
  await page.route("https://api.open-meteo.com/**", (route) => {
    calls.push(route.request().url());
    return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(status === 200 ? body : {}) });
  });
  return calls;
}

test("weather page shows mocked conditions and farming hints for Ankara", async ({ page }) => {
  const calls = await mockWeather(page);
  await page.goto("/hava");
  await expect(page.getByTestId("sicaklik")).toHaveText("17°C");
  await expect(page.getByRole("heading", { name: "Ankara" })).toBeVisible();
  await expect(page.getByText("Don riski var: hassas ürünleri koruyun.").first()).toBeVisible();
  await expect(page.getByText("Yoğun yağış bekleniyor", { exact: false })).toBeVisible();
  expect(calls[0]).toContain("latitude=39.93");
});

test("loading the forecast does not shift the page layout", async ({ page }) => {
  const sevenDays = {
    ...body,
    daily: Object.fromEntries(
      Object.entries(body.daily).map(([k, v]) => [k, k === "time" ? [...Array(7)].map((_, i) => `2026-10-1${i}`) : [...Array(7)].map(() => v[1])]),
    ),
  };
  await page.route("https://api.open-meteo.com/**", async (route) => {
    await new Promise((r) => setTimeout(r, 800));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(sevenDays) });
  });
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/hava");
  await expect(page.getByTestId("sicaklik")).toHaveText("17°C");
  await page.waitForTimeout(300);
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls).toBeLessThan(0.1);
});

test("province search picks a province and refetches", async ({ page }) => {
  const calls = await mockWeather(page);
  await page.goto("/hava");
  await expect(page.getByTestId("sicaklik")).toBeVisible();
  await page.getByLabel("İl ara").fill("sanliurfa");
  await page.getByRole("button", { name: "Şanlıurfa" }).click();
  await expect(page.getByRole("heading", { name: "Şanlıurfa" })).toBeVisible();
  await expect.poll(() => calls.some((u) => u.includes("latitude=37.17"))).toBe(true);
});

test("re-picking the current province does not get stuck loading", async ({ page }) => {
  await mockWeather(page);
  await page.goto("/hava");
  await expect(page.getByTestId("sicaklik")).toBeVisible();
  await page.getByLabel("İl ara").fill("ankara");
  await page.getByRole("button", { name: "Ankara" }).click();
  await expect(page.getByTestId("sicaklik")).toHaveText("17°C");
});

test("a stalled weather API ends in the retry message instead of loading forever", async ({ page }) => {
  await page.route("https://api.open-meteo.com/**", () => {
    /* never respond */
  });
  await page.goto("/hava");
  await expect(page.getByText("Hava durumu şu an alınamadı")).toBeVisible({ timeout: 12_000 });
  await expect(page.getByRole("button", { name: "Tekrar dene" })).toBeVisible();
});

test("weather failure shows a retry button that recovers", async ({ page }) => {
  let fail = true;
  await page.route("https://api.open-meteo.com/**", (route) =>
    fail
      ? route.fulfill({ status: 500, body: "{}" })
      : route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) }),
  );
  await page.goto("/hava");
  await expect(page.getByText("Hava durumu şu an alınamadı")).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Tekrar dene" }).click();
  await expect(page.getByTestId("sicaklik")).toHaveText("17°C");
});
