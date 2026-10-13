"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { Logo } from "./Logo";
import { CtaLink } from "./CtaLink";

// The full-screen menu (Base UI Dialog) is only needed once someone opens it.
const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });

/**
 * Desktop nav in the style of the 21st.dev "tubelight navbar": a pill with a small glowing
 * lamp glides to the hovered link and rests on the current page. Positioned by writing
 * styles straight to the DOM (no animation library, no re-renders).
 */
function DesktopNav() {
  const pathname = usePathname();
  const pill = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const moveTo = useCallback((el: HTMLElement | null) => {
    const p = pill.current;
    if (!p) return;
    if (!el) {
      p.style.opacity = "0";
      return;
    }
    // Measure against the list: each link's own offsetLeft is relative to its <li>.
    const base = list.current?.getBoundingClientRect().left ?? 0;
    const r = el.getBoundingClientRect();
    p.style.opacity = "1";
    p.style.width = `${r.width}px`;
    p.style.transform = `translateX(${r.left - base}px)`;
  }, []);

  const current = useCallback(() => list.current?.querySelector<HTMLElement>("a[aria-current='page']") ?? null, []);

  useEffect(() => {
    moveTo(current());
    const ro = new ResizeObserver(() => moveTo(current()));
    if (list.current) ro.observe(list.current);
    return () => ro.disconnect();
  }, [pathname, moveTo, current]);

  return (
    <nav aria-label="Ana menü" className="hidden xl:block">
      <ul
        ref={list}
        onMouseLeave={() => moveTo(current())}
        className="relative flex items-center gap-0.5 rounded-full border border-border bg-background/80 p-1 shadow-soft backdrop-blur"
      >
        <span
          ref={pill}
          aria-hidden="true"
          className="absolute inset-y-1 left-0 rounded-full bg-secondary opacity-0 transition-[transform,width,opacity] duration-300 ease-out motion-reduce:transition-none"
        >
          {/* The "tube light": a short bar on top with a soft glow under it. */}
          <span className="absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-primary">
            <span className="absolute -left-2 -top-2 h-6 w-12 rounded-full bg-primary/20 blur-md" />
            <span className="absolute -top-1 h-6 w-8 rounded-full bg-primary/20 blur-md" />
          </span>
        </span>
        {siteConfig.nav.map((item) => {
          const active = !item.href.includes("#") && pathname.startsWith(item.href);
          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onMouseEnter={(e) => moveTo(e.currentTarget)}
                onFocus={(e) => moveTo(e.currentTarget)}
                onBlur={() => moveTo(current())}
                className="relative z-10 block whitespace-nowrap rounded-full px-4 py-2 text-[0.95rem] font-medium text-foreground transition-colors duration-200 hover:text-primary aria-[current=page]:font-semibold aria-[current=page]:text-primary"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0 whitespace-nowrap rounded-xl text-xl text-foreground">
          <Logo />
        </Link>

        <DesktopNav />

        {/* Visibility lives on the wrapper: CtaLink's own inline-flex would override `hidden`. */}
        <div className="hidden xl:block">
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
          className="group/menu flex min-h-12 cursor-pointer items-center gap-2.5 rounded-full border-2 border-primary bg-background pl-4 pr-3 font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 xl:hidden"
        >
          <span aria-hidden="true">Menü</span>
          {/* Three bars that stagger on hover and fold into an X while the menu is open. */}
          <span aria-hidden="true" className="relative flex h-4 w-5 flex-col justify-between">
            <span className="h-0.5 w-5 origin-center rounded-full bg-current transition-transform duration-300 group-aria-expanded/menu:translate-y-[7px] group-aria-expanded/menu:rotate-45" />
            <span className="h-0.5 w-3.5 self-end rounded-full bg-current transition-[width,opacity] duration-300 group-hover/menu:w-5 group-aria-expanded/menu:opacity-0" />
            <span className="h-0.5 w-5 origin-center rounded-full bg-current transition-transform duration-300 group-aria-expanded/menu:-translate-y-[7px] group-aria-expanded/menu:-rotate-45" />
          </span>
        </button>
        {menuLoaded && <MobileMenu open={open} onOpenChange={setOpen} returnFocusTo={triggerRef} />}
      </div>
    </header>
  );
}
