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

/** Short times for listings and chats: "Az önce", "25 dk önce", "3 saat önce", "Dün", "3 gün önce", "2 hafta önce". */
export function agoLabel(date: Date, now: Date) {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return 'Az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  if (dayKey(date) === dayKey(now)) return `${Math.floor(minutes / 60)} saat önce`;
  const label = whenLabel(date, now);
  return label.startsWith('Dün') ? 'Dün' : label;
}
