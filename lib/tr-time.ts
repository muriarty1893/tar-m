/**
 * Dates and times as they read in Türkiye. The server runs in UTC, so "today", "Dün" and clock
 * times are worked out in Turkish time explicitly: UTC+3 all year (no daylight saving since 2016).
 */
const OFFSET_MS = 3 * 3_600_000;
const pad = (n: number) => String(n).padStart(2, "0");

export const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
/** Sunday first, as Date.getDay(). */
export const WEEKDAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

/** The date shifted so its UTC fields are the Turkish wall clock. */
const shifted = (d: Date) => new Date(d.getTime() + OFFSET_MS);

/** "2026-11-03", the Turkish calendar day. */
export function trDayKey(d: Date) {
  const s = shifted(d);
  return `${s.getUTCFullYear()}-${pad(s.getUTCMonth() + 1)}-${pad(s.getUTCDate())}`;
}

/** "08:05" in Turkish time. */
export function trClock(d: Date) {
  const s = shifted(d);
  return `${pad(s.getUTCHours())}:${pad(s.getUTCMinutes())}`;
}

/** Whole days between two day keys ("2026-11-01" → "2026-11-03" is 2). */
export function daysBetween(fromKey: string, toKey: string) {
  return Math.round((Date.parse(`${toKey}T00:00:00Z`) - Date.parse(`${fromKey}T00:00:00Z`)) / 86_400_000);
}

/** A day key moved by `n` days. */
export function addDaysKey(key: string, n: number) {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Weekday of a day key, Sunday = 0. */
export const weekdayOf = (key: string) => new Date(`${key}T00:00:00Z`).getUTCDay();

/** "3 Kasım 2026" */
export function longDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "3 Kasım, Salı" */
export function dayTitle(key: string) {
  const [, m, d] = key.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}, ${WEEKDAYS[weekdayOf(key)]}`;
}

/** Short times for listings and chats: "Az önce", "25 dk önce", "3 saat önce", "Dün", "3 gün önce", "2 hafta önce", "4 ay önce". */
export function agoLabel(date: Date, now: Date) {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const days = daysBetween(trDayKey(date), trDayKey(now));
  if (days <= 0) return `${Math.floor(minutes / 60)} saat önce`;
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} hafta önce`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months} ay önce` : `${Math.floor(days / 365)} yıl önce`;
}

/** Chat day separators: "Bugün", "Dün", else "3 Kasım, Salı". */
export function chatDayLabel(date: Date, now: Date) {
  const key = trDayKey(date);
  const days = daysBetween(key, trDayKey(now));
  if (days === 0) return "Bugün";
  if (days === 1) return "Dün";
  return dayTitle(key);
}

/** "Ekim 2026" from an ISO time, for "Üyelik: Ekim 2026". */
export function monthYear(date: Date) {
  const s = shifted(date);
  return `${MONTHS[s.getUTCMonth()]} ${s.getUTCFullYear()}`;
}
