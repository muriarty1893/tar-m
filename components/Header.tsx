"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { Logo } from "./Logo";
import { PillNav } from "./ui/pill-nav";
import { AccountButton, MessagesLink } from "./account/HeaderAccount";

// The full-screen menu (Base UI Dialog) is only needed once someone opens it.
const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });

/** Desktop navigation: React Bits PillNav in the site's green. The current page gets a dot. */
function DesktopNav() {
  const pathname = usePathname();
  const items = siteConfig.nav.map((item) => ({ ...item, active: !item.href.includes("#") && pathname.startsWith(item.href) }));
  return <PillNav label="Ana menü" items={items} className="hidden xl:block" />;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      {/* On wide screens a three-column grid keeps the menu centred: the account button, which
          appears once sign-in has loaded, can't push it sideways. */}
      {/* Phones under 400 px (most iPhones are 390) get a smaller logo and tighter gaps, so the messages and menu buttons fit beside it. */}
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-2 px-3 min-[375px]:px-4 min-[400px]:gap-4 xl:grid xl:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="shrink-0 justify-self-start whitespace-nowrap rounded-xl text-lg text-foreground min-[400px]:text-xl">
          <Logo imageClassName="size-10 min-[400px]:size-12" />
        </Link>

        {/* The current page is URL data: on dynamic pages it streams in, the plain menu shows first. */}
        <Suspense fallback={<PillNav label="Ana menü" items={siteConfig.nav} className="hidden xl:block" />}>
          <DesktopNav />
        </Suspense>

        <div className="flex items-center gap-1.5 justify-self-end min-[400px]:gap-2">
          <Suspense>
            <MessagesLink />
          </Suspense>
          {/* Visibility lives on the wrapper: the button's own inline-flex would override `hidden`. */}
          <div className="hidden xl:block">
            <Suspense fallback={<span aria-hidden="true" className="block size-12" />}>
              <AccountButton />
            </Suspense>
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
            className="group/menu flex size-11 cursor-pointer items-center justify-center gap-2.5 rounded-full border-2 border-primary bg-background font-semibold min-[400px]:size-12 min-[440px]:h-12 min-[440px]:w-auto min-[440px]:pl-4 min-[440px]:pr-3 text-primary transition-colors duration-200 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 xl:hidden"
          >
            {/* The word shows from 440 px; on phones the button is the three bars, its label still "Menüyü aç". */}
            <span aria-hidden="true" className="max-[439px]:hidden">
              Menü
            </span>
            {/* Three bars that stagger on hover and fold into an X while the menu is open. */}
            <span aria-hidden="true" className="relative flex h-4 w-5 flex-col justify-between">
              <span className="h-0.5 w-5 origin-center rounded-full bg-current transition-transform duration-300 group-aria-expanded/menu:translate-y-[7px] group-aria-expanded/menu:rotate-45" />
              <span className="h-0.5 w-3.5 self-end rounded-full bg-current transition-[width,opacity] duration-300 group-hover/menu:w-5 group-aria-expanded/menu:opacity-0" />
              <span className="h-0.5 w-5 origin-center rounded-full bg-current transition-transform duration-300 group-aria-expanded/menu:-translate-y-[7px] group-aria-expanded/menu:-rotate-45" />
            </span>
          </button>
        </div>
        {menuLoaded && <MobileMenu open={open} onOpenChange={setOpen} returnFocusTo={triggerRef} />}
      </div>
    </header>
  );
}
