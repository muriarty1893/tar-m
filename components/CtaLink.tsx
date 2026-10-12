import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "cn";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";

export function CtaLink({
  className = "",
  onClick,
  size = "default",
  withArrow = false,
}: {
  className?: string;
  onClick?: () => void;
  size?: "default" | "lg";
  withArrow?: boolean;
}) {
  return (
    <Link href="/#kayit" onClick={onClick} className={cn(buttonVariants({ size }), "group/cta", className)}>
      {siteConfig.ctaLabel}
      {withArrow && (
        <ArrowRightIcon
          aria-hidden="true"
          weight="bold"
          className="transition-transform duration-200 group-hover/cta:translate-x-0.5"
        />
      )}
    </Link>
  );
}
