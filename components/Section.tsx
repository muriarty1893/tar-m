import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-20 px-4 py-16 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          {eyebrow && <p className="font-bold uppercase tracking-wider text-accent-ink">{eyebrow}</p>}
          <h2 className="mt-1 text-3xl font-extrabold sm:text-4xl">{title}</h2>
          {intro && <p className="mt-3 text-lg text-muted">{intro}</p>}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
