"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, ArrowSquareOutIcon, MegaphoneIcon } from "@phosphor-icons/react/dist/ssr";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

/** What a slot shows (lib/site-slots.ts, edited in Yönetim → Reklam). */
export type SlotView = { name: string; text: string; url: string; sample: boolean };

const isExternal = (url: string) => /^https:\/\//i.test(url);

const SPONSOR_BOX = "flex w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-left transition-colors hover:bg-muted/40";

/**
 * The sponsor strip. With an address it opens the sponsor's site (marked as a sponsored link); without
 * one (sample content) a tap explains the space and offers İş Birliği.
 */
export function SponsorBanner({ slot }: { slot: SlotView }) {
  const [open, setOpen] = useState(false);
  const inner = (
    <>
      <span className="shrink-0 rounded bg-[#fef3c7] px-1.5 py-0.5 text-[10.5px] font-bold uppercase text-[#92400e]">Sponsor</span>
      <span className="min-w-0 flex-1 truncate">
        <b>{slot.name}</b>
        {slot.text && <span className="text-muted-foreground"> · {slot.text}</span>}
      </span>
      {slot.sample ? (
        <span className="shrink-0 text-[11px] text-muted-foreground">örnek</span>
      ) : (
        isExternal(slot.url) && <ArrowSquareOutIcon aria-hidden="true" weight="bold" className="size-3.5 shrink-0 text-muted-foreground" />
      )}
    </>
  );
  if (slot.url && !slot.sample) {
    return isExternal(slot.url) ? (
      <a href={slot.url} target="_blank" rel="sponsored noopener noreferrer" className={SPONSOR_BOX}>
        {inner}
        <span className="sr-only"> (sponsor, yeni sekmede açılır)</span>
      </a>
    ) : (
      <Link href={slot.url} className={SPONSOR_BOX}>
        {inner}
      </Link>
    );
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={SPONSOR_BOX}>
        {inner}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 [&>[data-slot=sheet-close]]:size-11">
          <SheetTitle className="pr-12 text-xl font-bold">{slot.sample ? "Örnek sponsor alanı" : slot.name}</SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            {slot.sample ? `Bu alan, ${siteConfig.name}’e sponsor olan firmaların tanıtımı içindir. Şu an örnek bir içerik gösteriliyor.` : slot.text}
          </SheetDescription>
          <Link href="/is-birligi" onClick={() => setOpen(false)} className={buttonVariants({ className: "w-full" })}>
            Bu alanda yer almak için iletişime geçin
          </Link>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** "Bu alanda reklam vermek için": the text, then the link's label (`name`) with an arrow. */
export function AdvertiseBox({ slot }: { slot: SlotView }) {
  const body = (
    <>
      <MegaphoneIcon aria-hidden="true" weight="bold" className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{slot.text}</span>
      {slot.name && (
        <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-semibold text-primary">
          {slot.name}
          <ArrowRightIcon aria-hidden="true" weight="bold" className="size-3.5" />
        </span>
      )}
    </>
  );
  const box = "flex items-center gap-2 rounded-md border border-dashed border-input bg-card px-2.5 py-2 transition-colors hover:bg-muted/40";
  return isExternal(slot.url) ? (
    <a href={slot.url} target="_blank" rel="noopener noreferrer" className={box}>
      {body}
    </a>
  ) : (
    <Link href={slot.url || "/is-birligi"} className={box}>
      {body}
    </Link>
  );
}
