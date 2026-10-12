import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// shadcn/ui Button (Base UI) restyled for Organik Doğa: pill shape and
// 48px minimum height for touch (UI UX Pro Max: touch targets ≥ 44–48px).
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-200 outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-[color-mix(in_oklab,var(--primary),black_12%)] hover:shadow-lift",
        gold: "bg-gold text-gold-foreground shadow-soft hover:bg-[color-mix(in_oklab,var(--gold),black_12%)]",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary/10",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_8%)]",
        ghost: "text-foreground hover:bg-secondary",
        link: "rounded-md text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-12 px-6 py-3 text-base",
        lg: "min-h-14 px-8 py-3.5 text-lg",
        sm: "min-h-11 px-4 py-2 text-[0.95rem]",
        icon: "size-12",
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
