import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

/**
 * What stays on the phone: the demo scans (the AI scan is a demo for now) and their ticked
 * suggestions. The market, chats, calendar and fields live on the website, through its API.
 */
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
};

export type AppState = Data & {
  addScan: (scan: Omit<Scan, 'id' | 'date'>, now?: Date) => string;
  setSuggestion: (scanId: string, index: number, done: boolean) => void;
};

let seq = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

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
  };
}

const setIn = <T,>(list: T[], v: T, on: boolean) => (on ? (list.includes(v) ? list : [...list, v]) : list.filter((x) => x !== v));

type Set = (fn: (s: AppState) => Partial<AppState>) => void;

function actions(set: Set): Omit<AppState, keyof Data> {
  return {
    addScan: (scan, now = new Date()) => {
      const id = newId('s');
      set((s) => ({ scans: [{ ...scan, id, date: now.toISOString() }, ...s.scans] }));
      return id;
    },
    setSuggestion: (scanId, index, done) =>
      set((s) => ({ doneSuggestions: { ...s.doneSuggestions, [scanId]: setIn(s.doneSuggestions[scanId] ?? [], index, done) } })),
  };
}

/** A plain store, for tests. */
export function createAppStore(now = new Date()) {
  return createStore<AppState>()((set) => ({ ...seed(now), ...actions(set) }));
}

/** The app's store, saved on the device. Version 2 drops the prototype's sample market and chats. */
export const useAppStore = create<AppState>()(
  persist((set) => ({ ...seed(new Date()), ...actions(set) }), {
    name: 'ciftci-destek-demo',
    version: 2,
    storage: createJSONStorage(() => AsyncStorage),
    partialize: ({ scans, doneSuggestions }) => ({ scans, doneSuggestions }),
    migrate: (saved) => {
      const old = (saved ?? {}) as Partial<Data>;
      const fresh = seed(new Date());
      return { scans: old.scans ?? fresh.scans, doneSuggestions: old.doneSuggestions ?? {} } as AppState;
    },
  })
);
