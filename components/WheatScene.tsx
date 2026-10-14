"use client";

import { useEffect, useRef } from "react";
import { growth, layoutField, LAYERS, pointerForce, rng, stepStalk, wind, type Pointer, type Stalk } from "@/lib/wheat";

/*
 * The footer's background scene: a golden-hour wheat field (a dusk field with fireflies in dark
 * mode) drawn on one canvas behind the footer content. It grows in with a sweeping wave the first
 * time the footer comes into view; afterwards the stalks sway in the breeze, bend away from the
 * pointer or finger like real stems (lib/wheat.ts springs), and a click or tap sends a gust that
 * throws chaff. It only animates while on screen; with reduced motion it is drawn once, still.
 *
 * The field starts at the footer's `[data-field-start]` marker, so the content above stays on sky.
 */

type Palette = {
  hills: string[];
  ground: [string, string];
  head: [string, string];
  stem: [string, string];
  glow: string;
  orb: string;
  mote: string;
  night: boolean;
};

const LIGHT: Palette = {
  hills: ["#dfe2c6", "#c6d2a8", "#a9bf8b"],
  ground: ["#e8d398", "#b58425"],
  head: ["#ecdcab", "#c8891b"],
  stem: ["#dfd2a6", "#8d6a1b"],
  glow: "255 196 92",
  orb: "#fff1c9",
  mote: "255 236 170",
  night: false,
};

const DARK: Palette = {
  hills: ["#1b4038", "#163530", "#112b24"],
  ground: ["#2a3a24", "#3e3215"],
  head: ["#3f4c36", "#b8902f"],
  stem: ["#34412d", "#7a5f22"],
  glow: "190 230 255",
  orb: "#eef6ff",
  mote: "217 249 157",
  night: true,
};

