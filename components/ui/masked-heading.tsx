"use client";

// Adapted from React Bits "MaskedHeading" (reactbits.dev, MIT): a heading whose letters are
// windows onto a photo that drifts and follows the pointer, revealed when it scrolls into view.
// Changes: TypeScript; next/image; GSAP is loaded only when the reveal plays; the idle drift
// runs only while on screen; reduced motion gets a still, fully revealed heading; and until the
// script has placed the letters (or without JS) the words show as ordinary text (`data-ready`).
// Styles: app/globals.css ("masked-heading").

import { useCallback, useEffect, useId, useMemo, useRef, type CSSProperties } from "react";
import Image from "next/image";
import type { gsap as Gsap } from "gsap";
import { cn } from "cn";

let gsapPromise: Promise<typeof Gsap> | undefined;
const loadGsap = () => (gsapPromise ??= import("gsap").then((m) => m.gsap));

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export type MaskedHeadingProps = {
  text: string;
  /** The heading level, so it keeps the right semantics. */
  tag?: "h1" | "h2" | "h3";
  src: string;
  /** How far the photo is zoomed past the heading; the overscan is what parallax travels into. */
  fillScale?: number;
  /** How far the photo slides under the letters as the pointer moves, in px. */
  parallax?: number;
  /** Amplitude of the slow idle motion, in px. */
  drift?: number;
  brightness?: number;
  saturation?: number;
  reveal?: "rise" | "wipe" | "fade" | "none";
  duration?: number;
  stagger?: number;
  align?: "left" | "center" | "right";
  weight?: number;
  tracking?: number;
  lineHeight?: number;
  /** Type size as a fraction of the container width. */
  textScale?: number;
  className?: string;
  style?: CSSProperties;
};

