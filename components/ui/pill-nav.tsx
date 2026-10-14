"use client";

// Adapted from React Bits "PillNav" (reactbits.dev, MIT): pills in a rounded bar; on hover a
// circle rises from below and fills the pill while the label slides up and a light copy slides
// in. Changes: Next.js links, the site's colours and sentence-case labels; plain CSS transitions
// instead of GSAP (the header is on every page); keyboard focus plays the same fill;
// aria-current marks the page (no ARIA menubar roles, which a site nav must not use); the logo
// and mobile popover are left out (the header has its own logo and phone menu). The circle's
// geometry is measured once per size, as in the original. Styles: app/globals.css ("pill-nav").

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "cn";

export type PillNavItem = { label: string; href: string; active?: boolean };

/** Size the circle so it just covers the pill when scaled up from below its bottom edge. */
function fit(pill: HTMLElement) {
  const circle = pill.querySelector<HTMLElement>(".pill-nav__circle");
  if (!circle) return;
  const { width: w, height: h } = pill.getBoundingClientRect();
  if (!w || !h) return;
  const R = ((w * w) / 4 + h * h) / (2 * h);
  const D = Math.ceil(2 * R) + 2;
  const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
  circle.style.width = `${D}px`;
  circle.style.height = `${D}px`;
  circle.style.bottom = `-${delta}px`;
  circle.style.transformOrigin = `50% ${D - delta}px`;
  pill.style.setProperty("--pill-h", `${h}px`);
}

export function PillNav({ items, label, className }: { items: PillNavItem[]; label: string; className?: string }) {
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const layout = () => el.querySelectorAll<HTMLElement>(".pill-nav__pill").forEach(fit);
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    document.fonts?.ready.then(layout).catch(() => {});
    return () => ro.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className={cn("pill-nav", className)}>
      <ul ref={list} className="pill-nav__list">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} aria-current={item.active ? "page" : undefined} className="pill-nav__pill">
              <span className="pill-nav__circle" aria-hidden="true" />
              <span className="pill-nav__stack">
                <span className="pill-nav__label">{item.label}</span>
                <span className="pill-nav__label-hover" aria-hidden="true">
                  {item.label}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
