import { clock, dayKey } from './format';

/** The demo's history dates: "Bugün, 08:12", "Dün, 17:40", "3 gün önce", "1 hafta önce", "2 hafta önce". */
export function whenLabel(date: Date, now: Date) {
  const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((midnight(now) - midnight(date)) / 86_400_000);
  if (dayKey(date) === dayKey(now)) return `Bugün, ${clock(date)}`;
  if (days === 1) return `Dün, ${clock(date)}`;
  if (days < 7) return `${days} gün önce`;
  const weeks = Math.floor(days / 7);
  return weeks < 5 ? `${weeks} hafta önce` : `${Math.floor(days / 30)} ay önce`;
}
