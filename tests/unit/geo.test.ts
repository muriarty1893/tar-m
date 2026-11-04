import { describe, expect, test } from "vitest";
import { areaM2, donumOf, parseBoundary, type LatLng } from "@/lib/geo";

// A square about 100 m a side near Konya: 0.0009° of latitude ≈ 100 m; longitude scaled by cos(38°).
const LAT = 37.87;
const dLat = 100 / 111_320;
const dLng = 100 / (111_320 * Math.cos((LAT * Math.PI) / 180));
const square: LatLng[] = [
  [LAT, 32.48],
  [LAT, 32.48 + dLng],
  [LAT + dLat, 32.48 + dLng],
  [LAT + dLat, 32.48],
];

describe("field outlines", () => {
  test("a 100 m square is about 10 dönüm", () => {
    expect(areaM2(square)).toBeGreaterThan(9_900);
    expect(areaM2(square)).toBeLessThan(10_100);
    expect(donumOf(areaM2(square))).toBeCloseTo(10, 0);
  });

  test("the corners' order (clockwise or not) doesn't change the area", () => {
    expect(areaM2([...square].reverse())).toBeCloseTo(areaM2(square), 3);
  });

  test("fewer than three corners, or a flat line, has no area", () => {
    expect(areaM2(square.slice(0, 2))).toBe(0);
    expect(parseBoundary(square.slice(0, 2))).toBeNull();
    expect(parseBoundary([square[0], square[1], square[0]])).toBeNull();
  });

  test("only plain [lat, lng] numbers on the globe are kept, rounded", () => {
    expect(parseBoundary(square)).toHaveLength(4);
    expect(parseBoundary([[37.123456789, 32.5], ...square.slice(1)])?.[0]).toEqual([37.1234568, 32.5]);
    expect(parseBoundary("[[1,2]]")).toBeNull();
    expect(parseBoundary([[91, 0], ...square.slice(1)])).toBeNull();
    expect(parseBoundary([["37", 32], ...square.slice(1)])).toBeNull();
    expect(parseBoundary([[NaN, 32], ...square.slice(1)])).toBeNull();
    expect(parseBoundary(Array.from({ length: 61 }, (_, i) => [LAT + i * 1e-4, 32 + (i % 2) * 1e-4]))).toBeNull();
  });
});
