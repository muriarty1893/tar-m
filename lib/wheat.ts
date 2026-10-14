/*
 * The footer's wheat field: layout and physics, kept free of drawing so it can be tested.
 * Each stalk is a damped spring (its tip's bend angle in radians) pulled toward the wind's
 * target and pushed by the pointer; it grows in when the field first comes into view.
 */

export type Stalk = {
  /** Base on the ground, in CSS px. */
  x: number;
  y: number;
  /** Full height in CSS px. */
  h: number;
  /** 0 = back row (far, hazy) … 1 = front row. */
  depth: number;
  layer: number;
  /** Seconds before it starts growing in. */
  delay: number;
  /** Personal offset in the wind. */
  phase: number;
  angle: number;
  vel: number;
};

export type Pointer = { x: number; y: number; vx: number; vy: number };

export const LAYERS = 7;
const MAX_BEND = 0.85;
const STIFFNESS = 26;
const DAMPING = 4.2;

/** Seeded PRNG (mulberry32): the same seed always plants the same field. */
export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rows from the horizon to just past the bottom edge, small and dense far away, big up front. Sorted back row to front row (painter's order). */
export function layoutField({ width, height, horizon, seed = 7 }: { width: number; height: number; horizon: number; seed?: number }): Stalk[] {
  const r = rng(seed);
  const stalks: Stalk[] = [];
  const ground = height - horizon;
  for (let layer = 0; layer < LAYERS; layer++) {
    const depth = layer / (LAYERS - 1);
    const scale = 0.28 + depth * depth * 0.95;
    const spacing = 15 + scale * 22;
    const count = Math.ceil(width / spacing) + 2;
    // Rows bunch up toward the horizon, as perspective does.
    const rowY = horizon + 6 + ground * (0.06 + 0.98 * depth ** 1.6);
    for (let j = 0; j < count; j++) {
      const x = (j - 1 + r() * 0.9) * spacing;
      stalks.push({
        x,
        y: rowY + (r() - 0.5) * spacing * 0.5,
        h: 200 * scale * (0.82 + r() * 0.3),
        depth,
        layer,
        // Back rows rise first, and the wave sweeps from left to right.
        delay: depth * 0.6 + (Math.max(0, x) / Math.max(width, 1)) * 0.8 + r() * 0.15,
        phase: r() * Math.PI * 2,
        angle: 0,
        vel: 0,
      });
    }
  }
  return stalks.sort((a, b) => a.layer - b.layer || a.y - b.y);
}

/** The breeze: slow swells rolling left to right with quicker gusts on top. Front rows move more. */
export function wind(x: number, t: number, depth: number, phase = 0): number {
  const swell = Math.sin(x * 0.0035 - t * 0.8) * 0.5 + 0.5;
  const gust = Math.sin(x * 0.012 - t * 1.9 + phase) * 0.35 + Math.sin(x * 0.027 - t * 3.1 + phase * 2) * 0.15;
  return (0.05 + swell * 0.1 + gust * 0.06) * (0.55 + depth * 0.6);
}

/** One spring step: `force` is an extra push (rad/s²), e.g. from the pointer. */
export function stepStalk(s: Stalk, target: number, force: number, dt: number) {
  const acc = -STIFFNESS * (s.angle - target) - DAMPING * s.vel + force;
  s.vel += acc * dt;
  s.angle += s.vel * dt;
  if (Math.abs(s.angle) > MAX_BEND) {
    s.angle = Math.sign(s.angle) * MAX_BEND;
    s.vel *= -0.25;
  }
}

/**
 * How hard the pointer pushes a stalk: away from the pointer if it is near the stalk's upper
 * half, plus a drag along the pointer's sweep. Zero out of reach. `reach` scales with the stalk.
 */
export function pointerForce(s: Stalk, p: Pointer, reach: number): number {
  const r = reach * (0.45 + s.depth * 0.7);
  const tipX = s.x + Math.sin(s.angle) * s.h * 0.6;
  const midY = s.y - s.h * 0.6;
  const dx = tipX - p.x;
  const dy = (midY - p.y) * 0.8;
  const d = Math.hypot(dx, dy);
  if (d >= r) return 0;
  const near = (1 - d / r) ** 2;
  const away = Math.sign(dx || 1) * 45;
  const drag = Math.max(-2500, Math.min(2500, p.vx)) * 0.07;
  return (away + drag) * near;
}

/** Grow-in progress 0 → 1 (with a little overshoot on the way, settling at exactly 1). */
export function growth(t: number, delay: number, duration = 1.3): number {
  const k = (t - delay) / duration;
  if (k <= 0) return 0;
  if (k >= 1) return 1;
  const c = 1.4;
  return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2;
}
