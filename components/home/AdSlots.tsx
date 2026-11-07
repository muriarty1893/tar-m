"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, MegaphoneIcon } from "@phosphor-icons/react/dist/ssr";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

/**
 * The home page's two ad spaces, as thin Borsa strips: the sponsor (sample content for now: sukocu.com)
 * and "Bu alanda reklam vermek için" for firms that want the space. The banner says what it is when tapped,
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
        className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-left transition-colors hover:bg-muted/40"
      >
        <span className="shrink-0 rounded bg-[#fef3c7] px-1.5 py-0.5 text-[10.5px] font-bold uppercase text-[#92400e]">Sponsor</span>
        <span className="min-w-0 flex-1 truncate">
          <b>sukocu.com</b> <span className="text-muted-foreground">· Yakıtsız, elektriksiz su pompası</span>
        </span>
        <span className="shrink-0 text-[11px] text-muted-foreground">örnek</span>
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
    <Link href="/is-birligi" className="flex items-center gap-2 rounded-md border border-dashed border-input bg-card px-2.5 py-2 transition-colors hover:bg-muted/40">
      <MegaphoneIcon aria-hidden="true" weight="bold" className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">Bu alanda reklam vermek için</span>
      <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-semibold text-primary">
        İletişim
        <ArrowRightIcon aria-hidden="true" weight="bold" className="size-3.5" />
      </span>
    </Link>
  );
}
