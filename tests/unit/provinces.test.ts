import { describe, it, expect } from "vitest";
import { provinces, findProvinces, nearestProvince } from "@/data/provinces";

describe("provinces", () => {
  it("lists all 81 provinces with unique names and coordinates inside Turkey", () => {
    expect(provinces).toHaveLength(81);
    expect(new Set(provinces.map((p) => p.name)).size).toBe(81);
    for (const p of provinces) {
      expect(p.lat).toBeGreaterThan(35.5);
      expect(p.lat).toBeLessThan(42.2);
      expect(p.lon).toBeGreaterThan(25.5);
      expect(p.lon).toBeLessThan(45);
    }
  });
});

describe("findProvinces", () => {
  it("matches dotted capital İ from lowercase input", () => {
    expect(findProvinces("istanbul")[0].name).toBe("İstanbul");
  });

  it("matches dotless ı from uppercase ASCII input", () => {
    expect(findProvinces("ISPARTA")[0].name).toBe("Isparta");
  });

  it("matches without Turkish characters", () => {
    expect(findProvinces("sanliurfa")[0].name).toBe("Şanlıurfa");
    expect(findProvinces("igdir")[0].name).toBe("Iğdır");
  });

  it("matches with Turkish characters typed in any case", () => {
    expect(findProvinces("ŞANLIURFA")[0].name).toBe("Şanlıurfa");
    expect(findProvinces("çanakkale")[0].name).toBe("Çanakkale");
  });

  it("ranks prefix matches before inner matches", () => {
    const names = findProvinces("ar").map((p) => p.name);
    expect(names.slice(0, 2)).toEqual(["Ardahan", "Artvin"]);
    expect(names).toContain("Bartın");
    expect(names).toContain("Ankara");
  });

  it("returns all provinces for a blank query and none for nonsense", () => {
    expect(findProvinces("   ")).toHaveLength(81);
    expect(findProvinces("xyzq")).toEqual([]);
  });
});

describe("nearestProvince", () => {
  it("picks the province closest to a coordinate", () => {
    expect(nearestProvince(39.9, 32.85).name).toBe("Ankara");
    expect(nearestProvince(38.42, 27.14).name).toBe("İzmir");
  });
});
