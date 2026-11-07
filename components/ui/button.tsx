import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// shadcn/ui Button restyled for Borsa: 6 px corners, 44 px tall by default (36 px small, still a
// comfortable touch target with its spacing), blue; `create` is the red of Konu aç and İlan ver.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--btn-radius)] font-semibold whitespace-nowrap transition-[background-color,color,border-color] duration-150 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary),black_14%)]",
        create: "bg-create text-create-foreground hover:bg-[var(--create-hover)]",
        gold: "bg-gold text-gold-foreground hover:bg-[color-mix(in_oklab,var(--gold),black_12%)]",
        outline: "border border-input bg-card text-primary hover:border-primary/50 hover:bg-secondary",
        secondary: "bg-secondary text-primary hover:bg-[color-mix(in_oklab,var(--secondary),var(--primary)_8%)]",
        ghost: "text-foreground hover:bg-muted",
        link: "rounded-md text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 px-4 py-2 text-[0.9375rem]",
        lg: "min-h-12 px-5 py-2.5 text-base",
        sm: "min-h-9 px-3 py-1.5 text-sm",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  // Classic shadcn/ui: a native <button> (no headless wrapper needed for a button).
  return (
    <button
      type={props.type ?? "button"}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
