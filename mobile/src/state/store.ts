import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

export type Scan = {
  id: string;
  scenarioId: string;
  /** ISO timestamp */
  date: string;
  /** A local photo uri, or undefined for the scenario's own photo. */
  photo?: string;
};

type Data = {
  scans: Scan[];
  /** Ticked suggestions per scan (indexes into the scenario's suggestions). */
  doneSuggestions: Record<string, number[]>;
  /** Ticked calendar tasks ("YYYY-MM-DD:title"). */
  doneTasks: string[];
};

export type AppState = Data & {
  addScan: (scan: Omit<Scan, 'id' | 'date'>, now?: Date) => string;
  toggleSuggestion: (scanId: string, index: number) => void;
  toggleTask: (id: string) => void;
};

let seq = 0;
const newId = () => `s-${Date.now().toString(36)}-${(seq++).toString(36)}`;

/** The website demo's history: "Bugün, 08:12", "Dün, 17:40", "3 gün önce", "1 hafta önce". */
function seed(now: Date): Data {
  const at = (daysAgo: number, h: number, m: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return {
    scans: [
      { id: 'demo-1', scenarioId: 'bugday-pas', date: at(0, 8, 12) },
      { id: 'demo-2', scenarioId: 'kuru-misir', date: at(1, 17, 40) },
      { id: 'demo-3', scenarioId: 'aycicegi', date: at(3, 9, 30) },
      { id: 'demo-4', scenarioId: 'domates-mildiyo', date: at(7, 11, 0) },
    ],
    doneSuggestions: {},
    doneTasks: [],
  };
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function actions(set: (fn: (s: AppState) => Partial<AppState>) => void): Omit<AppState, keyof Data> {
  return {
    addScan: (scan, now = new Date()) => {
      const id = newId();
      set((s) => ({ scans: [{ ...scan, id, date: now.toISOString() }, ...s.scans] }));
      return id;
    },
    toggleSuggestion: (scanId, index) =>
      set((s) => ({ doneSuggestions: { ...s.doneSuggestions, [scanId]: toggle(s.doneSuggestions[scanId] ?? [], index) } })),
    toggleTask: (id) => set((s) => ({ doneTasks: toggle(s.doneTasks, id) })),
  };
}

/** A plain store, for tests. */
export function createAppStore(now = new Date()) {
  return createStore<AppState>()((set) => ({ ...seed(now), ...actions(set) }));
}

/** The app's store, saved on the device. */
export const useAppStore = create<AppState>()(
  persist((set) => ({ ...seed(new Date()), ...actions(set) }), {
    name: 'ciftci-destek-demo',
    version: 1,
    storage: createJSONStorage(() => AsyncStorage),
    partialize: ({ scans, doneSuggestions, doneTasks }) => ({ scans, doneSuggestions, doneTasks }),
  })
);
