import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import type { CropId } from '@/domain/crops';
import { DIAGNOSES } from '@/domain/diagnosis';
import { SAMPLE_FIELDS, type Field } from '@/domain/fields';
import { addDays, clock, dayKey } from '@/domain/format';

export type TaskKind = 'ilaclama' | 'sulama' | 'gubre' | 'ekim' | 'hasat' | 'diger';

export type Task = {
  id: string;
  title: string;
  kind: TaskKind;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM" */
  time?: string;
  fieldId?: string;
  scanId?: string;
  done: boolean;
};

export type Scan = {
  id: string;
  /** ISO timestamp */
  date: string;
  crop: CropId;
  fieldId?: string;
  diagnosisId: string;
  confidence: number;
  /** A sample photo id, or a local file uri from the camera or gallery. */
  photo: string;
};

export type Profile = { name: string; province: string; district: string; crops: CropId[] };
export type Settings = { offline: boolean; notifications: boolean; voiceAnswers: boolean };

type Data = {
  onboarded: boolean;
  profile: Profile;
  fields: Field[];
  tasks: Task[];
  scans: Scan[];
  settings: Settings;
};

export type AppState = Data & {
  completeOnboarding: (profile: Profile) => void;
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'done'>) => void;
  addScan: (scan: Omit<Scan, 'id' | 'date'>, now?: Date) => string;
  scheduleTreatment: (scanId: string, start: Date) => void;
  setSetting: (key: keyof Settings, value: boolean) => void;
  resetDemo: (now?: Date) => void;
};

let seq = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

/** The demo's starting point: three fields, a few tasks around today and two past scans. */
function seed(now: Date): Data {
  const day = (n: number) => dayKey(addDays(now, n));
  const at = (n: number, h: number) => {
    const d = addDays(now, n);
    d.setHours(h, 0, 0, 0);
    return d.toISOString();
  };
  return {
    onboarded: false,
    profile: { name: 'Ahmet', province: 'Konya', district: 'Ereğli', crops: ['bugday', 'domates'] },
    fields: SAMPLE_FIELDS,
    tasks: [
      { id: 't1', title: 'Damla sulamayı kontrol et', kind: 'sulama', date: day(0), time: '17:30', fieldId: 'domates', done: false },
      { id: 't2', title: 'Taban gübresi (DAP) at', kind: 'gubre', date: day(0), fieldId: 'kuzey', done: false },
      { id: 't3', title: 'Toprak analizi için numune al', kind: 'diger', date: day(2), fieldId: 'kuzey', done: false },
      { id: 't4', title: 'Ayçiçeği hasadına başla', kind: 'hasat', date: day(5), fieldId: 'aycicegi', done: false },
      { id: 't5', title: 'Gübre siparişi ver', kind: 'gubre', date: day(8), done: false },
      { id: 't6', title: 'Fideleri sula', kind: 'sulama', date: day(-2), time: '07:00', fieldId: 'domates', done: true },
    ],
    scans: [
      { id: 's1', date: at(-2, 10), crop: 'domates', fieldId: 'domates', diagnosisId: 'domates-mildiyo', confidence: 0.91, photo: 'domates-mildiyo' },
      { id: 's2', date: at(-14, 9), crop: 'bugday', fieldId: 'kuzey', diagnosisId: 'saglikli', confidence: 0.93, photo: 'saglikli-fide' },
    ],
    settings: { offline: false, notifications: true, voiceAnswers: true },
  };
}

function actions(set: (fn: (s: AppState) => Partial<AppState>) => void, get: () => AppState): Omit<AppState, keyof Data> {
  return {
    completeOnboarding: (profile) => set(() => ({ onboarded: true, profile })),
    toggleTask: (id) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
    addTask: (task) => set((s) => ({ tasks: [...s.tasks, { ...task, id: newId('t'), done: false }] })),
    addScan: (scan, now = new Date()) => {
      const id = newId('s');
      set((s) => ({ scans: [{ ...scan, id, date: now.toISOString() }, ...s.scans] }));
      return id;
    },
    scheduleTreatment: (scanId, start) => {
      const s = get();
      const scan = s.scans.find((x) => x.id === scanId);
      if (!scan || s.tasks.some((t) => t.scanId === scanId)) return;
      const name = DIAGNOSES[scan.diagnosisId]?.name ?? 'Hastalık';
      set((st) => ({
        tasks: [
          ...st.tasks,
          { id: newId('t'), title: `${name} ilaçlaması`, kind: 'ilaclama', date: dayKey(start), time: clock(start), fieldId: scan.fieldId, scanId, done: false },
        ],
      }));
    },
    setSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),
    resetDemo: (now = new Date()) => set(() => seed(now)),
  };
}

/** A plain store, for tests. */
export function createAppStore(now = new Date()) {
  return createStore<AppState>()((set, get) => ({ ...seed(now), ...actions(set, get) }));
}

/** The app's store, saved on the device. */
export const useAppStore = create<AppState>()(
  persist((set, get) => ({ ...seed(new Date()), ...actions(set, get) }), {
    name: 'ciftci-destek',
    version: 1,
    storage: createJSONStorage(() => AsyncStorage),
    partialize: ({ onboarded, profile, tasks, scans, settings }) => ({ onboarded, profile, tasks, scans, settings }),
    // Images are bundled assets, so fields always come from the code, never from storage.
    merge: (saved, current) => ({ ...current, ...(saved as Partial<Data>), fields: current.fields }),
  })
);
