import { describe, expect, test } from "vitest";
import { EMPTY_FIELD, expensesByKind, monthGrid, normalizeField, parseMonth, shiftMonth, validateExpense, validateField, validateTask } from "@/lib/farm";
import { addDaysKey, agoLabel, chatDayLabel, dayTitle, trClock, trDayKey } from "@/lib/tr-time";

describe("fields", () => {
  test("a name and an area are required", () => {
    expect(Object.keys(validateField(EMPTY_FIELD)).sort()).toEqual(["area", "name"]);
    expect(validateField({ ...EMPTY_FIELD, name: "Buğday tarlası", area: "45,5" })).toEqual({});
  });

  test("Turkish numbers are read", () => {
    const v = normalizeField({ ...EMPTY_FIELD, name: " Buğday  tarlası ", area: "45,5", expectedYield: "18.000" });
    expect(v).toMatchObject({ name: "Buğday tarlası", areaDonum: 45.5, expectedYieldKg: 18000 });
    expect(normalizeField({ ...EMPTY_FIELD, name: "A tarlası", area: "3" }).expectedYieldKg).toBeNull();
  });
});

describe("expenses", () => {
  test("no future dates, a kind and an amount", () => {
    expect(validateExpense({ kind: "gubre", amount: "12.500", date: "2026-11-03", note: "" }, "2026-11-03")).toEqual({});
    expect(validateExpense({ kind: "gubre", amount: "12.500", date: "2026-11-04", note: "" }, "2026-11-03").date).toBeTruthy();
    expect(validateExpense({ kind: "uzay", amount: "0", date: "", note: "" }, "2026-11-03")).toMatchObject({ kind: expect.any(String), amount: expect.any(String), date: expect.any(String) });
  });

  test("totals by kind, largest first", () => {
    expect(
      expensesByKind([
        { kind: "gubre", amount: 100 },
        { kind: "mazot", amount: 300 },
        { kind: "gubre", amount: 250 },
      ]),
    ).toEqual([
      { kind: "gubre", amount: 350 },
      { kind: "mazot", amount: 300 },
    ]);
  });
});

describe("tasks", () => {
  test("a title, a kind, a date; the time is optional but must be a time", () => {
    expect(validateTask({ title: "Taban gübresi at", kind: "gubre", date: "2026-11-03", time: "", fieldId: "" })).toEqual({});
    expect(validateTask({ title: "Taban gübresi at", kind: "gubre", date: "2026-11-03", time: "25:00", fieldId: "" }).time).toBeTruthy();
    expect(Object.keys(validateTask({ title: "", kind: "x", date: "dün", time: "", fieldId: "" })).sort()).toEqual(["date", "kind", "title"]);
  });
});

describe("the month view", () => {
  test("November 2026 starts on a Sunday: six leading blanks, Monday first", () => {
    const weeks = monthGrid({ year: 2026, month: 10 });
    expect(weeks[0]).toEqual([null, null, null, null, null, null, "2026-11-01"]);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });

  test("?ay= is read, else today's month; months wrap over the year", () => {
    expect(parseMonth("2027-02", "2026-11-03")).toEqual({ year: 2027, month: 1 });
    expect(parseMonth("2027-13", "2026-11-03")).toEqual({ year: 2026, month: 10 });
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });
});

describe("Turkish time", () => {
  test("the day and clock are Türkiye's (UTC+3), not the server's", () => {
    const lateUtc = new Date("2026-11-03T22:30:00Z");
    expect(trDayKey(lateUtc)).toBe("2026-11-04");
    expect(trClock(lateUtc)).toBe("01:30");
  });

  test("labels", () => {
    const now = new Date("2026-11-03T12:00:00Z");
    expect(agoLabel(new Date("2026-11-03T11:55:00Z"), now)).toBe("5 dk önce");
    expect(agoLabel(new Date("2026-11-02T12:00:00Z"), now)).toBe("Dün");
    expect(chatDayLabel(new Date("2026-11-03T08:00:00Z"), now)).toBe("Bugün");
    expect(dayTitle("2026-11-03")).toBe("3 Kasım, Salı");
    expect(addDaysKey("2026-12-31", 1)).toBe("2027-01-01");
  });
});