export function MaskedHeading({
  text,
  tag: Tag = "h2",
  src,
  fillScale = 1.25,
  parallax = 26,
  drift = 18,
  brightness = 1,
  saturation = 1,
  reveal = "rise",
  duration = 1.1,
  stagger = 0.09,
  align = "center",
  weight = 700,
  tracking = -0.03,
  lineHeight = 1.06,
  textScale = 0.115,
  className,
  style,
}: MaskedHeadingProps) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const revealRef = useRef<HTMLSpanElement>(null);
  const mediaRef = useRef<HTMLSpanElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const baseRefs = useRef<(HTMLElement | null)[]>([]);
  const glyphRefs = useRef<(SVGTextElement | null)[]>([]);
  const offsetRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const settingsRef = useRef({ fillScale, parallax, drift, brightness, saturation, textScale });

  const clipId = `mh-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  useEffect(() => {
    settingsRef.current = { fillScale, parallax, drift, brightness, saturation, textScale };
  });

  const place = useCallback(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    if (!root || !media) return;
    const s = settingsRef.current;
    const off = offsetRef.current;
    const maxX = Math.max(0, ((s.fillScale - 1) / 2) * root.clientWidth);
    const maxY = Math.max(0, ((s.fillScale - 1) / 2) * root.clientHeight);
    media.style.transform = `translate3d(${clamp(off.x, -maxX, maxX).toFixed(2)}px, ${clamp(off.y, -maxY, maxY).toFixed(2)}px, 0) scale(${s.fillScale})`;
    media.style.filter = `brightness(${s.brightness}) saturate(${s.saturation})`;
  }, []);

  // Size the type to the container and copy each word's position onto its clip-path glyph.
  const sync = useCallback(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;
    root.style.fontSize = `${clamp(root.clientWidth * settingsRef.current.textScale, 20, 200).toFixed(1)}px`;
    const cs = window.getComputedStyle(measure);
    wordRefs.current.forEach((box, i) => {
      const base = baseRefs.current[i];
      const glyph = glyphRefs.current[i];
      if (!box || !base || !glyph) return;
      glyph.setAttribute("x", `${box.offsetLeft}`);
      glyph.setAttribute("y", `${base.offsetTop}`);
      Object.assign(glyph.style, {
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        fontStyle: cs.fontStyle,
        letterSpacing: cs.letterSpacing,
      });
    });
    place();
    root.dataset.ready = "";
  }, [place]);

  // Layout, pointer parallax and the idle drift (only while on screen and motion is allowed).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(root);
    document.fonts?.ready.then(sync).catch(() => {});

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let clock = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      clock += dt;
      const s = settingsRef.current;
      const off = offsetRef.current;
      const ease = 1 - Math.exp(-dt / 0.18);
      off.x += (off.tx + Math.sin(clock * 0.21) * s.drift - off.x) * ease;
      off.y += (off.ty + Math.cos(clock * 0.17) * s.drift * 0.6 - off.y) * ease;
      place();
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      if (e.isIntersecting && !still) raf = requestAnimationFrame(frame);
    });
    io.observe(root);

    const onMove = (e: PointerEvent) => {
      const s = settingsRef.current;
      if (still || s.parallax <= 0) return;
      const r = root.getBoundingClientRect();
      offsetRef.current.tx = clamp(((e.clientX - r.left) / (r.width || 1)) * 2 - 1, -1, 1) * -s.parallax;
      offsetRef.current.ty = clamp(((e.clientY - r.top) / (r.height || 1)) * 2 - 1, -1, 1) * -s.parallax;
    };
    const onLeave = () => {
      offsetRef.current.tx = 0;
      offsetRef.current.ty = 0;
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [place, sync]);

  useEffect(() => {
    sync();
  }, [sync, words, align, weight, tracking, lineHeight, textScale]);

  // Entrance, the first time the heading comes into view.
  useEffect(() => {
    const root = rootRef.current;
    const layer = revealRef.current;
    if (!root || !layer) return;
    const glyphs = glyphRefs.current.filter((g): g is SVGTextElement => !!g);
    if (!glyphs.length || reveal === "none" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rise = () => (parseFloat(window.getComputedStyle(root).fontSize) || 48) * 1.15;
    // Hide until the reveal plays (plain CSS, so nothing flashes before GSAP arrives).
    if (reveal === "rise") glyphs.forEach((g) => g.setAttribute("transform", `translate(0 ${rise()})`));
    else if (reveal === "wipe") layer.style.clipPath = "inset(0% 100% 0% 0%)";
    else layer.style.opacity = "0";

    let tween: { kill: () => void } | undefined;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        loadGsap().then((gsap) => {
          if (cancelled) return;
          if (reveal === "rise") {
            tween = gsap.fromTo(glyphs, { y: rise() }, { y: 0, duration, stagger, ease: "power4.out" });
          } else if (reveal === "wipe") {
            const st = { p: 100 };
            tween = gsap.to(st, { p: 0, duration, ease: "power3.inOut", onUpdate: () => void (layer.style.clipPath = `inset(0% ${st.p}% 0% 0%)`) });
          } else {
            tween = gsap.fromTo(layer, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration, ease: "power3.out" });
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(root);
    return () => {
      cancelled = true;
      io.disconnect();
      tween?.kill();
    };
  }, [reveal, duration, stagger, words]);

  return (
    <Tag
      ref={rootRef}
      className={cn("masked-heading", className)}
      style={{ textAlign: align, fontWeight: weight, letterSpacing: `${tracking}em`, lineHeight, ...style }}
    >
      <span ref={measureRef} className="masked-heading__measure">
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            ref={(el) => {
              wordRefs.current[i] = el;
            }}
            className="masked-heading__word"
          >
            {word}
            <i
              ref={(el) => {
                baseRefs.current[i] = el;
              }}
              className="masked-heading__baseline"
            />
          </span>
        ))}
      </span>

      <svg className="masked-heading__defs" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {words.map((word, i) => (
              <text
                key={`${word}-${i}`}
                ref={(el) => {
                  glyphRefs.current[i] = el;
                }}
              >
                {word}
              </text>
            ))}
          </clipPath>
        </defs>
      </svg>

      <span ref={revealRef} aria-hidden="true" className="masked-heading__reveal">
        <span className="masked-heading__clip" style={{ clipPath: `url(#${clipId})` }}>
          <span ref={mediaRef} className="masked-heading__media">
            <Image src={src} alt="" fill sizes="(min-width: 1024px) 900px, 100vw" className="masked-heading__source" draggable={false} />
          </span>
        </span>
      </span>
    </Tag>
  );
}

export default MaskedHeading;
