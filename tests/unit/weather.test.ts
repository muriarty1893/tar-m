import { describe, it, expect, vi, afterEach } from "vitest";
import { farmingHint, fetchForecast, describeWeather, rangeBar, weatherKind, type DailyForecast } from "@/lib/weather";

const day = (over: Partial<DailyForecast> = {}): DailyForecast => ({
  date: "2026-10-12",
  min: 8,
  max: 20,
  rainProb: 50,
  rainMm: 2,
  windMax: 20,
  ...over,
});

const FROST = "Don riski var: hassas ürünleri koruyun.";
const RAIN = "Yoğun yağış bekleniyor: ilaçlama ve sulamayı erteleyin.";
const SPRAY = "İlaçlama için uygun bir gün.";
const NORMAL = "Tarla işleri için genel koşullar normal.";

describe("farmingHint", () => {
  it("frost at min 0, not at 0.1", () => {
    expect(farmingHint(day({ min: 0 }))).toEqual({ kind: "frost", text: FROST });
    expect(farmingHint(day({ min: 0.1 })).kind).not.toBe("frost");
  });

  it("rain at 20 mm, or at 80% but not 79%", () => {
    expect(farmingHint(day({ rainMm: 20 }))).toEqual({ kind: "rain", text: RAIN });
    expect(farmingHint(day({ rainProb: 80 })).kind).toBe("rain");
    expect(farmingHint(day({ rainProb: 79 })).kind).not.toBe("rain");
  });

  it("spray window needs wind under 15 and rain chance under 20", () => {
    expect(farmingHint(day({ windMax: 14.9, rainProb: 19 }))).toEqual({ kind: "spray", text: SPRAY });
    expect(farmingHint(day({ windMax: 15, rainProb: 19 })).kind).toBe("normal");
    expect(farmingHint(day({ windMax: 14.9, rainProb: 20 })).kind).toBe("normal");
  });

  it("falls back to normal", () => {
    expect(farmingHint(day())).toEqual({ kind: "normal", text: NORMAL });
  });

  it("frost wins over rain", () => {
    expect(farmingHint(day({ min: -2, rainMm: 30 })).kind).toBe("frost");
  });
});

const fixture = (overrides: Record<string, unknown[]> = {}) => ({
  current: { temperature_2m: 17.4, wind_speed_10m: 9.2, weather_code: 3 },
  daily: {
    time: ["2026-10-12", "2026-10-13"],
    temperature_2m_min: [6.1, 4.2],
    temperature_2m_max: [19.8, 18.0],
    precipitation_probability_max: [10, 85],
    precipitation_sum: [0, 22.5],
    wind_speed_10m_max: [12.3, 25.1],
    ...overrides,
  },
});

const fakeFetch = (body: unknown, status = 200) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

