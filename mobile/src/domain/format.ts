// Turkish date and number formatting. Written out by hand rather than with Intl, whose Turkish
// data is incomplete on some Android engines.

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const MONTHS_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
export const WEEKDAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
/** Monday-first initials for a calendar header. */
export const WEEKDAY_INITIALS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

const pad = (n: number) => String(n).padStart(2, '0');

export const monthName = (month: number) => MONTHS[month];

/** "16 Ekim, Cuma" */
export function dayTitle(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]}`;
}

/** "2 Eki" */
export function shortDate(d: Date) {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** Local calendar-day key, "2026-10-16". */
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDayKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, days: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

/** "Bugün", "Yarın" or "19 Ekim, Pazartesi". */
export function relativeDayLabel(d: Date, today: Date) {
  if (dayKey(d) === dayKey(today)) return 'Bugün';
  if (dayKey(d) === dayKey(addDays(today, 1))) return 'Yarın';
  return dayTitle(d);
}

/** "06:00" */
export const clock = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** "06:00–09:00" */
export const timeRange = (startHour: number, endHour: number) => `${pad(startHour)}:00–${pad(endHour)}:00`;

function groupThousands(int: string) {
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** "11,40 ₺", "1.250,00 ₺" */
export function formatTL(n: number) {
  const [int, dec] = n.toFixed(2).split('.');
  return `${groupThousands(int)},${dec} ₺`;
}

/** "%2,1": the size of a change; its direction is shown separately. */
export function formatPercent(n: number) {
  return `%${Math.abs(n).toFixed(1).replace('.', ',')}`;
}

/** A month as Monday-first weeks of seven, with null for days outside the month. */
export function monthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: count }, (_, i) => new Date(year, month, i + 1))];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

/** The "-den/-dan/-ten/-tan" ending after a year, as the number is read: "2019’dan", "2020’den", "2023’ten". */
export function fromYear(year: number) {
  // The last spoken word decides: its last vowel (e/a) and whether it ends in a hard consonant (t).
  const ones = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
  const tens = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
  const word = ones[year % 10] || tens[Math.floor(year / 10) % 10] || (year % 1000 === 0 ? 'bin' : 'yüz');
  const vowel = [...word].reverse().find((c) => 'aeıioöuü'.includes(c)) ?? 'e';
  const hard = 'fstkçşhp'.includes(word[word.length - 1]);
  return `${year}’${hard ? 't' : 'd'}${'aıou'.includes(vowel) ? 'an' : 'en'}`;
}
