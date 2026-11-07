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
// Inside a frame or on a design preview (/tasarimlar) the question never opens.
const seen = () => {
  try {
    if (window.self !== window.top || document.getElementById("tasarim-onizleme")) return true;
    return localStorage.getItem(WELCOME_KEY) !== null;
  } catch {
    return true;
  }
};

/** Opens the welcome question on a visitor's first visit, once; never again in this browser. */
export function WelcomeGate() {
  const welcomed = useSyncExternalStore(subscribe, seen, () => true);
  // Open only once the page has loaded and hydrated (the modal hides the rest of the page from
  // assistive tech, which must not happen mid-hydration).
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (welcomed) return;
    let timer = 0;
    const afterLoad = () => {
      timer = window.setTimeout(() => setSettled(true), 300);
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    return () => {
      window.removeEventListener("load", afterLoad);
      window.clearTimeout(timer);
    };
  }, [welcomed]);
  if (welcomed || !settled) return null;
  return <WelcomeDialog onDone={() => window.dispatchEvent(new Event(ANSWERED))} />;
}
