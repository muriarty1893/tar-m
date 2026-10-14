// Adapted from React Bits "CircularText" (reactbits.dev, MIT): the same letter layout around a
// circle. Changes: the spin is a CSS animation instead of motion (no JS, server-rendered), it
// stands still for reduced motion, and there is no hover behaviour. Decorative: hidden from
// assistive tech, so the same words must be written out nearby. Styles: app/globals.css.

import type { CSSProperties, ReactNode } from "react";
import { cn } from "cn";

export function CircularText({
  text,
  spinDuration = 20,
  size = 200,
  fontSize = 24,
  className,
  children,
}: {
  text: string;
  /** Seconds per full turn. */
  spinDuration?: number;
  size?: number;
  fontSize?: number;
  className?: string;
  /** Optional centre piece (e.g. an icon), which does not spin. */
  children?: ReactNode;
}) {
  const letters = Array.from(text);
  return (
    <div aria-hidden="true" data-testid="circular-text" className={cn("circular-text-wrap", className)} style={{ width: size, height: size }}>
      <div className="circular-text" style={{ "--ct-duration": `${spinDuration}s` } as CSSProperties}>
        {letters.map((letter, i) => {
          const deg = (360 / letters.length) * i;
          const f = (Math.PI / letters.length) * i;
          const transform = `rotateZ(${deg}deg) translate3d(${f}px, ${f}px, 0)`;
          return (
            <span key={i} style={{ transform, fontSize }}>
              {letter}
            </span>
          );
        })}
      </div>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  );
}
