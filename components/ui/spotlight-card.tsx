"use client";

// Inspired by React Bits "SpotlightCard" (reactbits.dev): a soft light follows the pointer
// across the card and its border. Compact rewrite: one pointer handler writing two CSS
// variables (no re-renders), our tokens, and nothing moves for touch or reduced motion.

import { useRef, type HTMLAttributes } from "react";
import { cn } from "cn";

export function SpotlightCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        ref.current.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
        ref.current.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
      }}
      className={cn(
        "spotlight-card group/spot relative isolate overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft transition-shadow duration-300 hover:shadow-lift",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="spotlight-card__light pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100" />
      <span aria-hidden="true" className="spotlight-card__edge pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100" />
      {children}
    </div>
  );
}
