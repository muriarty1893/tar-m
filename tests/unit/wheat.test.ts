import { describe, it, expect } from "vitest";
import { growth, layoutField, pointerForce, stepStalk, type Stalk } from "@/lib/wheat";

const field = (width: number, seed = 7) => layoutField({ width, height: 600, horizon: 200, seed });

describe("layoutField", () => {
  it("is the same for the same seed, so server and browser agree", () => {
    expect(field(1200).map((s) => [s.x, s.y, s.h])).toEqual(field(1200).map((s) => [s.x, s.y, s.h]));
  });

  it("plants more stalks on a wider screen, back rows first", () => {
    const narrow = field(400);
    const wide = field(1600);
    expect(wide.length).toBeGreaterThan(narrow.length * 2);
    // Painter's order: whole back rows before front rows, top to bottom within a row.
    for (let i = 1; i < wide.length; i++) {
      expect(wide[i].layer).toBeGreaterThanOrEqual(wide[i - 1].layer);
      if (wide[i].layer === wide[i - 1].layer) expect(wide[i].y).toBeGreaterThanOrEqual(wide[i - 1].y);
    }
  });

  it("keeps every stalk between the horizon and just below the bottom edge, and front stalks taller", () => {
    const f = field(1200);
    for (const s of f) {
      expect(s.y).toBeGreaterThan(200);
      expect(s.y).toBeLessThanOrEqual(600 + 60);
    }
    const back = f.filter((s) => s.depth === 0);
    const front = f.filter((s) => s.depth === 1);
    const avg = (a: Stalk[]) => a.reduce((n, s) => n + s.h, 0) / a.length;
    expect(avg(front)).toBeGreaterThan(avg(back) * 2.5);
  });
});

describe("stepStalk", () => {
  const stalk = (): Stalk => ({ ...field(800)[0], angle: 0, vel: 0 });

  it("springs toward the wind's target bend and settles there", () => {
    const s = stalk();
    for (let i = 0; i < 240; i++) stepStalk(s, 0.3, 0, 1 / 60);
    expect(s.angle).toBeCloseTo(0.3, 2);
  });

  it("a push bends it the push's way, then it swings back", () => {
    const s = stalk();
    stepStalk(s, 0, 40, 1 / 60);
    for (let i = 0; i < 8; i++) stepStalk(s, 0, 0, 1 / 60);
    expect(s.angle).toBeGreaterThan(0.05);
    for (let i = 0; i < 400; i++) stepStalk(s, 0, 0, 1 / 60);
    expect(Math.abs(s.angle)).toBeLessThan(0.01);
  });

  it("never folds flat, however hard it is pushed", () => {
    const s = stalk();
    for (let i = 0; i < 30; i++) stepStalk(s, 0, 5000, 1 / 60);
    expect(Math.abs(s.angle)).toBeLessThanOrEqual(0.85);
  });
});

describe("pointerForce", () => {
  const at = (x: number): Stalk => ({ x, y: 500, h: 200, depth: 1, layer: 6, angle: 0, vel: 0, delay: 0, phase: 0 });
  const still = { x: 500, y: 380, vx: 0, vy: 0 };

  it("bends stalks away from the pointer: right of it to the right, left of it to the left", () => {
    expect(pointerForce(at(530), still, 120)).toBeGreaterThan(0);
    expect(pointerForce(at(470), still, 120)).toBeLessThan(0);
  });

  it("does nothing out of reach", () => {
    expect(pointerForce(at(900), still, 120)).toBe(0);
  });

  it("a sweep drags the stalks along with it", () => {
    const sweep = { ...still, vx: 1500 };
    expect(pointerForce(at(500), sweep, 120)).toBeGreaterThan(pointerForce(at(500), still, 120));
  });
});

describe("growth", () => {
  it("waits for its delay, then rises to full height", () => {
    expect(growth(0.2, 0.5)).toBe(0);
    expect(growth(0.5 + 0.3, 0.5)).toBeGreaterThan(0);
    expect(growth(10, 0.5)).toBe(1);
  });
});
