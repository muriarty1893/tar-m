/**
 * Tarlalarım: the farmer's own fields and this season's expenses, kept on the website. The kinds,
 * stages and form checks are the website's (lib/farm.ts); change both together.
 */
import type { ExpenseKind, FieldSummary } from '@/api/types';

import { isProvince, parsePrice } from './market';
import { fold } from './text';

export const EXPENSE_KINDS: Record<ExpenseKind, string> = {
  tohum: 'Tohum ve fide',
  gubre: 'Gübre',
  ilac: 'İlaç',
  mazot: 'Mazot',
  su: 'Sulama',
  iscilik: 'İşçilik',
  diger: 'Diğer',
};

export const EXPENSE_KIND_IDS = Object.keys(EXPENSE_KINDS) as ExpenseKind[];

/** Suggestions for a field's stage (free text is fine too). */
export const STAGES = ['Ekim hazırlığı', 'Ekildi', 'Çimlendi', 'Gelişme dönemi', 'Çiçeklenme', 'Hasat zamanı', 'Hasat edildi', 'Nadasta'];

/** "18 ton", "7,5 ton" */
export function tonsLabel(kg: number) {
  const t = Math.round(kg / 100) / 10;
  return `${Number.isInteger(t) ? t : t.toFixed(1).replace('.', ',')} ton`;
}

/** "45", "45,5" */
export const donumLabel = (n: number) => `${String(Math.round(n * 10) / 10).replace('.', ',')} dönüm`;

export type FieldDraft = { name: string; crop: string; stage: string; area: string; province: string; district: string; expectedYield: string; notes: string };
export const EMPTY_FIELD: FieldDraft = { name: '', crop: '', stage: '', area: '', province: '', district: '', expectedYield: '', notes: '' };

/** The field form's checks: the website's validateField. */
export function validateField(f: FieldDraft): Partial<Record<keyof FieldDraft, string>> {
  const e: Partial<Record<keyof FieldDraft, string>> = {};
  const name = f.name.trim();
  if (name.length < 2) e.name = 'Tarlaya bir ad verin (ör. Buğday tarlası).';
  else if (name.length > 40) e.name = 'Ad en fazla 40 karakter olabilir.';
  if (f.crop.trim().length > 40) e.crop = 'Ürün en fazla 40 karakter olabilir.';
  if (f.stage.trim().length > 40) e.stage = 'Dönem en fazla 40 karakter olabilir.';
  const area = parsePrice(f.area);
  if (!(area > 0)) e.area = 'Alanı dönüm olarak yazın (ör. 45).';
  else if (area > 1_000_000) e.area = 'Alan çok büyük görünüyor.';
  if (f.province && !isProvince(f.province)) e.province = 'Listeden bir il seçin.';
  if (f.district.trim().length > 40) e.district = 'İlçe en fazla 40 karakter olabilir.';
  if (f.expectedYield.trim() && !(parsePrice(f.expectedYield) >= 0)) e.expectedYield = 'Beklenen verimi kilogram olarak yazın (ör. 18.000).';
  if (f.notes.length > 500) e.notes = 'Not en fazla 500 karakter olabilir.';
  return e;
}

export type ExpenseDraft = { kind: string; amount: string; date: string; note: string };

/** The expense form's checks: the website's validateExpense. `today` is "2026-11-04". */
export function validateExpense(x: ExpenseDraft, today: string): Partial<Record<keyof ExpenseDraft, string>> {
  const e: Partial<Record<keyof ExpenseDraft, string>> = {};
  if (!(x.kind in EXPENSE_KINDS)) e.kind = 'Masraf türünü seçin.';
  const amount = parsePrice(x.amount);
  if (!(amount > 0)) e.amount = 'Tutarı yazın (ör. 12.500).';
  else if (amount > 100_000_000) e.amount = 'Tutar çok yüksek görünüyor.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(x.date)) e.date = 'Tarihi seçin.';
  else if (x.date > today) e.date = 'Gelecek bir tarih olamaz.';
  if (x.note.trim().length > 120) e.note = 'Not en fazla 120 karakter olabilir.';
  return e;
}

/** Totals by kind, largest first. */
export function expensesByKind(expenses: { kind: ExpenseKind; amount: number }[]) {
  const totals = new Map<ExpenseKind, number>();
  for (const x of expenses) totals.set(x.kind, (totals.get(x.kind) ?? 0) + x.amount);
  return [...totals].map(([kind, amount]) => ({ kind, amount })).sort((a, b) => b.amount - a.amount);
}

export function seasonSummary(fields: Pick<FieldSummary, 'areaDonum' | 'expenses' | 'expectedYieldKg'>[]) {
  return {
    areaDonum: fields.reduce((n, f) => n + f.areaDonum, 0),
    expenses: fields.reduce((n, f) => n + f.expenses, 0),
    yieldKg: fields.reduce((n, f) => n + (f.expectedYieldKg ?? 0), 0),
  };
}

const CROP_PHOTOS: [words: string[], photo: number][] = [
  [['bugday', 'arpa', 'tritikale', 'cavdar', 'yulaf'], require('@/assets/images/app/tractor-field.webp')],
  [['misir'], require('@/assets/images/app/misir-kuraklik.webp')],
  [['domates', 'biber', 'sera', 'salatalik'], require('@/assets/images/app/domates-mildiyo.webp')],
  [['aycicegi'], require('@/assets/images/app/aycicegi-tarlasi.webp')],
];
const DEFAULT_FIELD_PHOTO = require('@/assets/images/app/tractor-field.webp');

/** A picture for the field's card, by its crop (real fields have no photo of their own). */
export function cropPhoto(crop: string, name = ''): number {
  const t = fold(`${crop} ${name}`);
  return CROP_PHOTOS.find(([words]) => words.some((w) => t.includes(w)))?.[1] ?? DEFAULT_FIELD_PHOTO;
}
