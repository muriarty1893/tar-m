"use client";

// Adapted from Aceternity UI "Glowing Effect" (ui.aceternity.com/components/glowing-effect).
// Changes: a tiny requestAnimationFrame tween instead of the motion library (keeps it out of
// the page bundle), our green/gold palette, mouse pointers only, and off for reduced motion.

import { memo, useEffect, useRef, type CSSProperties } from "react";
import { cn } from "cn";

type Props = {
  /** Degrees of the glowing arc on each side of the pointer direction. */
  spread?: number;
  /** Extra px around the card in which the pointer still lights it. */
  proximity?: number;
  /** Fraction of the card's centre where the glow switches off. */
  inactiveZone?: number;
  borderWidth?: number;
  className?: string;
};

export const GlowingEffect = memo(function GlowingEffect({ spread = 40, proximity = 64, inactiveZone = 0.01, borderWidth = 2, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let frame = 0;
    let tween = 0;
    let angle = 0;
    let last = { x: 0, y: 0 };

    const update = (p?: { x: number; y: number }) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        if (p) last = p;
        const { left, top, width, height } = el.getBoundingClientRect();
        const cx = left + width / 2;
        const cy = top + height / 2;
        const inactive = 0.5 * Math.min(width, height) * inactiveZone;
        const inside =
          last.x > left - proximity && last.x < left + width + proximity && last.y > top - proximity && last.y < top + height + proximity;
        const active = inside && Math.hypot(last.x - cx, last.y - cy) >= inactive;
        el.style.setProperty("--active", active ? "1" : "0");
        if (!active) return;

        const target = (180 * Math.atan2(last.y - cy, last.x - cx)) / Math.PI + 90;
        const from = angle;
        const to = from + ((((target - from + 180) % 360) + 360) % 360) - 180;
        const start = performance.now();
        cancelAnimationFrame(tween);
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / 900);
          angle = from + (to - from) * (1 - (1 - t) ** 4);
          el.style.setProperty("--start", String(angle));
          if (t < 1) tween = requestAnimationFrame(step);
        };
        tween = requestAnimationFrame(step);
      });
    };

    const onMove = (e: PointerEvent) => e.pointerType === "mouse" && update({ x: e.clientX, y: e.clientY });
    const onScroll = () => update();
    document.body.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(tween);
      document.body.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [inactiveZone, proximity]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ "--spread": spread, "--start": "0", "--active": "0", "--glow-border": `${borderWidth}px` } as CSSProperties}
      className={cn("glowing-effect pointer-events-none absolute inset-0 rounded-[inherit]", className)}
    />
  );
});
