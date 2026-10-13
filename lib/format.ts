const trDate = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-10-05" → "5 Ekim 2026" */
export function formatTrDate(isoDate: string): string {
  return trDate.format(new Date(`${isoDate}T00:00:00Z`));
}

const trWeekday = new Intl.DateTimeFormat("tr-TR", { weekday: "long", timeZone: "UTC" });
const trShort = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });

/** Forecast row label: "Bugün", "Yarın", then the weekday ("Perşembe"). `index` is the day's place in the forecast. */
export function formatTrDay(isoDate: string, index: number): string {
  if (index === 0) return "Bugün";
  if (index === 1) return "Yarın";
  return trWeekday.format(new Date(`${isoDate}T00:00:00Z`));
}

/** "2026-10-13" → "13 Eki" */
export function formatTrShortDate(isoDate: string): string {
  return trShort.format(new Date(`${isoDate}T00:00:00Z`));
}
