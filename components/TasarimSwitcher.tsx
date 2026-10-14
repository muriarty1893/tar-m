"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { TASARIMLAR, TASARIM_KEY, type TasarimId } from "@/lib/tasarim";

const CHANGE = "tasarim-change";

/** Shows a design everywhere at once, remembers it, and drops a ?tasarim= so a reload keeps it. */
function applyTasarim(id: TasarimId) {
  document.documentElement.dataset.tasarim = id;
  try {
    localStorage.setItem(TASARIM_KEY, id);
  } catch {}
  const url = new URL(window.location.href);
  if (url.searchParams.has(TASARIM_KEY)) {
    url.searchParams.delete(TASARIM_KEY);
    window.history.replaceState(null, "", url);
  }
  window.dispatchEvent(new Event(CHANGE));
}

const subscribe = (cb: () => void) => {
  window.addEventListener(CHANGE, cb);
  return () => window.removeEventListener(CHANGE, cb);
};
// Inside the comparison page's frames there is nothing to switch: report no design there.
const snapshot = () => (window.self !== window.top ? null : ((document.documentElement.dataset.tasarim as TasarimId) ?? null));

/**
 * Temporary: a small bar in the corner to flip between the four design candidates on any page.
 * The choice is remembered in this browser. Hidden inside the comparison page's frames.
 */
export function TasarimSwitcher() {
  const current = useSyncExternalStore(subscribe, snapshot, () => null);
  if (!current) return null;
  const pick = applyTasarim;

  return (
    <div
      role="group"
      aria-label="Tasarım seçimi"
      className="fixed bottom-3 right-3 z-50 flex items-center gap-1 rounded-xl border border-[#d4d8d5] bg-white p-1 font-[system-ui,sans-serif] text-sm text-[#1f2a23] shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)]"
    >
      <Link href="/tasarim" className="rounded-lg px-2.5 py-2 font-semibold underline-offset-4 hover:underline">
        Tasarım
      </Link>
      {TASARIMLAR.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={current === t.id}
          onClick={() => pick(t.id)}
          title={t.name}
          className="min-h-10 min-w-10 cursor-pointer rounded-lg px-2 font-semibold transition-colors duration-150 hover:bg-[#eef1ef] aria-pressed:bg-[#1f2a23] aria-pressed:text-white"
        >
          {t.id.toUpperCase()}
          <span className="sr-only"> {t.name}</span>
        </button>
      ))}
    </div>
  );
}
