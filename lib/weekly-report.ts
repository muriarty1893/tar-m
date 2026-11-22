/**
 * The weekly report (Yönetim → Haftalık rapor) in plain Turkish: the last 7 days against the 7 before.
 * Pure functions, no I/O.
 */

export type WeekWindows = { thisStart: string; thisEnd: string; prevStart: string; today: string };

/** This week: 00:00 UTC six days ago up to the next midnight (today included). Last week: the 7 days before. */
export function weekWindows(now: Date): WeekWindows {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const at = (offset: number) => new Date(Date.UTC(y, m, d + offset)).toISOString();
  return { thisStart: at(-6), thisEnd: at(1), prevStart: at(-13), today: at(0).slice(0, 10) };
}

/** "16 – 22 Kasım" or "28 Kasım – 4 Aralık". */
export function weekLabel(w: WeekWindows): string {
  const from = new Date(w.thisStart);
  const to = new Date(`${w.today}T12:00:00Z`);
  const opts = { timeZone: "UTC" } as const;
  const sameMonth = from.getUTCMonth() === to.getUTCMonth();
  const start = from.toLocaleDateString("tr-TR", { ...opts, day: "numeric", ...(sameMonth ? {} : { month: "long" }) });
  return `${start} – ${to.toLocaleDateString("tr-TR", { ...opts, day: "numeric", month: "long" })}`;
}

export type Trend = { dir: "up" | "down" | "same"; text: string };

/** How this week compares with last week, in words. */
export function trend(now: number, prev: number): Trend {
  if (now === prev) return { dir: "same", text: now ? "geçen haftayla aynı" : "geçen hafta da yoktu" };
  if (prev === 0) return { dir: "up", text: "geçen hafta hiç yoktu" };
  const pct = Math.round((Math.abs(now - prev) / prev) * 100);
  if (pct === 0) return { dir: now > prev ? "up" : "down", text: "geçen haftayla neredeyse aynı" };
  return now > prev ? { dir: "up", text: `geçen haftaya göre %${pct} daha fazla` } : { dir: "down", text: `geçen haftaya göre %${pct} daha az` };
}

/** "1 kişi", "12 kişi": Turkish keeps the noun singular after a number. */
export const count = (n: number, noun: string) => `${n.toLocaleString("tr-TR")} ${noun}`;
