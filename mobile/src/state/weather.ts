import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore, type StateCreator } from 'zustand/vanilla';

import { provinceByName, type Province } from '@/domain/provinces';
import { fetchForecast, type Forecast } from '@/domain/weather';

/** A forecast younger than this is shown without asking Open-Meteo again. */
const FRESH_MS = 30 * 60_000;

export type SavedForecast = { province: string; at: string; data: Forecast };

type WeatherState = {
  /** Where the weather is for: the farmer's province, Konya at first. */
  province: Province;
  /** The last forecast that arrived, kept for offline use. */
  saved: SavedForecast | null;
  status: 'idle' | 'loading' | 'error';
  fetchImpl: typeof fetch;
  setProvince: (province: Province) => void;
  /** Fetches the province's forecast unless a fresh one is saved (or `force`). */
  refresh: (opts?: { force?: boolean; now?: Date }) => Promise<void>;
};

/** The saved forecast, when it is for the chosen province. */
export const savedForecast = (s: Pick<WeatherState, 'province' | 'saved'>) => (s.saved?.province === s.province.name ? s.saved : null);

const state =
  (fetchImpl: typeof fetch): StateCreator<WeatherState> =>
  (set, get) => ({
    province: provinceByName('Konya')!,
    saved: null,
    status: 'idle',
    fetchImpl,
    setProvince: (province) => set({ province, status: 'idle' }),
    refresh: async ({ force = false, now = new Date() } = {}) => {
      const { province, status } = get();
      const saved = savedForecast(get());
      if (status === 'loading') return;
      if (!force && saved && now.getTime() - new Date(saved.at).getTime() < FRESH_MS) return;
      set({ status: 'loading' });
      try {
        const data = await fetchForecast(province.lat, province.lon, get().fetchImpl);
        // A late answer for a province the farmer has since left is dropped.
        if (get().province.name !== province.name) return;
        set({ saved: { province: province.name, at: now.toISOString(), data }, status: 'idle' });
      } catch {
        if (get().province.name === province.name) set({ status: 'error' });
      }
    },
  });

/** A plain store, for tests. */
export const createWeatherStore = (fetchImpl: typeof fetch) => createStore<WeatherState>()(state(fetchImpl));

/** The app's weather, with the province and last forecast saved on the device. */
export const useWeatherStore = create<WeatherState>()(
  persist(state((...args) => fetch(...args)), {
    name: 'ciftci-destek-weather',
    version: 1,
    storage: createJSONStorage(() => AsyncStorage),
    partialize: ({ province, saved }) => ({ province, saved }),
  })
);
