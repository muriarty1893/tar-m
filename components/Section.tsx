import type { ReactNode } from "react";
import { cn } from "cn";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className = "",
  align = "left",
  backdrop,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "left" | "center";
  /** Decoration filling the whole section behind its content (e.g. a starfield). */
  backdrop?: ReactNode;
}) {
  return (
    <section id={id} className={cn("site-section relative scroll-mt-20 px-4 py-20 sm:py-24", className)}>
      {backdrop}
      <div className="relative mx-auto max-w-6xl">
        <div className={cn("section-head max-w-2xl", align === "center" && "mx-auto text-center")}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="section-title mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          {intro && <p className="mt-4 text-lg text-muted-foreground">{intro}</p>}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
