"use client";

import { useSyncExternalStore } from "react";

const time = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hour12: false });

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 10_000);
  return () => clearInterval(id);
}

/** The time in Türkiye, kept current. The server renders a blank clock; the browser fills it in. */
export function FooterClock({ className }: { className?: string }) {
  const now = useSyncExternalStore(subscribe, () => time.format(new Date()), () => "--:--");
  return (
    <p data-testid="footer-clock" className={className}>
      <span>TÜRKİYE:</span> (GMT+3) <time suppressHydrationWarning>{now}</time>
    </p>
  );
}
