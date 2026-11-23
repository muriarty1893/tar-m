"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { AD_CONSENT_KEY, AD_PREFS_EVENT, adFreePath } from "@/lib/ads";
import { WELCOME_KEY } from "@/lib/welcome";

type Answer = "evet" | "hayir" | null;

const CHANGED = "reklam-onayi-degisti";
const read = (): Answer => {
  try {
    const v = localStorage.getItem(AD_CONSENT_KEY);
    return v === "evet" || v === "hayir" ? v : null;
  } catch {
    return "hayir"; // no storage: never load ads, never nag
  }
};
const welcomed = () => {
  try {
    return localStorage.getItem(WELCOME_KEY) !== null;
  } catch {
    return true;
  }
};
const subscribe = (cb: () => void) => {
  window.addEventListener(CHANGED, cb);
  window.addEventListener("storage", cb);
  window.addEventListener("bereket-hosgeldin-answered", cb);
  return () => {
    window.removeEventListener(CHANGED, cb);
    window.removeEventListener("storage", cb);
    window.removeEventListener("bereket-hosgeldin-answered", cb);
  };
};

function save(answer: "evet" | "hayir") {
  try {
    localStorage.setItem(AD_CONSENT_KEY, answer);
  } catch {
    /* storage blocked: the answer holds for this page only */
  }
  window.dispatchEvent(new Event(CHANGED));
}

const noop = () => () => {};
/** True on a page that may show ads, once the page runs in the browser (false on the server). */
export function useAdsShown(): boolean {
  const browser = useSyncExternalStore(noop, () => true, () => false);
  const path = usePathname();
  return browser && !adFreePath(path);
}

/**
 * Ads show either way; the answer only decides whether Google may pick them by the visitor's
 * interests. Without a yes (refused, or not answered yet) every ad request is non-personalised.
 */
function personalise(answer: Answer) {
  (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = answer === "evet" ? 0 : 1;
}

let loaded = false;
function loadAdSense(client: string) {
  if (loaded || document.querySelector("script[data-adsense]")) return;
  loaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  s.crossOrigin = "anonymous";
  s.dataset.adsense = "";
  document.head.appendChild(s);
}

/**
 * Asks once whether Google may show ads (with cookies), after the welcome question is answered, and
 * loads AdSense on every page that may show ads: personalised ads on a yes, non-personalised ones
 * otherwise (the owner's choice, 2026-11-23). "Reddet" is as easy as "Kabul et"; the footer's
 * "Reklam tercihleri" asks again. The ads then fill the site's own boxes (AdStrip), sized by us.
 */
export function AdConsent({ client }: { client: string }) {
  const answer = useSyncExternalStore(subscribe, read, () => "hayir" as Answer);
  const greeted = useSyncExternalStore(subscribe, welcomed, () => false);
  const path = usePathname();
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    const open = () => setAsking(true);
    window.addEventListener(AD_PREFS_EVENT, open);
    return () => window.removeEventListener(AD_PREFS_EVENT, open);
  }, []);

  useEffect(() => {
    personalise(answer);
    if (!adFreePath(path)) loadAdSense(client);
  }, [answer, path, client]);

  const show = asking || (answer === null && greeted && !adFreePath(path));
  if (!show) return null;

  const choose = (a: "evet" | "hayir") => {
    save(a);
    setAsking(false);
  };

  return (
    <section
      role="region"
      aria-labelledby="reklam-onayi-baslik"
      className="fixed inset-x-3 bottom-[calc(var(--bottom-nav)+0.5rem)] z-50 mx-auto max-w-xl rounded-md border border-border bg-card p-3 shadow-lift xl:bottom-4"
    >
      <h2 id="reklam-onayi-baslik" className="text-[15px] font-bold">
        Reklamlar ve çerezler
      </h2>
      <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">
        Site ücretsiz kalsın diye Google reklamları gösteriyoruz. Google bunun için çerez kullanır ve reklamları ilgi alanlarınıza göre seçebilir. Reddederseniz reklamlar yine
        gösterilir ama ilgi alanlarınıza göre seçilmez. Kararınızı sayfanın altındaki “Reklam tercihleri” ile değiştirebilirsiniz.{" "}
        <Link href="/gizlilik#reklam" className="font-medium text-primary underline-offset-4 hover:underline">
          Ayrıntılar
        </Link>
      </p>
      <div className="mt-2.5 flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => choose("hayir")}>
          Reddet
        </Button>
        <Button type="button" className="flex-1" onClick={() => choose("evet")}>
          Kabul et
        </Button>
      </div>
    </section>
  );
}

/** The footer link that opens the question again. */
export function AdPreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(AD_PREFS_EVENT))}
      className="inline-flex min-h-7 items-center underline-offset-4 hover:text-foreground hover:underline"
    >
      Reklam tercihleri
    </button>
  );
}
