import type { ReactNode } from "react";

/**
 * The top of a tool page (Pazar, Mesajlar, Takvim, Tarlalarım, Fiyatlar), Borsa style: a compact white
 * band with a hairline, the title and a line of intro, and the page's main actions beside them, so the
 * tool itself starts high on a phone.
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
      <div className="mx-auto max-w-6xl px-4 py-3 sm:py-6">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow max-sm:hidden">{eyebrow}</p>}
            <h1 className="text-xl font-bold leading-tight sm:text-2xl">{title}</h1>
            {intro && <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground max-sm:line-clamp-2 sm:mt-1 sm:text-[0.9375rem]">{intro}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
