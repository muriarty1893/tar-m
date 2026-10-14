"use client";

// Adapted from React Bits "PillNav" (reactbits.dev, MIT): light pills in a rounded green bar.
// Changes: Next.js links, the site's colours and sentence-case labels; instead of the circle that
// fills the pill on hover, each label rolls: its letters flip up one after another (a few ms
// apart) and a green copy rolls in from below; keyboard focus plays the same roll; aria-current
// marks the page (no ARIA menubar roles, which a site nav must not use); the logo and mobile
// popover are left out (the header has its own logo and phone menu). Styles: app/globals.css.

import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "cn";

export type PillNavItem = { label: string; href: string; active?: boolean };

export function PillNav({ items, label, className }: { items: PillNavItem[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn("pill-nav", className)}>
      <ul className="pill-nav__list">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} aria-current={item.active ? "page" : undefined} className="pill-nav__pill">
              <span className="sr-only">{item.label}</span>
              <span aria-hidden="true" className="pill-nav__roll">
                {Array.from(item.label).map((ch, i) => (
                  <span key={i} className="pill-nav__char" style={{ "--i": i } as CSSProperties}>
                    <span className="pill-nav__label">{ch === " " ? "\u00a0" : ch}</span>
                    <span className="pill-nav__label pill-nav__label--next">{ch === " " ? "\u00a0" : ch}</span>
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
