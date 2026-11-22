import { describe, expect, it } from "vitest";
import { count, trend, weekLabel, weekWindows } from "@/lib/weekly-report";

describe("weekly report", () => {
  it("compares this week with the 7 days before, today included", () => {
    expect(weekWindows(new Date("2026-11-22T21:30:00Z"))).toEqual({
      thisStart: "2026-11-16T00:00:00.000Z",
      thisEnd: "2026-11-23T00:00:00.000Z",
      prevStart: "2026-11-09T00:00:00.000Z",
      today: "2026-11-22",
    });
  });

  it("names the week in Turkish", () => {
    expect(weekLabel(weekWindows(new Date("2026-11-22T10:00:00Z")))).toBe("16 – 22 Kasım");
    expect(weekLabel(weekWindows(new Date("2026-12-03T10:00:00Z")))).toBe("27 Kasım – 3 Aralık");
  });

  it("describes the change in words", () => {
    expect(trend(13, 10)).toEqual({ dir: "up", text: "geçen haftaya göre %30 daha fazla" });
    expect(trend(5, 10)).toEqual({ dir: "down", text: "geçen haftaya göre %50 daha az" });
    expect(trend(4, 4)).toEqual({ dir: "same", text: "geçen haftayla aynı" });
    expect(trend(0, 0)).toEqual({ dir: "same", text: "geçen hafta da yoktu" });
    expect(trend(3, 0)).toEqual({ dir: "up", text: "geçen hafta hiç yoktu" });
    expect(trend(1001, 1000).text).toBe("geçen haftayla neredeyse aynı");
  });

  it("keeps the noun singular after a number", () => {
    expect(count(1, "kişi")).toBe("1 kişi");
    expect(count(1200, "kişi")).toBe("1.200 kişi");
  });
});
