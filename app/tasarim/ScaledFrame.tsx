"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";

const PAGE_WIDTH = 1280;
const PAGE_HEIGHT = 860; // a laptop screen, so the hero looks as it would in a browser

/** A desktop-width page shrunk to fit its column: the iframe renders at 1280px and is scaled down. */
export function ScaledFrame({ src, title, className }: { src: string; title: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / PAGE_WIDTH));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={box}
      className={cn("relative w-full overflow-hidden rounded-xl border border-border bg-white", className)}
      style={{ aspectRatio: `${PAGE_WIDTH} / ${PAGE_HEIGHT}` }}
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        className="absolute left-0 top-0 origin-top-left border-0"
        style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, transform: `scale(${scale})` }}
      />
    </div>
  );
}
