export type HourForecast = {
  time: Date;
  tempC: number;
  windKmh: number;
  rainMm: number;
  humidity: number;
};

export type Verdict = { ok: boolean; reason: string };

const MAX_WIND = 15;
const MIN_TEMP = 8;
const MAX_TEMP = 28;
const FIRST_SPRAY_HOUR = 6;
const LAST_SPRAY_HOUR = 20;

/** Can you spray in this hour? Rain first, then drift, then temperature. */
export function sprayVerdict(h: HourForecast): Verdict {
  if (h.rainMm > 0) return { ok: false, reason: 'Yağmur bekleniyor, ilaçlama yapma' };
  if (h.windKmh > MAX_WIND) return { ok: false, reason: 'Rüzgâr çok sert, ilaçlama yapma' };
  if (h.tempC > MAX_TEMP) return { ok: false, reason: 'Hava çok sıcak, serin saati bekle' };
  if (h.tempC < MIN_TEMP) return { ok: false, reason: 'Hava çok soğuk, ilaç etkisiz kalabilir' };
  return { ok: true, reason: 'Bugün ilaçlama için uygun' };
}

const daylight = (h: HourForecast) => {
  const hr = h.time.getHours();
  return hr >= FIRST_SPRAY_HOUR && hr < LAST_SPRAY_HOUR;
};

/** The first run of at least `minHours` consecutive suitable daylight hours. */
export function bestSprayWindow(hours: HourForecast[], minHours = 3): { start: Date; end: Date } | null {
  let run: HourForecast[] = [];
  for (const h of hours) {
    if (daylight(h) && sprayVerdict(h).ok) {
      run.push(h);
      if (run.length === minHours) {
        const end = new Date(run[run.length - 1].time);
        end.setHours(end.getHours() + 1);
        return { start: run[0].time, end };
      }
    } else {
      run = [];
    }
  }
  return null;
}

export const frostRisk = (hours: HourForecast[]) => hours.some((h) => h.tempC <= 0);

/**
 * Sample weather for Ereğli (Konya) in mid-October: calm, cool mornings, a gusty afternoon with
 * an evening shower today, and a calm, clear morning tomorrow. Deterministic, 48 hours from now.
 */
export function sampleForecast(now: Date): HourForecast[] {
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  return Array.from({ length: 48 }, (_, i) => {
    const time = new Date(start);
    time.setHours(start.getHours() + i);
    const hr = time.getHours();
    const day = Math.floor((time.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86_400_000);
    // A daily temperature curve: ~9 °C before dawn, ~21 °C mid-afternoon.
    const tempC = Math.round(15 - 6 * Math.cos(((hr - 4) / 24) * 2 * Math.PI));
    const today = day === 0;
    const windKmh = today && hr >= 10 && hr < 20 ? 18 + (hr % 3) : 6 + (hr % 3);
    const rainMm = today && hr >= 18 && hr < 21 ? 1.4 : 0;
    const humidity = rainMm > 0 ? 85 : 40 + Math.round(15 * Math.cos(((hr - 4) / 24) * 2 * Math.PI));
    return { time, tempC, windKmh, rainMm, humidity };
  });
}
