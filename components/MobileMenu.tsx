"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { siteConfig } from "@/config/site";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CtaLink } from "./CtaLink";

/** shadcn/ui Sheet (Base UI Dialog). Loaded on the first tap of the menu button, not with the page. */
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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent id="mobil-menu" side="right" finalFocus={returnFocusTo} className="w-[86%] max-w-sm gap-0 bg-background p-6">
        <SheetTitle className="font-heading text-lg font-bold">Menü</SheetTitle>
        <nav aria-label="Mobil menü" className="mt-6">
          <ul className="flex flex-col gap-1">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="flex min-h-12 items-center rounded-2xl px-4 text-lg font-medium text-foreground hover:bg-secondary hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <CtaLink className="mt-6 w-full" onClick={close} />
      </SheetContent>
    </Sheet>
  );
}