// Each test uses distinct coordinates so the in-module cache does not leak between tests.
describe("fetchForecast", () => {
  afterEach(() => vi.useRealTimers());

  it("parses the Open-Meteo response", async () => {
    const f = fakeFetch(fixture());
    const forecast = await fetchForecast(39.93, 32.86, f);
    expect(forecast.current).toEqual({ temp: 17.4, wind: 9.2, code: 3, isDay: true });
    expect(forecast.daily[1]).toEqual({
      date: "2026-10-13",
      min: 4.2,
      max: 18,
      rainProb: 85,
      rainMm: 22.5,
      windMax: 25.1,
    });
    const url = String((f as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0]);
    expect(url).toContain("api.open-meteo.com/v1/forecast");
    expect(url).toContain("forecast_days=7");
    expect(url).toContain("timezone=auto");
  });

  it("gives the request a timeout signal so a stalled API cannot hang the widget", async () => {
    const f = fakeFetch(fixture());
    await fetchForecast(38.1, 27.1, f);
    const init = (f as unknown as { mock: { calls: [string, RequestInit?][] } }).mock.calls[0][1];
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("throws on HTTP 500", async () => {
    await expect(fetchForecast(40.1, 30.1, fakeFetch({}, 500))).rejects.toThrow();
  });

  it("drops a day whose temperature is null", async () => {
    const forecast = await fetchForecast(40.2, 30.2, fakeFetch(fixture({ temperature_2m_min: [6.1, null] })));
    expect(forecast.daily.map((d) => d.date)).toEqual(["2026-10-12"]);
  });

  it("throws when no valid day remains", async () => {
    await expect(
      fetchForecast(40.3, 30.3, fakeFetch(fixture({ temperature_2m_min: [null, null] }))),
    ).rejects.toThrow();
  });

  it("throws when current conditions are missing", async () => {
    const body = { ...fixture(), current: { temperature_2m: null, wind_speed_10m: 1, weather_code: 0 } };
    await expect(fetchForecast(40.4, 30.4, fakeFetch(body))).rejects.toThrow();
  });

  it("serves repeat requests from a 10-minute cache", async () => {
    vi.useFakeTimers();
    const f = fakeFetch(fixture());
    await fetchForecast(41.0, 29.0, f);
    vi.advanceTimersByTime(9 * 60_000);
    await fetchForecast(41.0, 29.0, f);
    expect(f).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2 * 60_000);
    await fetchForecast(41.0, 29.0, f);
    expect(f).toHaveBeenCalledTimes(2);
  });

  it("does not cache failures", async () => {
    const bad = fakeFetch({}, 500);
    await expect(fetchForecast(41.5, 29.5, bad)).rejects.toThrow();
    const good = fakeFetch(fixture());
    await expect(fetchForecast(41.5, 29.5, good)).resolves.toBeDefined();
  });
});

describe("describeWeather", () => {
  it("maps WMO codes to Turkish text", () => {
    expect(describeWeather(0)).toBe("Açık");
    expect(describeWeather(3)).toBe("Kapalı");
    expect(describeWeather(63)).toBe("Yağmurlu");
    expect(describeWeather(95)).toBe("Gök gürültülü fırtına");
    expect(describeWeather(12345)).toBe("Bilinmiyor");
  });
});

describe("fetchForecast extras", () => {
  it("reads day/night, per-day weather codes and sunrise/sunset times", async () => {
    const body = {
      ...fixture({ weather_code: [61, 0], sunrise: ["2026-10-12T07:04", "2026-10-13T07:05"], sunset: ["2026-10-12T18:31", "2026-10-13T18:29"] }),
      current: { temperature_2m: 9, wind_speed_10m: 3, weather_code: 0, is_day: 0 },
    };
    const f = fakeFetch(body);
    const forecast = await fetchForecast(42.1, 33.1, f);
    expect(forecast.current.isDay).toBe(false);
    expect(forecast.daily[0]).toMatchObject({ code: 61, sunrise: "07:04", sunset: "18:31" });
    const url = decodeURIComponent(String((f as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0]));
    expect(url).toContain("is_day");
    expect(url).toContain("weather_code,sunrise,sunset");
  });

  it("keeps a day whose optional code or sun times are missing", async () => {
    const forecast = await fetchForecast(42.2, 33.2, fakeFetch(fixture({ weather_code: [null, 3] })));
    expect(forecast.daily).toHaveLength(2);
    expect(forecast.daily[0].code).toBeUndefined();
    expect(forecast.daily[0].sunrise).toBeUndefined();
    expect(forecast.daily[1].code).toBe(3);
  });
});

describe("weatherKind", () => {
  it("clear sky is the sun by day and the moon by night", () => {
    expect(weatherKind(0)).toBe("sun");
    expect(weatherKind(0, { isDay: false })).toBe("moon");
    expect(weatherKind(1, { isDay: false })).toBe("moon");
  });

  it("maps cloud, fog, rain, heavy rain, snow and thunder codes", () => {
    expect(weatherKind(2)).toBe("partly");
    expect(weatherKind(3)).toBe("cloud");
    expect(weatherKind(48)).toBe("fog");
    expect(weatherKind(53)).toBe("rain");
    expect(weatherKind(63)).toBe("rain");
    expect(weatherKind(81)).toBe("rain");
    expect(weatherKind(65)).toBe("heavy-rain");
    expect(weatherKind(82)).toBe("heavy-rain");
    expect(weatherKind(73)).toBe("snow");
    expect(weatherKind(86)).toBe("snow");
    expect(weatherKind(95)).toBe("thunder");
    expect(weatherKind(12345)).toBe("cloud");
  });

  it("a dry but windy sky (30 km/h or more) shows the wind", () => {
    expect(weatherKind(1, { wind: 30 })).toBe("wind");
    expect(weatherKind(2, { wind: 29.9 })).toBe("partly");
    expect(weatherKind(61, { wind: 45 })).toBe("rain");
  });
});

describe("rangeBar", () => {
  it("places a day's min-max span on the week's scale, in percent", () => {
    expect(rangeBar(5, 15, 0, 20)).toEqual({ left: 25, width: 50 });
    expect(rangeBar(0, 20, 0, 20)).toEqual({ left: 0, width: 100 });
  });

  it("keeps a sliver visible for a flat day and a full bar for a flat week", () => {
    expect(rangeBar(10, 10, 0, 20).width).toBeGreaterThan(0);
    expect(rangeBar(7, 7, 7, 7)).toEqual({ left: 0, width: 100 });
  });
});
