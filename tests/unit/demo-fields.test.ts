import { describe, expect, test } from "vitest";
import { demoScenarios } from "@/data/demo-scenarios";
import { FIELDS, fieldById, healthOf, seasonSummary, tonsLabel, totalExpenses, upcomingTasks } from "@/data/demo-fields";

const field = (id: string) => {
  const f = fieldById(id);
  if (!f) throw new Error(`no field ${id}`);
  return f;
};

describe("the demo phone's fields (Tarlalarım)", () => {
  test("four fields, each with a known last scan, a positive area and an outline on the map", () => {
    expect(FIELDS).toHaveLength(4);
    for (const f of FIELDS) {
      expect(demoScenarios.some((s) => s.id === f.scenarioId)).toBe(true);
      expect(f.areaDonum).toBeGreaterThan(0);
      expect(f.outline.length).toBeGreaterThanOrEqual(3);
      for (const [x, y] of f.outline) for (const v of [x, y]) expect(v >= 0 && v <= 1).toBe(true);
    }
  });

  test("health follows the last scan: under 50 risky, under 75 watch, else healthy", () => {
    expect(healthOf(field("bugday"))).toBe("izlenmeli");
    expect(healthOf(field("misir"))).toBe("izlenmeli");
    expect(healthOf(field("domates"))).toBe("riskli");
    expect(healthOf(field("aycicegi"))).toBe("saglikli");
  });

  test("expenses and the season summary add up", () => {
    expect(totalExpenses(field("bugday"))).toBe(147_000);
    expect(seasonSummary(FIELDS)).toEqual({ areaDonum: 103, expenses: 462_500, yieldKg: 100_000 });
  });

  test("upcoming tasks are the demo calendar's tasks for that field, from its 'today' (the 14th) on", () => {
    expect(upcomingTasks(field("domates")).map((t) => [t.day, t.title])).toEqual([
      [14, "Damla sulamayı kontrol et"],
      [21, "Fideleri sula"],
      [30, "Don riski: fideleri ört"],
    ]);
    expect(upcomingTasks(field("bugday")).map((t) => t.title)).toEqual(["Taban gübresi (DAP) at", "Buğday ekimi"]);
    expect(upcomingTasks(field("domates"), 1)).toHaveLength(1);
    expect(upcomingTasks(field("aycicegi"))).toEqual([]);
  });

  test("yields read in tons, with a decimal comma only when needed", () => {
    expect(tonsLabel(18_000)).toBe("18 ton");
    expect(tonsLabel(7_500)).toBe("7,5 ton");
  });
});
