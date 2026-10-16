import { useMemo } from 'react';

import type { SolarName } from '@/components/icons/solar';
import { bestSprayWindow, frostRisk, sampleForecast, sprayVerdict, type HourForecast } from '@/domain/weather';

import { useNow } from './use-now';

function condition(h: HourForecast): { label: string; icon: SolarName } {
  if (h.rainMm > 0) return { label: 'Yağmurlu', icon: 'cloud-rain-linear' };
  if (h.windKmh > 15) return { label: 'Rüzgârlı', icon: 'wind-linear' };
  const hr = h.time.getHours();
  if (hr < 7 || hr >= 19) return { label: 'Açık', icon: 'cloud-sun-linear' };
  return { label: 'Güneşli', icon: 'sun-2-linear' };
}

/** Sample weather for the farm: current conditions, today's spraying verdict and the best window. */
export function useWeather() {
  const now = useNow();
  return useMemo(() => {
    const hours = sampleForecast(now);
    const current = hours[0];
    const rainLater = hours.slice(0, 12).find((h) => h.rainMm > 0);
    return {
      now,
      hours,
      current,
      condition: condition(current),
      verdict: sprayVerdict(current),
      window: bestSprayWindow(hours),
      frost: frostRisk(hours.slice(0, 24)),
      rainLater,
    };
  }, [now]);
}
