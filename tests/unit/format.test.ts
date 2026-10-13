import { describe, it, expect } from "vitest";
import { formatTrDay, formatTrShortDate } from "@/lib/format";

describe("forecast day labels", () => {
  it("names the first two days Bugün and Yarın, then the weekday", () => {
    expect(formatTrDay("2026-10-13", 0)).toBe("Bugün");
    expect(formatTrDay("2026-10-14", 1)).toBe("Yarın");
    expect(formatTrDay("2026-10-15", 2)).toBe("Perşembe");
  });

  it("short dates use the Turkish month abbreviation", () => {
    expect(formatTrShortDate("2026-10-13")).toBe("13 Eki");
  });
});
