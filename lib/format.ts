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
