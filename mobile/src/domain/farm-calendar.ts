import type { TaskKind } from '@/api/types';

/** Tarım takvimi's kinds of work, as on the website (lib/farm.ts). The tasks themselves live on the website. */
export type { TaskKind };

export const TASK_KINDS: Record<TaskKind, { label: string }> = {
  analiz: { label: 'Analiz' },
  toprak: { label: 'Toprak işleme' },
  gubre: { label: 'Gübreleme' },
  ilac: { label: 'İlaçlama' },
  ekim: { label: 'Ekim' },
  sulama: { label: 'Sulama' },
  hasat: { label: 'Hasat' },
  uyari: { label: 'Uyarı' },
  diger: { label: 'Diğer' },
};

export const TASK_KIND_IDS = Object.keys(TASK_KINDS) as TaskKind[];

const isDayKey = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
const isTime = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export type TaskDraft = { title: string; kind: string; date: string; time: string; fieldId: string };

/** The task form's checks: the website's validateTask. */
export function validateTask(t: TaskDraft): Partial<Record<keyof TaskDraft, string>> {
  const e: Partial<Record<keyof TaskDraft, string>> = {};
  const title = t.title.trim();
  if (title.length < 2) e.title = 'Yapılacak işi yazın (ör. Taban gübresi at).';
  else if (title.length > 80) e.title = 'İş en fazla 80 karakter olabilir.';
  if (!(t.kind in TASK_KINDS)) e.kind = 'İşin türünü seçin.';
  if (!isDayKey(t.date)) e.date = 'Tarihi seçin.';
  if (t.time && !isTime(t.time)) e.time = 'Saati SS:DD olarak yazın (ör. 08:30).';
  return e;
}

/** "2026-11" moved by `by` months. */
export function shiftMonthKey(key: string, by: number) {
  const [y, m] = key.split('-').map(Number);
  const i = y * 12 + (m - 1) + by;
  return `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`;
}
