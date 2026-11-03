// Adapted from Magic UI "BentoGrid" (MIT, magicui.design, listed on 21st.dev).
// Changes: server component (no hover-only CTA — UI UX Pro Max forbids
// hover-only affordances), Phosphor icon slot, Organik Doğa surfaces, and a
// responsive 1 → 2 → 3 column grid instead of fixed 3 columns.
import Link from "next/link"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { cn } from "cn"

export function BentoGrid({ children, className, ...props }: ComponentPropsWithoutRef<"ul">) {
  return (
    <ul className={cn("grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)} {...props}>
      {children}
    </ul>
  )
}

interface BentoCardProps {
  name: string
  description: string
  icon: ReactNode
  background?: ReactNode
  className?: string
  /** Narrows the text, e.g. to keep it clear of a photo on one side. */
  contentClassName?: string
  headingLevel?: "h3" | "h2"
  /** A short status beside the icon ("Yakında", "Sitede açık"), with an optional link for the open ones. */
  status?: { label: string; tone: "soon" | "live"; href?: string }
}

export function BentoCard({ name, description, icon, background, className, contentClassName, headingLevel = "h3", status }: BentoCardProps) {
  const Heading = headingLevel
  // Outer frame around the inner panel that holds the content.
  return (
    <li className={cn("relative min-h-60 rounded-2xl border border-border p-2", className)}>
      <div className="relative flex h-full flex-col justify-end gap-5 overflow-hidden rounded-lg border border-border/70 bg-card p-6 shadow-soft">
        {background && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {background}
          </div>
        )}
        <div className="relative flex items-center gap-3">
          <span className="flex size-12 w-fit items-center justify-center rounded-xl border border-border bg-background p-2.5 text-primary [&_svg]:size-7">
            {icon}
          </span>
          {status &&
            (status.href ? (
              <Link
                href={status.href}
                className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground underline-offset-4 hover:underline"
              >
                {status.label}
              </Link>
            ) : (
              <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", status.tone === "soon" ? "bg-gold-soft text-gold" : "bg-secondary text-primary")}>
                {status.label}
              </span>
            ))}
        </div>
        <div className={cn("relative", contentClassName)}>
          <Heading className="text-xl font-bold">{name}</Heading>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
      </div>
    </li>
  )
}
