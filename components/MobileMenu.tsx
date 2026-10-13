"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { RefObject } from "react";
import { CaretRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CtaLink } from "./CtaLink";
import { Logo } from "./Logo";
import { navExtras } from "./nav-items";

/**
 * Full-screen menu (Base UI Dialog via the shadcn Sheet: focus trap, Escape, focus return).
 * Big icon rows with a one-line hint, a staggered entrance, and the CTAs within thumb reach.
 * Loaded on the first tap of the menu button, not with the page.
 */
export default function MobileMenu({
  open,
  onOpenChange,
  returnFocusTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusTo: RefObject<HTMLButtonElement | null>;
}) {
  const close = () => onOpenChange(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="mobil-menu"
        side="top"
        finalFocus={returnFocusTo}
        className="h-[100dvh] gap-0 overflow-y-auto border-0 bg-background px-4 pb-8 pt-0 [&>[data-slot=sheet-close]]:right-4 [&>[data-slot=sheet-close]]:top-3.5 [&>[data-slot=sheet-close]]:size-12 [&>[data-slot=sheet-close]]:rounded-full [&>[data-slot=sheet-close]]:border-2 [&>[data-slot=sheet-close]]:border-primary"
      >
        <div className="flex h-18 items-center">
          <Logo className="text-xl" />
        </div>
        <SheetTitle className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-gold">Menü</SheetTitle>
        <nav aria-label="Mobil menü" className="mt-3">
          <ul className="space-y-2">
            {siteConfig.nav.map((item, i) => {
              const extra = navExtras[item.href];
              const Icon = extra?.icon;
              const current = !item.href.includes("#") && pathname === item.href;
              return (
                <li
                  key={item.href}
                  className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:fill-mode-both motion-safe:duration-400"
                  style={{ animationDelay: `${60 + i * 45}ms` }}
                >
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={current ? "page" : undefined}
                    className="group flex min-h-16 items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft transition-colors duration-200 hover:border-primary/40 hover:bg-secondary aria-[current=page]:border-primary aria-[current=page]:bg-secondary"
                  >
                    {Icon && (
                      <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon weight="duotone" className="size-6" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-semibold text-foreground">{item.label}</span>
                      {extra && <span className="block truncate text-sm text-muted-foreground">{extra.hint}</span>}
                    </span>
                    <CaretRightIcon aria-hidden="true" weight="bold" className="size-5 text-primary transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-6 grid gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both motion-safe:duration-500" style={{ animationDelay: "340ms" }}>
          <CtaLink size="lg" withArrow className="w-full" onClick={close} />
          <Link href="/#demo" onClick={close} className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}>
            Demoyu deneyin
          </Link>
          <a href={`mailto:${siteConfig.contactEmail}`} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
            <EnvelopeSimpleIcon aria-hidden="true" weight="duotone" className="size-5" />
            {siteConfig.contactEmail}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
