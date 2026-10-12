import { describe, it, expect } from "vitest";
import { shouldLoad3D, introProgress, quadMatrix3d, SCREEN } from "@/lib/phone-stage";

describe("SCREEN", () => {
  it("keeps the phone's 19.5:9-ish screen aspect", () => {
    expect(SCREEN.height / SCREEN.width).toBeCloseTo(0.1449 / 0.0668, 1);
  });
});

describe("shouldLoad3D", () => {
  const gpu = "ANGLE (Intel, Mesa Intel(R) HD Graphics 620 (KBL GT2), OpenGL ES 3.2)";
  it("loads with hardware WebGL and no data-saver request", () => {
    expect(shouldLoad3D({ renderer: gpu, saveData: false })).toBe(true);
  });
  it("skips without WebGL or when the visitor asked to save data", () => {
    expect(shouldLoad3D({ renderer: null, saveData: false })).toBe(false);
    expect(shouldLoad3D({ renderer: gpu, saveData: true })).toBe(false);
  });
  it("skips software renderers, where the scene would starve the page", () => {
    for (const r of [
      "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
      "llvmpipe (LLVM 17.0.6, 256 bits)",
      "Mesa softpipe",
      "Microsoft Basic Render Driver",
    ]) {
      expect(shouldLoad3D({ renderer: r, saveData: false }), r).toBe(false);
    }
  });
});

describe("introProgress", () => {
  it("eases from 0 to 1 over the intro and clamps after", () => {
    expect(introProgress(0, 1.6)).toBe(0);
    expect(introProgress(0.8, 1.6)).toBeGreaterThan(0.5); // ease-out: past halfway at half time
    expect(introProgress(1.6, 1.6)).toBe(1);
    expect(introProgress(5, 1.6)).toBe(1);
  });
});

describe("quadMatrix3d", () => {
  // Apply a CSS matrix3d (column-major) to a 2D point, with perspective divide.
  const apply = (m: number[], x: number, y: number) => {
    const w = m[3] * x + m[7] * y + m[15];
    return [(m[0] * x + m[4] * y + m[12]) / w, (m[1] * x + m[5] * y + m[13]) / w];
  };

  it("maps the element's corners onto an arbitrary perspective quad", () => {
    const quad: Parameters<typeof quadMatrix3d>[2] = [[120, 80], [330, 110], [300, 620], [100, 590]];
    const m = quadMatrix3d(340, 738, quad);
    expect(m).toHaveLength(16);
    const corners = [[0, 0], [340, 0], [340, 738], [0, 738]];
    corners.forEach(([x, y], i) => {
      const [px, py] = apply(m, x, y);
      expect(px).toBeCloseTo(quad[i][0], 6);
      expect(py).toBeCloseTo(quad[i][1], 6);
    });
  });

  it("reduces to a plain scale + translate for an axis-aligned rectangle", () => {
    const m = quadMatrix3d(100, 200, [[10, 20], [60, 20], [60, 120], [10, 120]]);
    expect(apply(m, 50, 100)).toEqual([35, 70]);
    expect(m[3]).toBeCloseTo(0, 12);
    expect(m[7]).toBeCloseTo(0, 12);
  });
});
