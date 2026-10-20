import { dayLabel, describeWeather, farmingHint, fetchForecast, forecastUrl, parseForecast, tempLabel, weatherIcon, type DailyForecast } from '../weather';

const day = (over: Partial<DailyForecast> = {}): DailyForecast => ({ date: '2026-10-20', min: 8, max: 20, rainProb: 50, rainMm: 2, windMax: 20, ...over });

describe('farmingHint (the website\'s thresholds)', () => {
  test('frost at a low of 0, not 0.1', () => {
    expect(farmingHint(day({ min: 0 })).kind).toBe('frost');
    expect(farmingHint(day({ min: 0.1 })).kind).not.toBe('frost');
  });

  test('rain at 20 mm, or at 80 % but not 79 %', () => {
    expect(farmingHint(day({ rainMm: 20 })).kind).toBe('rain');
    expect(farmingHint(day({ rainProb: 80 })).kind).toBe('rain');
    expect(farmingHint(day({ rainProb: 79 })).kind).not.toBe('rain');
  });

  test('a spraying window needs wind under 15 km/h and rain chance under 20 %', () => {
    expect(farmingHint(day({ windMax: 14.9, rainProb: 19 })).kind).toBe('spray');
    expect(farmingHint(day({ windMax: 15, rainProb: 19 })).kind).toBe('normal');
    expect(farmingHint(day({ windMax: 14.9, rainProb: 20 })).kind).toBe('normal');
  });

  test('frost wins over rain, and every hint has Turkish text', () => {
    expect(farmingHint(day({ min: -2, rainMm: 30 })).kind).toBe('frost');
    expect(farmingHint(day()).text).toBe('Tarla işleri için koşullar normal');
  });
});

const body = (over: Record<string, unknown> = {}) => ({
  current: { temperature_2m: 17.4, relative_humidity_2m: 61, wind_speed_10m: 9.2, weather_code: 3, is_day: 1 },
  daily: {
    time: ['2026-10-20', '2026-10-21'],
    temperature_2m_min: [6.1, 4.2],
    temperature_2m_max: [19.8, 18.0],
    precipitation_probability_max: [10, 85],
    precipitation_sum: [0, 22.5],
    wind_speed_10m_max: [12.3, 25.1],
    weather_code: [3, 63],
    ...over,
  },
});

describe('parseForecast', () => {
  test('reads the current conditions and each day', () => {
    const f = parseForecast(body());
    expect(f.current).toEqual({ temp: 17.4, humidity: 61, wind: 9.2, code: 3, isDay: true });
    expect(f.daily).toHaveLength(2);
    expect(f.daily[1]).toEqual({ date: '2026-10-21', min: 4.2, max: 18, rainProb: 85, rainMm: 22.5, windMax: 25.1, code: 63 });
  });

  test('a day with a missing value is dropped, not shown as NaN', () => {
    expect(parseForecast(body({ temperature_2m_max: [19.8, null] })).daily.map((d) => d.date)).toEqual(['2026-10-20']);
  });

  test('missing current conditions, or no usable day, is an error', () => {
    expect(() => parseForecast({ ...body(), current: {} })).toThrow();
    expect(() => parseForecast(body({ time: [] }))).toThrow();
  });
});

describe('fetchForecast', () => {
  const ok = (data: unknown) => jest.fn(async () => ({ ok: true, status: 200, json: async () => data }));

  test("asks Open-Meteo for the place's 7 days in local time", async () => {
    const fetchImpl = ok(body());
    const f = await fetchForecast(37.87, 32.48, fetchImpl as unknown as typeof fetch);
    expect(f.current.temp).toBe(17.4);
    const url = (fetchImpl.mock.calls[0] as unknown[])[0] as string;
    expect(url).toBe(forecastUrl(37.87, 32.48));
    expect(url).toMatch(/^https:\/\/api\.open-meteo\.com\/v1\/forecast\?/);
    expect(url).toContain('latitude=37.87');
    expect(url).toContain('longitude=32.48');
    expect(url).toContain('forecast_days=7');
    expect(url).toContain('timezone=auto');
  });

  test('an HTTP error is an error', async () => {
    const fetchImpl = jest.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }));
    await expect(fetchForecast(37.87, 32.48, fetchImpl as unknown as typeof fetch)).rejects.toThrow('500');
  });
});

describe('labels', () => {
  test('weather codes in Turkish, and an icon for each', () => {
    expect(describeWeather(0)).toBe('Açık');
    expect(describeWeather(63)).toBe('Yağmurlu');
    expect(weatherIcon(0, true)).toBe('sun');
    expect(weatherIcon(0, false)).toBe('moon');
    expect(weatherIcon(2, true)).toBe('cloud-sun');
    expect(weatherIcon(45, true)).toBe('fog');
    expect(weatherIcon(63, true)).toBe('rain');
    expect(weatherIcon(73, true)).toBe('snow');
    expect(weatherIcon(95, true)).toBe('storm');
  });

  test('temperatures with a decimal comma, or rounded', () => {
    expect(tempLabel(17.44)).toBe('17,4°');
    expect(tempLabel(18, 1)).toBe('18,0°');
    expect(tempLabel(19.8, 0)).toBe('20°');
    expect(tempLabel(-0.3, 0)).toBe('0°');
  });

  test('day names from the forecast date', () => {
    const today = new Date(2026, 9, 20, 15);
    expect(dayLabel('2026-10-20', today)).toBe('Bugün');
    expect(dayLabel('2026-10-21', today)).toBe('Yarın');
    expect(dayLabel('2026-10-22', today)).toBe('Perşembe');
  });
});
