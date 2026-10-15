"use client";

import { useEffect, useRef } from "react";

/**
 * A faint field of twinkling dots behind a section, drifting a little toward the pointer (after the
 * 21st.dev "pricing" component's starfield). Decorative: aria-hidden, no pointer events. It animates
 * only while on screen; with reduced motion it is drawn once and stays still.
 */
export function Starfield({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const color = getComputedStyle(canvas).color;
    let stars: { x: number; y: number; r: number; a: number; phase: number; depth: number }[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.1,
        a: 0.15 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        depth: 0.3 + Math.random() * 0.7,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      for (const s of stars) {
        ctx.globalAlpha = still ? s.a : s.a * (0.65 + 0.35 * Math.sin(t / 900 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x + pointer.x * s.depth, s.y + pointer.y * s.depth, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      draw(t);
      if (visible) raf = requestAnimationFrame(loop);
    };

    const onPointer = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.tx = ((e.clientX - box.left) / box.width - 0.5) * -16;
      pointer.ty = ((e.clientY - box.top) / box.height - 0.5) * -16;
    };

    resize();
    draw(0);
    const sizer = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    sizer.observe(canvas);
    const seen = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !still;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    seen.observe(canvas);
    if (!still) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      sizer.disconnect();
      seen.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 size-full text-foreground ${className}`} />;
}
