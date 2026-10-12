"use client";

import Link from "next/link";
import { useState } from "react";
import { ListIcon } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "./Logo";
import { CtaLink } from "./CtaLink";

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="rounded-xl text-xl text-foreground">
          <Logo />
        </Link>

        <nav aria-label="Ana menü" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-[0.95rem] font-medium text-foreground transition-colors duration-200 hover:bg-secondary hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Visibility lives on the wrapper: CtaLink's own inline-flex would override `hidden`. */}
        <div className="hidden lg:block">
          <CtaLink />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className={buttonVariants({ variant: "outline", size: "icon", className: "lg:hidden" })}
            aria-label="Menüyü aç"
          >
            <ListIcon aria-hidden="true" weight="bold" />
          </SheetTrigger>
          <SheetContent id="mobil-menu" side="right" className="w-[86%] max-w-sm gap-0 bg-background p-6">
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
      </div>
    </header>
  );
}
