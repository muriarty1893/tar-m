// Adapted from Magic UI "BentoGrid" (MIT, magicui.design, listed on 21st.dev).
// Changes: server component (no hover-only CTA — UI UX Pro Max forbids
// hover-only affordances), Phosphor icon slot, Organik Doğa surfaces, and a
// responsive 1 → 2 → 3 column grid instead of fixed 3 columns.
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
  headingLevel?: "h3" | "h2"
}

export function BentoCard({ name, description, icon, background, className, headingLevel = "h3" }: BentoCardProps) {
  const Heading = headingLevel
  return (
    <li
      className={cn(
        "group relative flex min-h-60 flex-col justify-end overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      {background && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {background}
        </div>
      )}
      <div className="relative">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary [&_svg]:size-7">
          {icon}
        </span>
        <Heading className="mt-4 text-xl font-bold">{name}</Heading>
        <p className="mt-1.5 text-muted-foreground">{description}</p>
      </div>
    </li>
  )
}
