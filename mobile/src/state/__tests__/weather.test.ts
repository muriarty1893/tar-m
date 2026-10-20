import { provinceByName } from '@/domain/provinces';

import { createWeatherStore, savedForecast } from '../weather';

const body = (temp = 17.4) => ({
  current: { temperature_2m: temp, relative_humidity_2m: 61, wind_speed_10m: 9.2, weather_code: 3, is_day: 1 },
  daily: {
    time: ['2026-10-20'],
    temperature_2m_min: [6.1],
    temperature_2m_max: [19.8],
    precipitation_probability_max: [10],
    precipitation_sum: [0],
    wind_speed_10m_max: [12.3],
  },
});
const okFetch = (temp?: number) => jest.fn(async () => ({ ok: true, status: 200, json: async () => body(temp) }));
const T0 = new Date(2026, 9, 20, 10, 0);
const minutes = (n: number) => new Date(T0.getTime() + n * 60_000);

describe('weather store', () => {
  test('starts on Konya with nothing saved', () => {
    const s = createWeatherStore(okFetch() as unknown as typeof fetch).getState();
    expect(s.province.name).toBe('Konya');
    expect(savedForecast(s)).toBeNull();
    expect(s.status).toBe('idle');
  });

  test("refresh fetches the province's forecast and saves it with the time", async () => {
    const fetchImpl = okFetch();
    const store = createWeatherStore(fetchImpl as unknown as typeof fetch);
    await store.getState().refresh({ now: T0 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(((fetchImpl.mock.calls[0] as unknown[])[0] as string)).toContain('latitude=37.87');
    const saved = savedForecast(store.getState());
    expect(saved?.data.current.temp).toBe(17.4);
    expect(saved?.at).toBe(T0.toISOString());
    expect(store.getState().status).toBe('idle');
  });

  test('a forecast under 30 minutes old is reused; force or an older one fetches again', async () => {
    const fetchImpl = okFetch();
    const store = createWeatherStore(fetchImpl as unknown as typeof fetch);
    await store.getState().refresh({ now: T0 });
    await store.getState().refresh({ now: minutes(29) });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    await store.getState().refresh({ now: minutes(29), force: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    await store.getState().refresh({ now: minutes(61) });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  test('a failed refresh reports an error and keeps the last forecast', async () => {
    const store = createWeatherStore(okFetch(12) as unknown as typeof fetch);
    await store.getState().refresh({ now: T0 });
    store.setState({ fetchImpl: jest.fn(async () => Promise.reject(new Error('offline'))) as unknown as typeof fetch });
    await store.getState().refresh({ now: minutes(45) });
    expect(store.getState().status).toBe('error');
    expect(savedForecast(store.getState())?.data.current.temp).toBe(12);
  });

  test("another province shows nothing until its own forecast arrives", async () => {
    const fetchImpl = okFetch();
    const store = createWeatherStore(fetchImpl as unknown as typeof fetch);
    await store.getState().refresh({ now: T0 });
    store.getState().setProvince(provinceByName('İzmir')!);
    expect(savedForecast(store.getState())).toBeNull();
    await store.getState().refresh({ now: minutes(1) });
    expect(((fetchImpl.mock.calls[1] as unknown[])[0] as string)).toContain('latitude=38.42');
    expect(savedForecast(store.getState())?.province).toBe('İzmir');
  });
});

test('a late answer for a province the farmer has left is dropped', async () => {
  let answer: (v: unknown) => void = () => undefined;
  const slow = jest.fn(() => new Promise((resolve) => (answer = resolve)));
  const store = createWeatherStore(slow as unknown as typeof fetch);
  const pending = store.getState().refresh({ now: T0 });
  store.getState().setProvince(provinceByName('İzmir')!);
  answer({ ok: true, status: 200, json: async () => body() });
  await pending;
  expect(store.getState().saved).toBeNull();
});
