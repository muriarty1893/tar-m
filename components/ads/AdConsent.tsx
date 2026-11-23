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

/** True once this visitor has accepted ads, on a page that may show them. False on the server. */
export function useAdsAllowed(): boolean {
  const answer = useSyncExternalStore(subscribe, read, () => "hayir" as Answer);
  const path = usePathname();
  return answer === "evet" && !adFreePath(path);
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
 * loads AdSense only on a yes. "Reddet" is as easy as "Kabul et"; the footer's "Reklam tercihleri"
 * asks again. The ads then fill the site's own boxes (AdStrip), sized by us.
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
    if (answer === "evet" && !adFreePath(path)) loadAdSense(client);
  }, [answer, path, client]);

  const show = asking || (answer === null && greeted && !adFreePath(path));
  if (!show) return null;

  const choose = (a: "evet" | "hayir") => {
    save(a);
    setAsking(false);
    // Turning ads off after they loaded needs a fresh page to drop Google's script.
    if (a === "hayir" && loaded) window.location.reload();
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
        Site ücretsiz kalsın diye Google reklamları gösteriyoruz. Google bunun için çerez kullanır ve reklamları ilgi alanlarınıza göre seçebilir. Kabul etmezseniz reklam gösterilmez,
        site aynen çalışır. Kararınızı sayfanın altındaki “Reklam tercihleri” ile değiştirebilirsiniz.{" "}
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
