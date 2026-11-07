"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** A dialog (the welcome question, the Hızlı menü, a sheet) is open; Base UI marks it data-open and locks the body. */
const modalOpen = () => document.querySelector("[role='dialog'][data-open]") !== null;

/**
 * Smooth, eased wheel scrolling for the whole site (Lenis). Touch keeps the device's own scrolling;
 * reduced motion keeps the browser's. It leaves the wheel alone while a dialog is open (the dialog
 * has locked the body; Lenis would still move the page, since it scrolls from script) and lets
 * scrollable areas inside the page scroll themselves.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, autoToggle: true, allowNestedScroll: true, prevent: modalOpen });
    return () => lenis.destroy();
  }, []);
  return null;
}
