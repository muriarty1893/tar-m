"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, ArrowSquareOutIcon, DropIcon, MegaphoneIcon } from "@phosphor-icons/react/dist/ssr";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

/**
 * The home page's two ad spaces, as in the app: a sponsor banner (sample content for now: sukocu.com)
 * and "Reklam vermek için" for firms that want the space. The banner says what it is when tapped,
 * until there is a real sponsor to link to.
 */
export function SponsorBanner() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-[linear-gradient(135deg,#1d4ed8_0%,#0f766e_55%,#047857_100%)] p-3 text-left text-white shadow-soft transition-transform duration-150 active:scale-[0.99] motion-reduce:active:scale-100"
      >
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/15">
          <DropIcon weight="duotone" className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-heading text-base font-extrabold">sukocu.com</span>
            <span className="shrink-0 rounded bg-amber-300 px-1 text-[0.625rem] font-bold leading-4 tracking-wider text-stone-900">ÖRNEK</span>
          </span>
          <span className="line-clamp-2 block text-sm leading-snug text-white/95">Yakıtsız, elektriksiz su pompası</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/40 bg-white/15 px-2.5 py-1.5 text-sm font-bold">
          İncele
          <ArrowSquareOutIcon aria-hidden="true" weight="bold" className="size-4" />
        </span>
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 [&>[data-slot=sheet-close]]:size-11">
          <SheetTitle className="pr-12 text-xl font-bold">Örnek sponsor alanı</SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            Bu alan, {siteConfig.name}’e sponsor olan firmaların tanıtımı içindir. Şu an örnek bir içerik gösteriliyor.
          </SheetDescription>
          <Link href="/is-birligi" onClick={() => setOpen(false)} className={buttonVariants({ className: "w-full" })}>
            Bu alanda yer almak için iletişime geçin
          </Link>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function AdvertiseBox() {
  return (
    <Link
      href="/is-birligi"
      className="flex items-center gap-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-3 py-2.5 transition-colors hover:bg-amber-100"
    >
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
        <MegaphoneIcon weight="duotone" className="size-5" />
      </span>
      <span className="min-w-0 flex-1 text-[0.9375rem] font-bold leading-tight text-amber-900">Reklam vermek için</span>
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-200 px-2 py-1 text-xs font-bold text-amber-900">
        İletişim
        <ArrowRightIcon aria-hidden="true" weight="bold" className="size-3.5" />
      </span>
    </Link>
  );
}
