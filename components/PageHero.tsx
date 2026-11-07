import type { ReactNode } from "react";

/**
 * The top of an info page (SSS, Haberler, Hakkımızda, Gizlilik, Kaynaklar, İş birliği, Hava), Borsa
 * style: a compact white band with a hairline, the title and a short intro, so the page itself starts
 * high on the screen.
 */
export function PageHero({
  title,
  heading,
  intro,
  children,
}: {
  title: string;
  /** Replaces the default <h1> (it must still render an h1 with `title`). */
  heading?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section data-testid="page-hero" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:py-7">
        {heading ?? <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{title}</h1>}
        {intro && <p className="mt-1 max-w-2xl text-[0.9375rem] text-muted-foreground sm:mt-2 sm:text-base">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
