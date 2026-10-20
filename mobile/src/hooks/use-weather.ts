import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { savedForecast, useWeatherStore } from '@/state/weather';

/**
 * The live weather for the chosen province: the saved forecast (shown at once, even offline) and
 * whether a newer one is loading or failed. Refreshes on open, when the province changes and
 * when the app comes back to the foreground; a forecast under 30 minutes old is kept.
 */
export function useWeather() {
  const province = useWeatherStore((s) => s.province);
  const forecast = useWeatherStore(savedForecast);
  const status = useWeatherStore((s) => s.status);
  const refresh = useWeatherStore((s) => s.refresh);
  // Wait for the saved province, so the first fetch isn't for the default one.
  const [ready, setReady] = useState(() => useWeatherStore.persist.hasHydrated());

  useEffect(() => useWeatherStore.persist.onFinishHydration(() => setReady(true)), []);
  useEffect(() => {
    if (ready) void refresh();
  }, [ready, province.name, refresh]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && void refresh());
    return () => sub.remove();
  }, [refresh]);

  return { province, forecast, status, retry: () => refresh({ force: true }) };
}
