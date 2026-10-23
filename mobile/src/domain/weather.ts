import { WEEKDAYS, addDays, dayKey, fromDayKey } from './format';

/**
 * Live weather from Open-Meteo (open-meteo.com): free, no key, called straight from the phone.
 * Ported from the website's lib/weather.ts, with the current humidity added and the hints
 * shortened for the phone. Open-Meteo's data is CC BY 4.0, so the app credits it.
 */
export type DailyForecast = {
  /** Local date, "2026-10-20". */
  date: string;
  min: number;
  max: number;
  rainProb: number;
  rainMm: number;
  windMax: number;
  /** WMO weather code, when the API sent one. */
  code?: number;
  /** Local sunrise, "07:04", when the API sent one. */
  sunrise?: string;
};

export type Forecast = {
  current: { temp: number; humidity: number; wind: number; code: number; isDay: boolean };
  daily: DailyForecast[];
};

export type FarmingHint = { kind: 'frost' | 'rain' | 'spray' | 'normal'; text: string };

/**
 * The website's launch thresholds, to be reviewed by an agronomist. The first matching rule wins.
 */
const isFrost = (day: DailyForecast) => day.min <= 0;
const isHeavyRain = (day: DailyForecast) => day.rainMm >= 20 || day.rainProb >= 80;

export function farmingHint(day: DailyForecast): FarmingHint {
  if (isFrost(day)) return { kind: 'frost', text: 'Don riski: hassas ürünleri örtün' };
  if (isHeavyRain(day)) return { kind: 'rain', text: 'Yoğun yağış: ilaçlama ve sulamayı erteleyin' };
  if (day.windMax < 15 && day.rainProb < 20) return { kind: 'spray', text: 'İlaçlama için uygun' };
  return { kind: 'normal', text: 'Tarla işleri için koşullar normal' };
}

export type OutlookRow = { kind: 'spray' | 'frost' | 'rain'; title: string; days: string[]; text: string };

/**
 * "Bu Hafta Tarlada": which days of the forecast suit spraying, and which bring frost or heavy rain
 * (each on its own, so a frosty, rainy day is in both lists), by day name.
 */
export function weekOutlook(daily: DailyForecast[], today: Date): OutlookRow[] {
  const names = (pick: (d: DailyForecast) => boolean) => daily.filter(pick).map((d) => dayLabel(d.date, today));
  const row = (kind: OutlookRow['kind'], title: string, days: string[], none: string): OutlookRow => ({ kind, title, days, text: days.length ? days.join(', ') : none });
  return [
    row('spray', 'İlaçlamaya uygun', names((d) => farmingHint(d).kind === 'spray'), 'Bu hafta uygun gün yok'),
    row('frost', 'Don riski', names(isFrost), 'Bu hafta beklenmiyor'),
    row('rain', 'Yoğun yağış', names(isHeavyRain), 'Bu hafta beklenmiyor'),
  ];
}

const API = 'https://api.open-meteo.com/v1/forecast';
const TIMEOUT_MS = 10_000;

/** Built by hand: React Native's URLSearchParams is incomplete. */
export function forecastUrl(lat: number, lon: number) {
  const params: [string, string][] = [
    ['latitude', lat.toFixed(2)],
    ['longitude', lon.toFixed(2)],
    ['current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day'],
    ['daily', 'temperature_2m_min,temperature_2m_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,weather_code,sunrise'],
    ['forecast_days', '7'],
    ['timezone', 'auto'],
  ];
  return `${API}?${params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

type ApiResponse = {
  current?: Record<string, unknown>;
  daily?: Record<string, unknown[] | undefined>;
};

export function parseForecast(body: ApiResponse): Forecast {
  const c = body.current ?? {};
  const { temperature_2m: temp, relative_humidity_2m: humidity, wind_speed_10m: wind, weather_code: code } = c;
  if (!isNum(temp) || !isNum(humidity) || !isNum(wind) || !isNum(code)) throw new Error('Hava durumu verisi eksik (anlık).');
  const d = body.daily ?? {};
  const daily: DailyForecast[] = [];
  (d.time ?? []).forEach((date, i) => {
    const row = {
      min: d.temperature_2m_min?.[i],
      max: d.temperature_2m_max?.[i],
      rainProb: d.precipitation_probability_max?.[i],
      rainMm: d.precipitation_sum?.[i],
      windMax: d.wind_speed_10m_max?.[i],
    };
    // A day with any missing value is dropped rather than shown as NaN.
    if (typeof date !== 'string' || !Object.values(row).every(isNum)) return;
    const day: DailyForecast = { date, ...(row as Omit<DailyForecast, 'date'>) };
    const dayCode = d.weather_code?.[i];
    if (isNum(dayCode)) day.code = dayCode;
    // "2026-10-20T07:04", in the place's own time (timezone=auto).
    const sunrise = d.sunrise?.[i];
    const hhmm = typeof sunrise === 'string' ? /T(\d{2}:\d{2})/.exec(sunrise)?.[1] : undefined;
    if (hhmm) day.sunrise = hhmm;
    daily.push(day);
  });
  if (!daily.length) throw new Error('Hava durumu verisi eksik (günlük).');
  return { current: { temp, humidity, wind, code, isDay: c.is_day !== 0 }, daily };
}

/** A 7-day forecast for a place. A stalled connection gives up after 10 s, so the screen can offer a retry. */
export async function fetchForecast(lat: number, lon: number, fetchImpl: typeof fetch = fetch): Promise<Forecast> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(forecastUrl(lat, lon), { signal: abort.signal });
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    return parseForecast((await res.json()) as ApiResponse);
  } finally {
    clearTimeout(timer);
  }
}

/** WMO weather codes in a word or two. */
export function describeWeather(code: number): string {
  if (code === 0) return 'Açık';
  if (code === 1 || code === 2) return 'Parçalı bulutlu';
  if (code === 3) return 'Kapalı';
  if (code === 45 || code === 48) return 'Sisli';
  if (code >= 51 && code <= 57) return 'Çiseleyen yağmur';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'Yağmurlu';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'Karlı';
  if (code >= 95 && code <= 99) return 'Fırtınalı';
  return 'Bulutlu';
}

export type WeatherIcon = 'sun' | 'moon' | 'cloud-sun' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm';

export function weatherIcon(code: number, isDay = true): WeatherIcon {
  if (code <= 1) return isDay ? 'sun' : 'moon';
  if (code === 2) return 'cloud-sun';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95 && code <= 99) return 'storm';
  return 'cloud';
}

/** "17,4°", or "20°" with no decimals; never "-0°". */
export function tempLabel(t: number, decimals = 1) {
  const fixed = t.toFixed(decimals);
  const value = Number(fixed) === 0 ? (0).toFixed(decimals) : fixed;
  return `${value.replace('.', ',')}°`;
}

/** "Bugün", "Yarın", then the weekday. */
export function dayLabel(date: string, today: Date) {
  if (date === dayKey(today)) return 'Bugün';
  if (date === dayKey(addDays(today, 1))) return 'Yarın';
  return WEEKDAYS[fromDayKey(date).getDay()];
}
