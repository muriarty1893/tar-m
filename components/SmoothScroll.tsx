"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Smooth, eased wheel scrolling for the whole site (Lenis). Touch keeps the device's own scrolling;
 * reduced motion keeps the browser's. It pauses while a dialog or the menu locks the page
 * (autoToggle) and leaves scrollable areas inside the page, like the demo phone, to scroll themselves.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, autoToggle: true, allowNestedScroll: true });
    return () => lenis.destroy();
  }, []);
  return null;
}
