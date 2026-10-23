import { describe, expect, test } from "vitest";
import { PRICES, PRICE_GROUPS, filterPrices, trCompare, trendLabel } from "@/data/demo-prices";

const names = (list: { name: string }[]) => list.map((p) => p.name);

describe("market prices (Tarım Borsası)", () => {
  test("the home strip's four crops keep the demo's values", () => {
    expect(PRICES.slice(0, 4).map((p) => [p.name, p.price, p.change])).toEqual([
      ["Buğday", 9.85, 2.1],
      ["Fındık", 165, 3.1],
      ["Mısır", 8.4, -0.8],
      ["Pamuk", 31.2, 0.6],
    ]);
  });

  test("every crop has a known group, a price and a trend line of at least 4 points", () => {
    const groups = PRICE_GROUPS.map((g) => g.id);
    expect(PRICES.length).toBeGreaterThanOrEqual(12);
    for (const p of PRICES) {
      expect(groups).toContain(p.group);
      expect(p.price).toBeGreaterThan(0);
      expect(p.line.length).toBeGreaterThanOrEqual(4);
    }
  });

  test("a group shows only its crops", () => {
    const list = filterPrices(PRICES, { group: "baklagil", query: "", sort: "az" });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.group === "baklagil")).toBe(true);
  });

  test("search ignores Turkish letters and case, and looks at the exchange too", () => {
    expect(names(filterPrices(PRICES, { group: "tumu", query: "BUGDAY", sort: "az" }))).toEqual(["Buğday"]);
    expect(filterPrices(PRICES, { group: "tumu", query: "giresun", sort: "az" }).map((p) => p.name)).toContain("Fındık");
    expect(filterPrices(PRICES, { group: "tahil", query: "fındık", sort: "az" })).toEqual([]);
  });

  test("A–Z follows the Turkish alphabet", () => {
    expect(["Çeltik", "Ceviz", "Buğday", "İncir", "Isırgan"].sort(trCompare)).toEqual(["Buğday", "Ceviz", "Çeltik", "Isırgan", "İncir"]);
    const az = names(filterPrices(PRICES, { group: "tumu", query: "", sort: "az" }));
    expect(az).toEqual([...az].sort(trCompare));
  });

  test('"largest change" puts the biggest move first, up or down', () => {
    const list = filterPrices(PRICES, { group: "tumu", query: "", sort: "degisim" });
    const sizes = list.map((p) => Math.abs(p.change));
    expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
  });

  test("the trend in words, for screen readers", () => {
    expect(trendLabel(2.1)).toBe("geçen haftaya göre yüzde 2,1 arttı");
    expect(trendLabel(-0.8)).toBe("geçen haftaya göre yüzde 0,8 düştü");
    expect(trendLabel(0)).toBe("geçen haftaya göre değişmedi");
  });
});
