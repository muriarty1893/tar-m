"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react/dist/ssr";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

/*
 * The footer's wheat field: three rows of 2D wheat (pale and small at the back, rich gold and
 * tall in front) swaying in a slow breeze that rolls from left to right. Each clump is its own
 * element turning around its base, so only `transform` animates (compositor-friendly). It runs
 * only while on screen, never under reduced motion, and the visitor can pause it (WCAG 2.2.2).
 */

type Clump = { x: number; h: number; dur: number; delay: number; stalks: { dx: number; lean: number; s: number }[]; phone: boolean };
type Row = { name: "back" | "mid" | "front"; clumps: Clump[] };

// Deterministic "random" layout, identical on the server and in the browser (no hydration drift).
function rand(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function row(name: Row["name"], count: number, [minH, maxH]: [number, number], seed: number): Row {
  const r = rand(seed);
  const clumps = Array.from({ length: count }, (_, i): Clump => {
    const x = ((i + 0.15 + r() * 0.7) / count) * 104 - 2;
    return {
      x,
      h: Math.round(minH + r() * (maxH - minH)),
      dur: 4.6 + r() * 2,
      // A gust rolls left to right: clumps further right reach the peak of the sway later.
      delay: -((1 - x / 100) * 2.6 + r() * 0.5),
      stalks: Array.from({ length: 2 + Math.floor(r() * 2) }, () => ({ dx: 8 + r() * 30, lean: -7 + r() * 14, s: 0.82 + r() * 0.2 })),
      phone: i % 2 === 0, // on narrow screens every other clump is dropped
    };
  });
  return { name, clumps };
}

const ROWS: Row[] = [row("back", 42, [70, 96], 11), row("mid", 32, [104, 132], 23), row("front", 22, [138, 176], 37)];

export function WheatFooterBand({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const run = onScreen && !paused && !reduced;

  return (
    <div ref={ref} className="relative">
      <div data-testid="wheat-field" aria-hidden="true" data-run={run} className="wheat-field pointer-events-none relative h-44 sm:h-52">
        <svg width="0" height="0" className="absolute">
          <defs>
            <symbol id="wheat-stalk" viewBox="0 0 24 200" overflow="visible">
              <path d="M12 200C12 160 13 118 12 64" fill="none" stroke="var(--wheat-stem)" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M12 152C5 141 2 127 4 113c3 13 6 25 8 35z" fill="var(--wheat-stem)" />
              <path d="M12.4 128c6-9 9-19 8.4-30-2.6 11-5.4 19-8.6 26z" fill="var(--wheat-stem)" opacity="0.8" />
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const y = 60 - i * 7.2;
                return (
                  <g key={i}>
                    <ellipse cx="8.7" cy={y} rx="2.7" ry="5.2" transform={`rotate(-26 8.7 ${y})`} fill="var(--wheat-head)" />
                    <ellipse cx="15.3" cy={y} rx="2.7" ry="5.2" transform={`rotate(26 15.3 ${y})`} fill="var(--wheat-head)" />
                    {i > 1 && (
                      <path d={`M7 ${y - 4}L1.5 ${y - 19}M17 ${y - 4}L22.5 ${y - 19}`} stroke="var(--wheat-head)" strokeWidth="0.7" strokeLinecap="round" opacity="0.75" />
                    )}
                  </g>
                );
              })}
              <ellipse cx="12" cy="9" rx="2.5" ry="5.4" fill="var(--wheat-head)" />
              <path d="M12 4V-12" stroke="var(--wheat-head)" strokeWidth="0.7" strokeLinecap="round" opacity="0.75" />
            </symbol>
          </defs>
        </svg>

        {ROWS.map(({ name, clumps }) => (
          <div key={name} className={`wheat-row wheat-row--${name} absolute inset-x-0 bottom-0`}>
            {clumps.map((c, i) => (
              <div
                key={i}
                className={`wheat-clump absolute bottom-0 ${c.phone ? "" : "max-sm:hidden"}`}
                style={{ left: `${c.x}%`, height: c.h, width: c.h * 0.3, "--dur": `${c.dur.toFixed(2)}s`, "--delay": `${c.delay.toFixed(2)}s` } as CSSProperties}
              >
                <svg viewBox="0 0 60 200" preserveAspectRatio="xMidYMax meet" className="block size-full overflow-visible">
                  {c.stalks.map((st, j) => (
                    <use
                      key={j}
                      href="#wheat-stalk"
                      x={st.dx - 12}
                      width="24"
                      height="200"
                      transform={`rotate(${st.lean.toFixed(1)} ${st.dx.toFixed(1)} 200) translate(${st.dx.toFixed(1)} 200) scale(${st.s.toFixed(2)}) translate(${(-st.dx).toFixed(1)} -200)`}
                    />
                  ))}
                </svg>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* The soil the wheat grows from, carrying the copyright line. */}
      <div className="wheat-soil relative -mt-3 flex flex-col items-center justify-center gap-2 px-4 pb-5 pt-6 text-center text-sm sm:flex-row sm:gap-6">
        {children}
        {!reduced && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 font-medium text-white/85 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-white"
          >
            {paused ? <PlayIcon aria-hidden="true" weight="fill" className="size-4" /> : <PauseIcon aria-hidden="true" weight="fill" className="size-4" />}
            {paused ? "Buğday animasyonunu başlat" : "Buğday animasyonunu durdur"}
          </button>
        )}
      </div>
    </div>
  );
}
