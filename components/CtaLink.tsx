import Link from "next/link";
import { cn } from "cn";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { ArrowUpRight } from "@/components/ui/arrow-up-right";

export function CtaLink({
  className = "",
  onClick,
  size = "default",
  variant = "default",
  withArrow = true,
}: {
  className?: string;
  onClick?: () => void;
  size?: "default" | "lg";
  variant?: "default" | "gold";
  withArrow?: boolean;
}) {
  return (
    <Link href="/#kayit" onClick={onClick} className={cn(buttonVariants({ size, variant }), "group/cta", className)}>
      {siteConfig.ctaLabel}
      {withArrow && <ArrowUpRight />}
    </Link>
  );
}
