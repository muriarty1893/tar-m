export type DailyForecast = {
  date: string;
  min: number;
  max: number;
  rainProb: number;
  rainMm: number;
  windMax: number;
  /** WMO weather code for the day, when the API sent one. */
  code?: number;
  /** Local "HH:MM". */
  sunrise?: string;
  sunset?: string;
};

export type Forecast = {
  current: { temp: number; wind: number; code: number; isDay: boolean };
  daily: DailyForecast[];
};

export type FarmingHint = { kind: "frost" | "rain" | "spray" | "normal"; text: string };

const API = "https://api.open-meteo.com/v1/forecast";
const CACHE_MS = 10 * 60_000;
const TIMEOUT_MS = 8_000;
const cache = new Map<string, { at: number; data: Forecast }>();

/**
 * Launch-default thresholds, to be reviewed by an agronomist.
 * First matching rule wins.
 */
export function farmingHint(day: DailyForecast): FarmingHint {
  if (day.min <= 0) return { kind: "frost", text: "Don riski var: hassas ürünleri koruyun." };
  if (day.rainMm >= 20 || day.rainProb >= 80) {
    return { kind: "rain", text: "Yoğun yağış bekleniyor: ilaçlama ve sulamayı erteleyin." };
  }
  if (day.windMax < 15 && day.rainProb < 20) return { kind: "spray", text: "İlaçlama için uygun bir gün." };
  return { kind: "normal", text: "Tarla işleri için genel koşullar normal." };
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
/** "2026-10-13T07:05" → "07:05" */
const clock = (v: unknown) => (typeof v === "string" && /T\d\d:\d\d/.test(v) ? v.slice(v.indexOf("T") + 1, v.indexOf("T") + 6) : undefined);

type ApiResponse = {
  current?: { temperature_2m?: unknown; wind_speed_10m?: unknown; weather_code?: unknown; is_day?: unknown };
  daily?: Record<string, unknown[] | undefined>;
};

function parse(body: ApiResponse): Forecast {
  const c = body.current ?? {};
  if (!isNum(c.temperature_2m) || !isNum(c.wind_speed_10m) || !isNum(c.weather_code)) {
    throw new Error("Hava durumu verisi eksik (anlık).");
  }
  const d = body.daily ?? {};
  const time = d.time ?? [];
  const daily: DailyForecast[] = [];
  time.forEach((date, i) => {
    const row = {
      min: d.temperature_2m_min?.[i],
      max: d.temperature_2m_max?.[i],
      rainProb: d.precipitation_probability_max?.[i],
      rainMm: d.precipitation_sum?.[i],
      windMax: d.wind_speed_10m_max?.[i],
    };
    // A day with any missing value is dropped rather than shown as NaN.
    if (typeof date !== "string" || !Object.values(row).every(isNum)) return;
    const day: DailyForecast = { date, ...(row as Omit<DailyForecast, "date">) };
    // Optional extras: a missing one only loses the icon or the sun times, never the day.
    const code = d.weather_code?.[i];
    if (isNum(code)) day.code = code;
    const sunrise = clock(d.sunrise?.[i]);
    const sunset = clock(d.sunset?.[i]);
    if (sunrise) day.sunrise = sunrise;
    if (sunset) day.sunset = sunset;
    daily.push(day);
  });
  if (!daily.length) throw new Error("Hava durumu verisi eksik (günlük).");
  return {
    current: { temp: c.temperature_2m, wind: c.wind_speed_10m, code: c.weather_code, isDay: c.is_day !== 0 },
    daily,
  };
}

/** Fetches a 7-day forecast from Open-Meteo; successful results are cached for 10 minutes. */
export async function fetchForecast(lat: number, lon: number, fetchImpl: typeof fetch = fetch): Promise<Forecast> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;

  const params = new URLSearchParams({
    latitude: lat.toFixed(2),
    longitude: lon.toFixed(2),
    current: "temperature_2m,wind_speed_10m,weather_code,is_day",
    daily:
      "temperature_2m_min,temperature_2m_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,weather_code,sunrise,sunset",
    forecast_days: "7",
    timezone: "auto",
  });
  // A stalled connection must end in the retry message, not an endless spinner.
  const res = await fetchImpl(`${API}?${params}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const data = parse((await res.json()) as ApiResponse);
  cache.set(key, { at: Date.now(), data });
  return data;
}

/** WMO weather interpretation codes → short Turkish description. */
export function describeWeather(code: number): string {
  if (code === 0) return "Açık";
  if (code === 1 || code === 2) return "Parçalı bulutlu";
  if (code === 3) return "Kapalı";
  if (code === 45 || code === 48) return "Sisli";
  if (code >= 51 && code <= 57) return "Çiseleyen yağmur";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "Yağmurlu";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "Karlı";
  if (code >= 95 && code <= 99) return "Gök gürültülü fırtına";
  return "Bilinmiyor";
}

export type WeatherKind = "sun" | "moon" | "partly" | "cloud" | "fog" | "rain" | "heavy-rain" | "snow" | "thunder" | "wind";

/** WMO code → which animated icon (and sky tint) to show. A dry sky with 30 km/h+ wind shows the wind. */
export function weatherKind(code: number, { isDay = true, wind = 0 }: { isDay?: boolean; wind?: number } = {}): WeatherKind {
  if (code <= 3 && wind >= 30) return "wind";
  if (code <= 1) return isDay ? "sun" : "moon";
  if (code === 2) return "partly";
  if (code === 45 || code === 48) return "fog";
  if (code === 65 || code === 67 || code === 82) return "heavy-rain";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95 && code <= 99) return "thunder";
  return "cloud";
}

/** A day's min–max span on the week's temperature scale, as left/width percentages. */
export function rangeBar(min: number, max: number, lo: number, hi: number): { left: number; width: number } {
  if (hi <= lo) return { left: 0, width: 100 };
  const pct = (t: number) => ((Math.min(Math.max(t, lo), hi) - lo) / (hi - lo)) * 100;
  const left = pct(min);
  // A flat day still shows as a short pill.
  return { left: Math.min(left, 94), width: Math.max(pct(max) - left, 6) };
}
