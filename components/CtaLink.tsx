import Link from "next/link";
import { cn } from "cn";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { ArrowUpRight } from "@/components/ui/arrow-up-right";

type CtaProps = {
  className?: string;
  /** The visible text; defaults to siteConfig.ctaLabel ("Ücretsiz hesap açın"). */
  label?: string;
  ariaLabel?: string;
  onClick?: () => void;
  size?: "default" | "lg";
  /** "text": no button chrome; the caller styles it (the footer's underlined links). */
  variant?: "default" | "gold" | "text";
  withArrow?: boolean;
};

/** The site's main call to action: a free account (sign-up). */
export function CtaLink({ className = "", label = siteConfig.ctaLabel, ariaLabel, onClick, size = "default", variant = "default", withArrow = true }: CtaProps) {
  return (
    <Link href="/kayit" aria-label={ariaLabel} onClick={onClick} className={cn(variant !== "text" && buttonVariants({ size, variant }), "group/cta", className)}>
      {label}
      {withArrow && <ArrowUpRight />}
    </Link>
  );
}
