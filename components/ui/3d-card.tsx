"use client";

// Adapted from Aceternity UI "3D Card Effect" (ui.aceternity.com/components/3d-card-effect).
// Changes: one tilt container whose layers lift with plain CSS (group-hover translateZ) instead
// of a React context and per-item effects; mouse pointers only; flat for reduced motion.

import { useRef, type CSSProperties, type HTMLAttributes } from "react";
import { cn } from "cn";

export function CardContainer({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const reset = () => ref.current && (ref.current.style.transform = "rotateY(0deg) rotateX(0deg)");

  return (
    <div className="h-full [perspective:1000px]">
      <div
        ref={ref}
        onPointerMove={(e) => {
          const el = ref.current;
          if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          const { left, top, width, height } = el.getBoundingClientRect();
          const x = (e.clientX - left - width / 2) / 28;
          const y = (e.clientY - top - height / 2) / 28;
          el.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
        }}
        onPointerLeave={reset}
        className={cn("group/card3d relative h-full transition-transform duration-200 ease-out [transform-style:preserve-3d]", className)}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

/** A layer that lifts towards the viewer while the card is hovered (`depth` in px). */
export function CardItem({ depth = 40, className, children, ...props }: HTMLAttributes<HTMLDivElement> & { depth?: number }) {
  return (
    <div
      style={{ "--card-z": `${depth}px` } as CSSProperties}
      className={cn(
        "transition-transform duration-300 ease-out group-hover/card3d:[transform:translateZ(var(--card-z))] motion-reduce:group-hover/card3d:transform-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
