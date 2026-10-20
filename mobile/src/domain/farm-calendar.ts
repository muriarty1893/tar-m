import { dayKey } from './format';

/**
 * The website demo's farm calendar (data/farm-calendar.ts). The demo is set on 14 October; here
 * each task keeps its distance from that day, counted from today, so the month always looks lived in.
 */
export type TaskKind = 'analiz' | 'toprak' | 'gubre' | 'ilac' | 'ekim' | 'sulama' | 'hasat' | 'uyari';

export type FarmTask = { offset: number; kind: TaskKind; title: string; field: string; time: string };

const DEMO_TODAY = 14;
const t = (day: number, kind: TaskKind, title: string, field: string, time: string): FarmTask => ({ offset: day - DEMO_TODAY, kind, title, field, time });

export const FARM_TASKS: FarmTask[] = [
  t(6, 'analiz', 'Toprak analizi için numune al', 'Buğday tarlası', '09:00'),
  t(9, 'toprak', 'Toprağı diskaro ile işle', 'Buğday tarlası', '08:00'),
  t(14, 'gubre', 'Taban gübresi (DAP) at', 'Buğday tarlası', '08:30'),
  t(14, 'sulama', 'Damla sulamayı kontrol et', 'Domates serası', '17:00'),
  t(15, 'ilac', 'Tohumu ilaçla', 'Ambar', '10:00'),
  t(16, 'ekim', 'Buğday ekimi', 'Buğday tarlası', '07:30'),
  t(21, 'hasat', 'Mısır hasadı', 'Mısır tarlası', '07:00'),
  t(21, 'sulama', 'Fideleri sula', 'Domates serası', '18:00'),
  t(27, 'hasat', 'Zeytin hasadına başla', 'Zeytinlik', '08:00'),
  t(30, 'uyari', 'Don riski: fideleri ört', 'Domates serası', '16:00'),
];

export const TASK_KINDS: Record<TaskKind, { label: string }> = {
  analiz: { label: 'Analiz' },
  toprak: { label: 'Toprak işleme' },
  gubre: { label: 'Gübreleme' },
  ilac: { label: 'İlaçlama' },
  ekim: { label: 'Ekim' },
  sulama: { label: 'Sulama' },
  hasat: { label: 'Hasat' },
  uyari: { label: 'Uyarı' },
};

const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysBetween = (a: Date, b: Date) => Math.round((midnight(b).getTime() - midnight(a).getTime()) / 86_400_000);

export function tasksOn(day: Date, today: Date): FarmTask[] {
  const offset = daysBetween(today, day);
  return FARM_TASKS.filter((x) => x.offset === offset);
}

/** A task's id for remembering it was done: its date and title. */
export const taskId = (day: Date, task: FarmTask) => `${dayKey(day)}:${task.title}`;
