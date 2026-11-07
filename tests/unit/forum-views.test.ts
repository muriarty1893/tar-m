import { describe, expect, test } from "vitest";
import { fakeViews, shownViews } from "@/lib/forum-views";

/** A Türkiye time (UTC+3) as a Date. */
const tr = (s: string) => new Date(`${s}+03:00`);
const ids = Array.from({ length: 200 }, (_, i) => `7f3c2a1e-0000-4000-8000-${String(i).padStart(12, "0")}`);
const MIN = 60_000;

describe("fakeViews", () => {
  test("nothing before or at the moment a topic goes up", () => {
    const at = tr("2026-11-06T10:00:00");
    expect(fakeViews(ids[0], at, at)).toBe(0);
    expect(fakeViews(ids[0], at, new Date(at.getTime() - MIN))).toBe(0);
  });

  test("the same topic at the same moment always gets the same number", () => {
    const c = tr("2026-11-01T08:00:00");
    const now = tr("2026-11-06T15:37:00");
    expect(fakeViews(ids[3], c, now)).toBe(fakeViews(ids[3], c, now));
  });

  test("only ever grows", () => {
    const c = tr("2026-10-20T13:12:00");
    for (const id of ids.slice(0, 20)) {
      let last = 0;
      for (let t = c.getTime(); t < c.getTime() + 12 * 24 * 60 * MIN; t += 5 * MIN) {
        const v = fakeViews(id, c, new Date(t));
        expect(v).toBeGreaterThanOrEqual(last);
        last = v;
      }
    }
  });

  test("grows only between 09:00 and midnight, Türkiye time", () => {
    const c = tr("2026-10-01T10:00:00");
    for (const id of ids.slice(0, 40)) {
      for (let t = c.getTime(); t < c.getTime() + 4 * 24 * 60 * MIN; t += 5 * MIN) {
        const before = fakeViews(id, c, new Date(t));
        const after = fakeViews(id, c, new Date(t + 5 * MIN));
        if (after > before) {
          const hour = new Date(t + 5 * MIN + 3 * 60 * MIN).getUTCHours();
          expect(hour).toBeGreaterThanOrEqual(9);
        }
      }
    }
  });

  test("a new topic gets a modest first day: about 30–120", () => {
    const c = tr("2026-11-02T08:30:00");
    const firstDay = ids.map((id) => fakeViews(id, c, tr("2026-11-02T23:59:59"))).sort((a, b) => a - b);
    const median = firstDay[firstDay.length / 2];
    expect(median).toBeGreaterThanOrEqual(45);
    expect(median).toBeLessThanOrEqual(105);
    expect(firstDay[0]).toBeGreaterThanOrEqual(10);
    expect(firstDay[firstDay.length - 1]).toBeLessThanOrEqual(175);
  });

  test("then only a few a day", () => {
    const c = tr("2026-10-01T08:30:00");
    const gains = ids.map((id) => fakeViews(id, c, tr("2026-10-11T23:59:59")) - fakeViews(id, c, tr("2026-10-10T23:59:59")));
    const mean = gains.reduce((a, b) => a + b, 0) / gains.length;
    expect(mean).toBeGreaterThan(1);
    expect(mean).toBeLessThan(8);
  });

  test("old topics wake up now and then", () => {
    const c = tr("2025-06-01T12:00:00");
    let wakeUps = 0;
    let quiet = 0;
    for (const id of ids.slice(0, 100)) {
      for (let d = 0; d < 30; d++) {
        const start = new Date(tr("2026-10-01T00:00:00").getTime() + d * 24 * 60 * MIN);
        const gain = fakeViews(id, c, new Date(start.getTime() + 24 * 60 * MIN - 1000)) - fakeViews(id, c, start);
        if (gain >= 3) wakeUps++;
        if (gain === 0) quiet++;
      }
    }
    expect(wakeUps).toBeGreaterThan(30);
    expect(quiet).toBeGreaterThan(1500);
  });

  test("a topic posted just before midnight waits for the morning", () => {
    const c = tr("2026-11-05T23:58:00");
    expect(fakeViews(ids[1], c, tr("2026-11-06T08:59:00"))).toBe(0);
  });

  test("topics differ", () => {
    const c = tr("2026-11-01T08:00:00");
    const now = tr("2026-11-03T20:00:00");
    expect(new Set(ids.map((id) => fakeViews(id, c, now))).size).toBeGreaterThan(30);
  });

  test("an old topic is still quick to count", () => {
    const start = performance.now();
    for (const id of ids.slice(0, 50)) fakeViews(id, tr("2023-01-01T12:00:00"), tr("2026-11-06T15:00:00"));
    expect(performance.now() - start).toBeLessThan(200);
  });
});

describe("shownViews", () => {
  const c = tr("2026-11-06T10:00:00");
  const now = tr("2026-11-06T11:00:00");
  test("real opens plus the made-up ones", () => {
    expect(shownViews(ids[5], 4, c, now)).toBe(4 + fakeViews(ids[5], c, now));
  });
  test("never fewer than three a reply and one a like", () => {
    expect(shownViews(ids[5], 0, c, now, 8, 5)).toBeGreaterThanOrEqual(29);
  });
});
