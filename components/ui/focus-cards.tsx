"use client";

// Adapted from Aceternity UI "Focus Cards" (ui.aceternity.com/components/focus-cards).
// Changes: real <button>s with aria-pressed (it's a picker), next/image, the title is always
// visible (touch screens have no hover), keyboard focus drives the same focus effect, and the
// blur/scale is skipped for reduced motion.

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { cn } from "cn";

export type FocusCard = { id: string; title: string; src: string; alt: string };

export function FocusCards({
  cards,
  selectedId,
  onSelect,
  icon,
  className,
}: {
  cards: FocusCard[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  icon?: ReactNode;
  className?: string;
}) {
  const [focused, setFocused] = useState<number | null>(null);

  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4", className)} onMouseLeave={() => setFocused(null)}>
      {cards.map((card, i) => {
        const selected = selectedId === card.id;
        const dimmed = focused !== null && focused !== i;
        return (
          <li key={card.id}>
            <button
              type="button"
              onClick={() => onSelect(card.id)}
              onMouseEnter={() => setFocused(i)}
              onFocus={() => setFocused(i)}
              onBlur={() => setFocused(null)}
              aria-pressed={selected}
              className={cn(
                "group relative block aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-3xl bg-muted text-left shadow-soft outline-none ring-offset-2 ring-offset-background transition-[filter,transform,opacity,box-shadow] duration-300 ease-out focus-visible:ring-4 focus-visible:ring-ring/40 motion-reduce:transition-none sm:aspect-[3/4]",
                dimmed && "scale-[0.98] opacity-80 blur-[2px] motion-reduce:scale-100 motion-reduce:blur-none",
                selected && "ring-4 ring-primary",
              )}
            >
              <Image
                src={card.src}
                alt={card.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              {selected && (
                <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-soft">
                  Seçildi
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5 text-white sm:p-4">
                <span className="font-heading text-base font-bold leading-tight sm:text-lg">{card.title}</span>
                {icon && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full backdrop-blur transition-colors [&_svg]:size-5",
                      selected ? "bg-primary text-primary-foreground" : "bg-white/20 text-white group-hover:bg-white/30",
                    )}
                  >
                    {icon}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
