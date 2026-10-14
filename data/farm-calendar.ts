/**
 * Demo farm calendar for the phone app's "Takvim" tab: October 2026, the start of the wheat
 * season. Fixed dates (not the visitor's clock) so the demo and its tests always look the same.
 */
export type TaskKind = "analiz" | "toprak" | "gubre" | "ilac" | "ekim" | "sulama" | "hasat" | "uyari";

export type FarmTask = { day: number; kind: TaskKind; title: string; field: string; time: string };

export const CALENDAR_MONTH = { year: 2026, month: 9, name: "Ekim", today: 14 } as const;

export const farmTasks: FarmTask[] = [
  { day: 6, kind: "analiz", title: "Toprak analizi için numune al", field: "Buğday tarlası", time: "09:00" },
  { day: 9, kind: "toprak", title: "Toprağı diskaro ile işle", field: "Buğday tarlası", time: "08:00" },
  { day: 14, kind: "gubre", title: "Taban gübresi (DAP) at", field: "Buğday tarlası", time: "08:30" },
  { day: 14, kind: "sulama", title: "Damla sulamayı kontrol et", field: "Domates serası", time: "17:00" },
  { day: 15, kind: "ilac", title: "Tohumu ilaçla", field: "Ambar", time: "10:00" },
  { day: 16, kind: "ekim", title: "Buğday ekimi", field: "Buğday tarlası", time: "07:30" },
  { day: 21, kind: "hasat", title: "Mısır hasadı", field: "Mısır tarlası", time: "07:00" },
  { day: 21, kind: "sulama", title: "Fideleri sula", field: "Domates serası", time: "18:00" },
  { day: 27, kind: "hasat", title: "Zeytin hasadına başla", field: "Zeytinlik", time: "08:00" },
  { day: 30, kind: "uyari", title: "Don riski: fideleri ört", field: "Domates serası", time: "16:00" },
];

export const TASK_KINDS: Record<TaskKind, { label: string }> = {
  analiz: { label: "Analiz" },
  toprak: { label: "Toprak işleme" },
  gubre: { label: "Gübreleme" },
  ilac: { label: "İlaçlama" },
  ekim: { label: "Ekim" },
  sulama: { label: "Sulama" },
  hasat: { label: "Hasat" },
  uyari: { label: "Uyarı" },
};

const WEEKDAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

/** Monday-first index (0 = Pazartesi) of a day of the demo month. */
export function weekdayIndex(day: number): number {
  return (new Date(CALENDAR_MONTH.year, CALENDAR_MONTH.month, day).getDay() + 6) % 7;
}

export function weekdayName(day: number): string {
  return WEEKDAYS[weekdayIndex(day)];
}

export function daysInMonth(): number {
  return new Date(CALENDAR_MONTH.year, CALENDAR_MONTH.month + 1, 0).getDate();
}

export function tasksOn(day: number): FarmTask[] {
  return farmTasks.filter((t) => t.day === day);
}
