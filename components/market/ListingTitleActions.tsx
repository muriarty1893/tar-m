"use client";

import { PrinterIcon } from "@phosphor-icons/react/dist/ssr";

/** sahibinden's title bar on a listing: "Yazdır", then Facebook, X and e-posta shares. */
export function ListingTitleActions({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const share = "inline-flex size-8 items-center justify-center rounded-sm text-[13px] font-bold transition-opacity hover:opacity-85";
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[13px] text-primary transition-colors hover:bg-secondary max-sm:hidden"
      >
        <PrinterIcon aria-hidden="true" weight="duotone" className="size-4 text-muted-foreground" />
        Yazdır
      </button>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook’ta paylaş" className={`${share} bg-[#1877f2] text-white`}>
        f
      </a>
      <a href={`https://x.com/intent/post?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" aria-label="X’te paylaş" className={`${share} bg-foreground text-background`}>
        𝕏
      </a>
      <a href={`mailto:?subject=${t}&body=${u}`} aria-label="E-posta ile gönder" className={`${share} border border-border bg-card text-muted-foreground`}>
        @
      </a>
    </div>
  );
}
