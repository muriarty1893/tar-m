"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { ListIcon } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "./Logo";
import { CtaLink } from "./CtaLink";

// The Sheet (Base UI Dialog) is only needed once someone opens the menu.
const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });

export function Header() {
  const [open, setOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

        <button
          ref={triggerRef}
          type="button"
          aria-label="Menüyü aç"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            setMenuLoaded(true);
            setOpen(true);
          }}
          className={buttonVariants({ variant: "outline", size: "icon", className: "lg:hidden" })}
        >
          <ListIcon aria-hidden="true" weight="bold" />
        </button>
        {menuLoaded && <MobileMenu open={open} onOpenChange={setOpen} returnFocusTo={triggerRef} />}
      </div>
    </header>
  );
}
