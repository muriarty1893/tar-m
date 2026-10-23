/**
 * The demo phone's clock and time labels. The demo lives on a fixed morning, 14 Ekim 2026 at 09:41
 * (its status bar and the calendar's "today"), so listing ages and chat days read the same for every
 * visitor and in the tests; from page load on, it runs at real speed so new messages get real times.
 * The labels are copies of the mobile app's (mobile/src/domain/format.ts and when.ts).
 */
export const DEMO_START = new Date(2026, 9, 14, 9, 41);
const LOADED_AT = Date.now();

/** The demo's "now": the fixed start plus the time since the page loaded (or `elapsed` ms, for tests). */
export const demoNow = (elapsed = Date.now() - LOADED_AT) => new Date(DEMO_START.getTime() + elapsed);

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const WEEKDAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const pad = (n: number) => String(n).padStart(2, "0");

/** "16 Ekim, Cuma" */
export const dayTitle = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]}`;

/** Local calendar-day key, "2026-10-16". */
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function addDays(d: Date, days: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

/** "06:00" */
export const clock = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** History dates: "Bugün, 08:12", "Dün, 17:40", "3 gün önce", "1 hafta önce", "2 hafta önce". */
export function whenLabel(date: Date, now: Date) {
  const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((midnight(now) - midnight(date)) / 86_400_000);
  if (dayKey(date) === dayKey(now)) return `Bugün, ${clock(date)}`;
  if (days === 1) return `Dün, ${clock(date)}`;
  if (days < 7) return `${days} gün önce`;
  const weeks = Math.floor(days / 7);
  return weeks < 5 ? `${weeks} hafta önce` : `${Math.floor(days / 30)} ay önce`;
}

/** Short times for listings and chats: "Az önce", "25 dk önce", "3 saat önce", "Dün", "3 gün önce", "2 hafta önce". */
export function agoLabel(date: Date, now: Date) {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  if (dayKey(date) === dayKey(now)) return `${Math.floor(minutes / 60)} saat önce`;
  const label = whenLabel(date, now);
  return label.startsWith("Dün") ? "Dün" : label;
}

/** The "-den/-dan/-ten/-tan" ending after a year, as the number is read: "2019’dan", "2020’den", "2023’ten". */
export function fromYear(year: number) {
  // The last spoken word decides: its last vowel (e/a) and whether it ends in a hard consonant (t).
  const ones = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
  const tens = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];
  const word = ones[year % 10] || tens[Math.floor(year / 10) % 10] || (year % 1000 === 0 ? "bin" : "yüz");
  const vowel = [...word].reverse().find((c) => "aeıioöuü".includes(c)) ?? "e";
  const hard = "fstkçşhp".includes(word[word.length - 1]);
  return `${year}’${hard ? "t" : "d"}${"aıou".includes(vowel) ? "an" : "en"}`;
}
