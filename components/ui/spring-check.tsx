"use client";

// Adapted from React Bits "SpringCheck" (reactbits.dev, MIT). Same spring and timing.
// Changes: TypeScript; the Hugeicons "Tick02" path is inlined (no icon package); the
// strike-through is drawn per line (a background wipe on the words), so labels that wrap
// onto two lines are struck line by line instead of by one bar across the middle; styles in
// app/globals.css ("spring-check").

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";

const VISUAL_DURATION = 0.2;
const RULE_END = 0.84;
const SWELL = 0.35;
const TICK_PATH = "M5 14L8.5 17.5L19 6.5"; // Hugeicons Tick02
const ORIGIN = { left: "left", center: "center", right: "right", none: "left" } as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const zetaOf = (bounce: number) => (bounce <= 0 ? 1 : -Math.log(bounce) / Math.sqrt(Math.PI ** 2 + Math.log(bounce) ** 2));

const readings = (t: number, doneOpacity: number, strikeLag: number) => {
  const held = clamp01(t);
  return {
    fill: `scale(${Math.max(t, 0)})`,
    box: `scale(${1 + SWELL * Math.max(0, t - 1)})`,
    tick: 1 - held,
    word: 1 - (1 - doneOpacity) * held,
    rule: `${clamp01((held - strikeLag) / (RULE_END - strikeLag)) * 100}%`,
  };
};

export type SpringCheckProps = {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Ink: the label, the ring, the rule and the focus outline. */
  color?: string;
  fillColor?: string;
  checkColor?: string;
  boxSize?: number;
  boxRadius?: number;
  fontSize?: number;
  /** How far the fill swells past full: 0 arrives dead, 0.5 rebounds twice. */
  bounce?: number;
  /** Where on the spring the strike starts: 0 wipes with the fill, 0.4 waits for the tick. */
  strikeLag?: number;
  doneOpacity?: number;
  strike?: keyof typeof ORIGIN;
  ariaLabel?: string;
  className?: string;
};

export function SpringCheck({
  label = "Ship the build",
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  color = "#ffffff",
  fillColor = "#ffffff",
  checkColor = "#0b0b0f",
  boxSize = 28,
  boxRadius = 9,
  fontSize = 18,
  bounce = 0.2,
  strikeLag = 0.12,
  doneOpacity = 0.42,
  strike = "left",
  ariaLabel,
  className = "",
}: SpringCheckProps) {
  const controlled = checked !== undefined;
  const [inner, setInner] = useState(defaultChecked);
  const on = controlled ? checked : inner;
  const reduce = useReducedMotion();

  const t = useMotionValue(on ? 1 : 0);
  const viaPointer = useRef(false);
  const instant = useRef(false);
  const rowRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const tickRef = useRef<SVGPathElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const cfg = useRef({ doneOpacity, strikeLag });

  useLayoutEffect(() => {
    cfg.current = { doneOpacity, strikeLag };
  });

  const write = (value: number) => {
    const r = readings(value, cfg.current.doneOpacity, cfg.current.strikeLag);
    if (fillRef.current) fillRef.current.style.transform = r.fill;
    if (boxRef.current) boxRef.current.style.transform = r.box;
    if (tickRef.current) tickRef.current.style.strokeDashoffset = String(r.tick);
    if (wordRef.current) {
      wordRef.current.style.opacity = String(r.word);
      wordRef.current.style.setProperty("--sc-strike", r.rule);
    }
  };
  useMotionValueEvent(t, "change", write);
  useLayoutEffect(() => {
    write(t.get());
  });

  useEffect(() => {
    const target = on ? 1 : 0;
    if (reduce || instant.current) {
      instant.current = false;
      t.jump(target);
      return;
    }
    if (t.get() === target && t.getVelocity() === 0) return;
    const controls = animate(t, target, { type: "spring", visualDuration: VISUAL_DURATION, bounce: 1 - zetaOf(bounce) });
    return () => controls.stop();
  }, [on, reduce, bounce, t]);

  const handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || disabled) return;
    viaPointer.current = true;
    if (!reduce && rowRef.current) rowRef.current.dataset.pressed = "";
  };
  const handlePointerUp = () => {
    if (rowRef.current) delete rowRef.current.dataset.pressed;
  };
  const handlePointerCancel = () => {
    viaPointer.current = false;
    handlePointerUp();
  };
  const toggle = () => {
    if (disabled) return;
    // Keyboard toggles land at once; pointer toggles play the spring.
    instant.current = !viaPointer.current;
    viaPointer.current = false;
    const next = !on;
    if (!controlled) setInner(next);
    onChange?.(next);
  };

  const ring = boxSize >= 24 ? 2 : 1.5;
  const gap = Math.min(16, Math.max(8, Math.round(boxSize * 0.43)));
  const ruleHeight = Math.max(1.5, Math.round(fontSize / 6) / 2);

  return (
    <button
      ref={rowRef}
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`spring-check${className ? ` ${className}` : ""}`}
      style={
        {
          "--sc-ink": color,
          "--sc-fill": fillColor,
          "--sc-check": checkColor,
          "--sc-box": `${boxSize}px`,
          "--sc-radius": `${boxRadius}px`,
          "--sc-font": `${fontSize}px`,
          "--sc-ring": `${ring}px`,
          "--sc-gap": `${gap}px`,
          "--sc-row": `${Math.max(44, boxSize + 16)}px`,
          "--sc-rule": `${ruleHeight}px`,
          "--sc-origin": ORIGIN[strike],
        } as CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      onClick={toggle}
    >
      <span className="spring-check__press">
        <span ref={boxRef} className="spring-check__box">
          <span className="spring-check__ring" aria-hidden="true" />
          <span ref={fillRef} className="spring-check__fill" />
          <svg className="spring-check__tick" viewBox="0 0 24 24" aria-hidden="true">
            <path ref={tickRef} d={TICK_PATH} pathLength={1} strokeDasharray={1} />
          </svg>
        </span>
      </span>
      <span className="spring-check__label">
        <span ref={wordRef} className={`spring-check__word${strike === "none" ? "" : " spring-check__word--struck"}`}>
          {label}
        </span>
      </span>
    </button>
  );
}

export default SpringCheck;
