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
      {/* Phones: a short band (title, one or two lines of intro), so the tool starts high on the screen. */}
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-4 sm:pb-8 sm:pt-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow max-sm:hidden">{eyebrow}</p>}
            <h1 className="text-2xl font-bold tracking-tight sm:mt-1 sm:text-5xl">{title}</h1>
            {intro && <p className="mt-1 max-w-2xl text-muted-foreground max-sm:line-clamp-2 max-sm:text-[0.9375rem] sm:mt-3 sm:text-lg">{intro}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
