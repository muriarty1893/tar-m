import type { ReactNode } from "react";

/** Shared header band for subpages: eyebrow, h1, intro, organic backdrop. */
export function PageHero({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border px-4 pb-14 pt-14 sm:pt-20">
      <div aria-hidden="true" className="dot-texture pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
      <div aria-hidden="true" className="blob pointer-events-none absolute -right-24 -top-24 size-80 bg-blob opacity-70" />
      <div className="relative mx-auto max-w-4xl">
        {eyebrow && <p className="text-sm font-bold uppercase tracking-[0.14em] text-gold">{eyebrow}</p>}
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-xl text-muted-foreground">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
