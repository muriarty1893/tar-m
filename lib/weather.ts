export type DailyForecast = {
  date: string;
  min: number;
  max: number;
  rainProb: number;
  rainMm: number;
  windMax: number;
};

export type Forecast = {
  current: { temp: number; wind: number; code: number };
  daily: DailyForecast[];
};

export type FarmingHint = { kind: "frost" | "rain" | "spray" | "normal"; text: string };

const API = "https://api.open-meteo.com/v1/forecast";
const CACHE_MS = 10 * 60_000;
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

type ApiResponse = {
  current?: { temperature_2m?: unknown; wind_speed_10m?: unknown; weather_code?: unknown };
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
    if (typeof date === "string" && Object.values(row).every(isNum)) {
      daily.push({ date, ...(row as Omit<DailyForecast, "date">) });
    }
  });
  if (!daily.length) throw new Error("Hava durumu verisi eksik (günlük).");
  return {
    current: { temp: c.temperature_2m, wind: c.wind_speed_10m, code: c.weather_code },
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
    current: "temperature_2m,wind_speed_10m,weather_code",
    daily:
      "temperature_2m_min,temperature_2m_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max",
    forecast_days: "7",
    timezone: "auto",
  });
  const res = await fetchImpl(`${API}?${params}`);
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
