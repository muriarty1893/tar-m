"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { WELCOME_KEY } from "@/lib/welcome";

// The dialog (Base UI) loads only for first-time visitors.
const WelcomeDialog = dynamic(() => import("./WelcomeDialog"), { ssr: false });

const ANSWERED = "bereket-hosgeldin-answered";
const subscribe = (cb: () => void) => {
  window.addEventListener(ANSWERED, cb);
  return () => window.removeEventListener(ANSWERED, cb);
};
// Without storage (blocked, private mode) treat the visitor as welcomed rather than asking every time.
const seen = () => {
  try {
    return localStorage.getItem(WELCOME_KEY) !== null;
  } catch {
    return true;
  }
};

/** Opens the welcome question on a visitor's first visit, once; never again in this browser. */
export function WelcomeGate() {
  const welcomed = useSyncExternalStore(subscribe, seen, () => true);
  // Open only once the page has loaded and hydrated: the modal hides the rest of the page from
  // assistive tech, which must not happen while React is still hydrating it.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (welcomed) return;
    let idle = 0;
    const go = () => {
      idle = window.setTimeout(() => setSettled(true), 300);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      window.clearTimeout(idle);
    };
  }, [welcomed]);
  if (welcomed || !settled) return null;
  return <WelcomeDialog onDone={() => window.dispatchEvent(new Event(ANSWERED))} />;
}
