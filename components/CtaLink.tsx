"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { cn } from "cn";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { ArrowUpRight } from "@/components/ui/arrow-up-right";

/**
 * Scrolls to the sign-up form once nothing holds the page still: a menu that was just closed keeps
 * the page locked for a few frames, and unlocking would put the old scroll position back.
 */
function scrollToForm(form: HTMLElement) {
  let frames = 0;
  const locked = () => [document.documentElement, document.body].some((el) => getComputedStyle(el).overflow === "hidden");
  const go = () => {
    if (locked() && frames++ < 60) return void requestAnimationFrame(go);
    form.scrollIntoView({ block: "start" });
  };
  go();
}

/**
 * A link to the sign-up form ("Erken erişim için kaydol" unless labelled otherwise). On the home page it scrolls to the form itself, so it works every
 * time: once the address already ends in #kayit, a plain link would do nothing.
 */
export function CtaLink({
  className = "",
  label = siteConfig.ctaLabel,
  ariaLabel,
  onClick,
  size = "default",
  variant = "default",
  withArrow = true,
}: {
  className?: string;
  /** The visible text; defaults to "Erken erişim için kaydol". */
  label?: string;
  ariaLabel?: string;
  onClick?: () => void;
  size?: "default" | "lg";
  /** "text": no button chrome; the caller styles it (the footer's underlined links). */
  variant?: "default" | "gold" | "text";
  withArrow?: boolean;
}) {
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    const form = pathname === "/" ? document.getElementById("kayit") : null;
    if (!form || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (location.hash !== "#kayit") history.pushState(null, "", "/#kayit");
    scrollToForm(form);
  };

  return (
    <Link
      href="/#kayit"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={cn(variant !== "text" && buttonVariants({ size, variant }), "group/cta", className)}
    >
      {label}
      {withArrow && <ArrowUpRight />}
    </Link>
  );
}
