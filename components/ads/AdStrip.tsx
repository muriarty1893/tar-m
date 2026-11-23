"use client";

import { useEffect, useRef } from "react";
import { useAdsAllowed } from "@/components/ads/AdConsent";
import { ADSENSE_CLIENT, ADSENSE_SLOT } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  /** The element the strip is: a plain box, a list item, or a table row spanning `colSpan` columns. */
  as?: "div" | "li" | "tr";
  colSpan?: number;
  className?: string;
};

/**
 * Google's way of sizing a responsive ad unit (AdSense Help 9183363): a <style> right in the ad code,
 * not the site's stylesheet. 320×100 on phones; 728×90 from 768px, where every container holding a
 * strip is at least 736px wide.
 */
const SIZE = `.ad-serit{width:320px;height:100px}@media(min-width:768px){.ad-serit{width:728px;height:90px}}`;

/**
 * One Google ad in a box the site sizes, so Google may only fill it with ads that fit. Nothing is
 * drawn until the visitor has accepted ads and the ad unit is set, and the strip hides itself when
 * Google has no ad (data-ad-status="unfilled", AdSense Help 10762946). The label must be "Reklamlar"
 * or "Sponsorlu bağlantılar": AdSense allows no other heading above an ad.
 */
export function AdStrip({ as = "div", colSpan = 1, className = "" }: Props) {
  const allowed = useAdsAllowed();
  const ins = useRef<HTMLModElement>(null);

  useEffect(() => {
    const el = ins.current;
    if (!allowed || !el || el.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* an ad blocker or a second push: leave the box to hide itself */
    }
  }, [allowed]);

  if (!allowed || !ADSENSE_CLIENT || !ADSENSE_SLOT) return null;

  const box = (
    <div className="px-2 py-3 text-center">
      <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Reklamlar
      </p>
      <style>{SIZE}</style>
      <ins
        ref={ins}
        className="adsbygoogle ad-serit"
        style={{ display: "inline-block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
      />
    </div>
  );
  // Google marks a box it could not fill; then the whole strip goes, not just the ad.
  const hide = "has-[ins[data-ad-status=unfilled]]:hidden";

  if (as === "tr")
    return (
      <tr className={`${hide} ${className}`}>
        <td colSpan={colSpan} className="p-0">
          {box}
        </td>
      </tr>
    );
  const Tag = as;
  return <Tag className={`${hide} ${className}`}>{box}</Tag>;
}
