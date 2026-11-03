import type { ReactNode } from "react";

/**
 * The top of a tool page (Pazar, Mesajlar, Takvim, Tarlalarım, Fiyatlar): title and intro on a plain
 * band with a hairline, and the page's main actions beside them. Smaller than PageHero, so the tool
 * itself starts above the fold on a phone.
 */
export function ToolHeader({
  eyebrow,
  title,
  intro,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:pt-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
            {intro && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
