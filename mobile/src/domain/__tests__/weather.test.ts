import { bestSprayWindow, frostRisk, sampleForecast, sprayVerdict, type HourForecast } from '../weather';

const hour = (h: number, over: Partial<HourForecast> = {}): HourForecast => ({
  time: new Date(2026, 9, 16, h),
  tempC: 16,
  windKmh: 6,
  rainMm: 0,
  humidity: 50,
  ...over,
});

describe('sprayVerdict', () => {
  test('calm, dry, mild weather is suitable', () => {
    expect(sprayVerdict(hour(8))).toEqual({ ok: true, reason: 'Bugün ilaçlama için uygun' });
  });

  test('rain rules spraying out first', () => {
    expect(sprayVerdict(hour(8, { rainMm: 1.2, windKmh: 30 }))).toEqual({ ok: false, reason: 'Yağmur bekleniyor, ilaçlama yapma' });
  });

  test('strong wind rules it out (drift)', () => {
    expect(sprayVerdict(hour(8, { windKmh: 18 })).ok).toBe(false);
    expect(sprayVerdict(hour(8, { windKmh: 18 })).reason).toBe('Rüzgâr çok sert, ilaçlama yapma');
  });

  test('too hot or too cold rules it out', () => {
    expect(sprayVerdict(hour(14, { tempC: 31 })).reason).toBe('Hava çok sıcak, serin saati bekle');
    expect(sprayVerdict(hour(6, { tempC: 4 })).reason).toBe('Hava çok soğuk, ilaç etkisiz kalabilir');
  });
});

describe('bestSprayWindow', () => {
  test('finds the first run of 3 suitable daylight hours', () => {
    const hours = [
      hour(5, { windKmh: 20 }),
      hour(6),
      hour(7, { rainMm: 0.4 }),
      hour(8),
      hour(9),
      hour(10),
      hour(11),
    ];
    const w = bestSprayWindow(hours);
    expect(w?.start.getHours()).toBe(8);
    expect(w?.end.getHours()).toBe(11);
  });

  test('ignores night hours', () => {
    const hours = [hour(0), hour(1), hour(2), hour(3)];
    expect(bestSprayWindow(hours)).toBeNull();
  });

  test('returns null when nothing qualifies', () => {
    expect(bestSprayWindow([hour(8, { windKmh: 25 }), hour(9, { windKmh: 25 })])).toBeNull();
  });
});

describe('frostRisk', () => {
  test('any hour at or below zero is a frost risk', () => {
    expect(frostRisk([hour(3, { tempC: 2 }), hour(4, { tempC: 0 })])).toBe(true);
    expect(frostRisk([hour(3, { tempC: 2 })])).toBe(false);
  });
});

describe('sampleForecast', () => {
  test('gives 48 hourly entries starting at the current hour', () => {
    const now = new Date(2026, 9, 16, 15, 20);
    const f = sampleForecast(now);
    expect(f).toHaveLength(48);
    expect(f[0].time.getHours()).toBe(15);
    expect(f[0].time.getMinutes()).toBe(0);
  });

  test('in the afternoon the best window is tomorrow 06:00–09:00', () => {
    const now = new Date(2026, 9, 16, 15, 20);
    const w = bestSprayWindow(sampleForecast(now));
    expect(w?.start).toEqual(new Date(2026, 9, 17, 6));
    expect(w?.end).toEqual(new Date(2026, 9, 17, 9));
  });

  test('early in the morning today is still suitable', () => {
    const now = new Date(2026, 9, 16, 6, 5);
    expect(sprayVerdict(sampleForecast(now)[0]).ok).toBe(true);
  });
});