const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(" ")})`;
};

/** A wheat ear pointing up, its base at the bottom centre of the returned sprite. */
function headSprite(len: number, color: string, dpr: number) {
  const w = Math.ceil(len * 0.75);
  const h = Math.ceil(len * 1.45);
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * dpr);
  c.height = Math.ceil(h * dpr);
  const g = c.getContext("2d")!;
  g.scale(dpr, dpr);
  g.translate(w / 2, h);
  g.fillStyle = color;
  g.strokeStyle = color;
  g.lineCap = "round";
  const n = 8;
  const kw = len * 0.13;
  const kh = len * 0.2;
  for (let i = 0; i < n; i++) {
    const y = -len * 0.12 - (i * len * 0.8) / n;
    const shrink = 1 - (i / n) * 0.35;
    for (const side of [-1, 1]) {
      g.save();
      g.translate(side * kw * 0.62, y);
      g.rotate(side * 0.42);
      g.beginPath();
      g.ellipse(0, 0, kw * 0.55 * shrink, kh * 0.55 * shrink, 0, 0, Math.PI * 2);
      g.fill();
      // Awn: the long whisker on each grain.
      if (i > 1) {
        g.globalAlpha = 0.55;
        g.lineWidth = Math.max(0.5, len * 0.012);
        g.beginPath();
        g.moveTo(0, -kh * 0.4);
        g.lineTo(side * len * 0.12, -kh * 0.4 - len * 0.32);
        g.stroke();
        g.globalAlpha = 1;
      }
      g.restore();
    }
  }
  g.beginPath();
  g.ellipse(0, -len * 0.96, kw * 0.45, kh * 0.5, 0, 0, Math.PI * 2);
  g.fill();
  // Low sun catching the ear's edge.
  g.globalCompositeOperation = "source-atop";
  const rim = g.createLinearGradient(-w / 2, 0, w / 2, 0);
  rim.addColorStop(0, "rgb(0 0 0 / 0.12)");
  rim.addColorStop(0.7, "rgb(255 255 255 / 0)");
  rim.addColorStop(1, "rgb(255 240 200 / 0.35)");
  g.fillStyle = rim;
  g.fillRect(-w / 2, -h, w, h);
  return { img: c, w, h };
}

/** Sky glow, sun or moon, stars, rolling hills and the field's ground: redrawn only on resize. */
function backdrop(W: number, H: number, horizon: number, pal: Palette, dpr: number) {
  const c = document.createElement("canvas");
  c.width = Math.ceil(W * dpr);
  c.height = Math.ceil(H * dpr);
  const g = c.getContext("2d")!;
  g.scale(dpr, dpr);
  const r = rng(3);
  const sunX = W * 0.8;
  const sunY = pal.night ? horizon - Math.min(170, horizon * 0.45) : horizon - 18;

  if (pal.night) {
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `rgb(255 255 255 / ${0.15 + r() * 0.45})`;
      const s = r() < 0.15 ? 1.6 : 1;
      g.fillRect(r() * W, r() * horizon * 0.95, s, s);
    }
  }
  const glow = g.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(W, H) * 0.45);
  glow.addColorStop(0, `rgb(${pal.glow} / ${pal.night ? 0.22 : 0.55})`);
  glow.addColorStop(1, `rgb(${pal.glow} / 0)`);
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);
  g.fillStyle = pal.orb;
  g.shadowColor = `rgb(${pal.glow} / 0.9)`;
  g.shadowBlur = 40;
  g.beginPath();
  g.arc(sunX, sunY, pal.night ? 20 : 44, 0, Math.PI * 2);
  g.fill();
  g.shadowBlur = 0;

  // Three ranges of hills, hazier with distance.
  pal.hills.forEach((color, i) => {
    const amp = 18 + i * 10;
    const base = horizon + 4 + i * 4;
    const f1 = 0.0025 + i * 0.0012;
    const f2 = 0.007 + i * 0.002;
    const o = r() * 100;
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) {
      g.lineTo(x, base - amp * (0.6 + 0.4 * Math.sin(x * f1 + o)) - amp * 0.35 * Math.sin(x * f2 + o * 2));
    }
    g.lineTo(W, H);
    g.fill();
  });

  // The field's ground, feathered into the hills instead of starting on a hard line.
  const top = horizon - 6;
  const ground = g.createLinearGradient(0, top, 0, H);
  const fade = Math.min(0.12, 34 / Math.max(H - top, 1));
  ground.addColorStop(0, `${pal.ground[0]}00`);
  ground.addColorStop(fade, pal.ground[0]);
  ground.addColorStop(1, pal.ground[1]);
  g.fillStyle = ground;
  g.fillRect(0, top, W, H - top);
  return c;
}

type Mote = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; chaff: boolean; spin: number };
type Bird = { x: number; y: number; v: number; flap: number };

export function WheatScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const darkQ = window.matchMedia("(prefers-color-scheme: dark)");
    let W = 0;
    let H = 0;
    let horizon = 0;
    let dpr = 1;
    let pal = LIGHT;
    let stalks: Stalk[] = [];
    let sprites: ReturnType<typeof headSprite>[] = [];
    let bg: HTMLCanvasElement | null = null;
    let state: "waiting" | "growing" | "idle" | "still" = "waiting";
    let started = 0; // ms when the grow-in began
    let onScreen = false;
    let frame = 0;
    let last = 0;
    let stirred = 0;
    let tick = 0;
    const touched = new Set<Stalk>();
    const pointer: Pointer & { active: boolean; at: number } = { x: -1e4, y: -1e4, vx: 0, vy: 0, active: false, at: 0 };
    const motes: Mote[] = [];
    const birds: Bird[] = [];
    let nextFlock = 4;
    const r = rng(11);

    const setState = (s: typeof state) => {
      state = s;
      canvas.dataset.state = s;
    };

    function measure() {
      W = host!.clientWidth;
      H = host!.clientHeight;
      const marker = host!.querySelector<HTMLElement>("[data-field-start]");
      horizon = marker ? marker.offsetTop + 34 : H * 0.5;
      dpr = Math.min(window.devicePixelRatio || 1, W < 640 ? 1.5 : 2);
      canvas!.width = Math.ceil(W * dpr);
      canvas!.height = Math.ceil(H * dpr);
      pal = darkQ.matches ? DARK : LIGHT;
      const grownAlready = state !== "waiting";
      stalks = layoutField({ width: W, height: H, horizon, seed: 7 });
      if (grownAlready) for (const s of stalks) s.delay = -10;
      canvas!.dataset.stalks = String(stalks.length);
      sprites = Array.from({ length: LAYERS }, (_, i) => {
        const d = i / (LAYERS - 1);
        const len = 200 * (0.28 + d * d * 0.95) * 0.27;
        return headSprite(len, mix(pal.head[0], pal.head[1], d), dpr);
      });
      bg = backdrop(W, H, horizon, pal, dpr);
      // Ambient motes: pollen drifting in the sunlight, or fireflies at dusk.
      motes.length = 0;
      for (let i = 0; i < (W < 640 ? 14 : 28); i++) {
        motes.push({ x: r() * W, y: horizon - 40 + r() * (H - horizon), vx: 0, vy: 0, life: r() * 10, max: Infinity, size: 1 + r() * 1.6, chaff: false, spin: r() * 6 });
      }
    }

    function draw(t: number, grownT: number) {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);
      if (bg) ctx!.drawImage(bg, 0, 0, W, H);

      // Birds crossing the evening sky now and then (day only).
      if (!pal.night) {
        ctx!.strokeStyle = "rgb(60 50 30 / 0.55)";
        ctx!.lineWidth = 1.4;
        ctx!.lineCap = "round";
        for (const b of birds) {
          const wing = Math.sin(b.flap) * 4;
          ctx!.beginPath();
          ctx!.moveTo(b.x - 6, b.y - wing);
          ctx!.quadraticCurveTo(b.x - 2, b.y - 2, b.x, b.y);
          ctx!.quadraticCurveTo(b.x + 2, b.y - 2, b.x + 6, b.y - wing);
          ctx!.stroke();
        }
      }

      // Stalks, back row to front: stems stroked in one path per row, ears stamped from sprites.
      let i = 0;
      for (let layer = 0; layer < LAYERS; layer++) {
        const d = layer / (LAYERS - 1);
        const from = i;
        ctx!.beginPath();
        while (i < stalks.length && stalks[i].layer === layer) {
          const s = stalks[i++];
          const g = growth(grownT, s.delay);
          if (g <= 0) continue;
          const h = s.h * g;
          const a = s.angle;
          ctx!.moveTo(s.x, s.y);
          ctx!.quadraticCurveTo(s.x + Math.sin(a) * h * 0.2, s.y - h * 0.55, s.x + Math.sin(a) * h, s.y - Math.cos(a) * h);
        }
        ctx!.strokeStyle = mix(pal.stem[0], pal.stem[1], d);
        ctx!.lineWidth = 0.7 + d * 1.5;
        ctx!.lineCap = "round";
        ctx!.stroke();

        const sp = sprites[layer];
        for (let j = from; j < i; j++) {
          const s = stalks[j];
          const g = growth(grownT, s.delay);
          if (g <= 0.35) continue;
          const h = s.h * g;
          const k = Math.min(1, (g - 0.35) / 0.5);
          ctx!.setTransform(dpr, 0, 0, dpr, (s.x + Math.sin(s.angle) * h) * dpr, (s.y - Math.cos(s.angle) * h) * dpr);
          ctx!.rotate(s.angle * 1.15);
          ctx!.scale(k, k);
          ctx!.drawImage(sp.img, -sp.w / 2, -sp.h + 2, sp.w, sp.h);
        }
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // Motes and chaff.
      for (const m of motes) {
        if (m.chaff) {
          ctx!.save();
          ctx!.translate(m.x, m.y);
          ctx!.rotate(m.spin);
          ctx!.globalAlpha = Math.min(1, m.life / 0.4);
          ctx!.fillStyle = pal.night ? "#d8b45a" : "#e7b443";
          ctx!.beginPath();
          ctx!.ellipse(0, 0, m.size * 1.6, m.size * 0.7, 0, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.restore();
        } else {
          const blink = pal.night ? 0.25 + 0.75 * Math.max(0, Math.sin(t * 1.3 + m.spin * 3)) : 0.55 + 0.3 * Math.sin(t * 0.8 + m.spin);
          ctx!.fillStyle = `rgb(${pal.mote} / ${blink * (pal.night ? 0.95 : 0.6)})`;
          if (pal.night) {
            ctx!.shadowColor = `rgb(${pal.mote} / 0.9)`;
            ctx!.shadowBlur = 10;
          }
          ctx!.beginPath();
          ctx!.arc(m.x, m.y, m.size, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.shadowBlur = 0;
        }
      }
      ctx!.globalAlpha = 1;
    }

    function step(dt: number, t: number) {
      const live = pointer.active && performance.now() - pointer.at < 1500;
      for (const s of stalks) {
        const f = live ? pointerForce(s, pointer, 120) : 0;
        if (f !== 0 && !touched.has(s)) {
          touched.add(s);
          stirred++;
        }
        stepStalk(s, wind(s.x, t, s.depth, s.phase), f, dt);
        // A fast sweep shakes chaff off the ears it hits.
        if (f !== 0 && Math.abs(pointer.vx) > 900 && s.depth > 0.5 && r() < 0.02 && motes.length < 160) {
          motes.push({ x: s.x + Math.sin(s.angle) * s.h, y: s.y - s.h, vx: pointer.vx * 0.08 * r(), vy: -40 - r() * 60, life: 1.6, max: 1.6, size: 1.2 + r(), chaff: true, spin: r() * 6 });
        }
      }
      pointer.vx *= 0.86;
      pointer.vy *= 0.86;

      for (let k = motes.length - 1; k >= 0; k--) {
        const m = motes[k];
        if (m.chaff) {
          m.vy += 70 * dt;
          m.vx *= 0.985;
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          m.spin += dt * 6;
          m.life -= dt;
          if (m.life <= 0) motes.splice(k, 1);
        } else {
          m.life += dt;
          m.x += (Math.sin(m.life * 0.5 + m.spin) * 9 + 6) * dt;
          m.y += Math.cos(m.life * 0.7 + m.spin) * 7 * dt;
          if (m.x > W + 10) m.x = -10;
        }
      }

      if (!pal.night) {
        nextFlock -= dt;
        if (nextFlock <= 0 && birds.length === 0) {
          const y = horizon - 50 - r() * 70;
          for (let b = 0; b < 3 + Math.floor(r() * 3); b++) birds.push({ x: -30 - b * 22 - r() * 10, y: y + (b % 2) * 10 + r() * 6, v: 55 + r() * 10, flap: r() * 6 });
          nextFlock = 14 + r() * 10;
        }
        for (let b = birds.length - 1; b >= 0; b--) {
          birds[b].x += birds[b].v * dt;
          birds[b].flap += dt * 9;
          if (birds[b].x > W + 40) birds.splice(b, 1);
        }
      }
      if (++tick % 15 === 0) canvas!.dataset.stirred = String(stirred);
    }

    function loop(now: number) {
      frame = 0;
      if (!onScreen || reducedQ.matches || document.hidden) return;
      const dt = Math.min((now - (last || now)) / 1000, 1 / 30);
      last = now;
      const t = now / 1000;
      const grownT = (now - started) / 1000;
      if (state === "growing" && grownT > 3.2) setState("idle");
      step(dt, t);
      draw(t, grownT);
      frame = requestAnimationFrame(loop);
    }

    const run = () => {
      if (!frame && onScreen && !reducedQ.matches && state !== "waiting") {
        last = 0;
        frame = requestAnimationFrame(loop);
      }
    };

    function still() {
      // Reduced motion: one fully grown frame, no wind, no loop.
      for (const s of stalks) {
        s.delay = -10;
        s.angle = wind(s.x, 0, s.depth, s.phase) * 0.6;
        s.vel = 0;
      }
      draw(0, 10);
      setState("still");
    }

    function start() {
      measure();
      if (reducedQ.matches) still();
      else draw(0, 0);
    }

    canvas.dataset.stirred = "0";
    setState("waiting");
    start();

    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        if (onScreen && state === "waiting" && !reducedQ.matches) {
          started = performance.now();
          setState("growing");
        }
        run();
      },
      { threshold: 0.15 },
    );
    io.observe(host);

    let resizeFrame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (host.clientWidth === W && host.clientHeight === H) return;
        measure();
        if (state === "still") still();
        else if (!frame) draw(performance.now() / 1000, state === "waiting" ? 0 : 10);
      });
    });
    ro.observe(host);

    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      const now = performance.now();
      const dt = Math.max((now - pointer.at) / 1000, 1 / 120);
      if (pointer.active && dt < 0.2) {
        pointer.vx = pointer.vx * 0.5 + ((x - pointer.x) / dt) * 0.5;
        pointer.vy = pointer.vy * 0.5 + ((y - pointer.y) / dt) * 0.5;
      }
      Object.assign(pointer, { x, y, active: true, at: now });
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onDown = (e: PointerEvent) => {
      if (reducedQ.matches || state === "waiting") return;
      onMove(e);
      // A gust from the tap: nearby stalks are flung away and shed chaff.
      for (const s of stalks) {
        const dx = s.x - pointer.x;
        const dy = (s.y - s.h * 0.6 - pointer.y) * 0.8;
        const d = Math.hypot(dx, dy);
        if (d < 240) {
          s.vel += Math.sign(dx || 1) * (1 - d / 240) * 9 * (0.5 + s.depth);
          if (!touched.has(s)) {
            touched.add(s);
            stirred++;
          }
        }
      }
      for (let k = 0; k < 26 && motes.length < 180; k++) {
        const a = -Math.PI / 2 + (r() - 0.5) * 2.2;
        const v = 80 + r() * 160;
        motes.push({ x: pointer.x, y: pointer.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1.4 + r() * 0.8, max: 2, size: 1.2 + r() * 1.3, chaff: true, spin: r() * 6 });
      }
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointercancel", onLeave);

    const onScheme = () => {
      measure();
      if (state === "still") still();
      else if (!frame) draw(0, state === "waiting" ? 0 : 10);
    };
    const onMotion = () => {
      if (reducedQ.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        still();
      } else {
        setState(onScreen ? "idle" : "waiting");
        if (state === "waiting") draw(0, 0);
        run();
      }
    };
    const onVisible = () => run();
    darkQ.addEventListener("change", onScheme);
    reducedQ.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointercancel", onLeave);
      darkQ.removeEventListener("change", onScheme);
      reducedQ.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <canvas ref={ref} data-testid="wheat-scene" aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />;
}
