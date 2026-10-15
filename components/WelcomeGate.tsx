"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { WELCOME_KEY } from "@/lib/welcome";
import { CINE_DONE } from "@/lib/cine";

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
  // Open only once the page has loaded and hydrated (the modal hides the rest of the page from
  // assistive tech, which must not happen mid-hydration) and, on the home page, once the hero's
  // opening animation has played.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (welcomed) return;
    const html = document.documentElement;
    let timer = 0;
    const open = () => setSettled(true);
    const afterLoad = () => {
      timer = window.setTimeout(() => {
        // The home hero is playing its opening animation: wait for it to finish (or 12 s at most).
        if (html.dataset.cineRun && !html.dataset.cineDone) {
          window.addEventListener(CINE_DONE, open, { once: true });
          timer = window.setTimeout(open, 12_000);
        } else open();
      }, 300);
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    return () => {
      window.removeEventListener("load", afterLoad);
      window.removeEventListener(CINE_DONE, open);
      window.clearTimeout(timer);
    };
  }, [welcomed]);
  if (welcomed || !settled) return null;
  return <WelcomeDialog onDone={() => window.dispatchEvent(new Event(ANSWERED))} />;
}
