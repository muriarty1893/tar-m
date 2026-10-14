"use client";

import Image from "next/image";
import { useId, useRef, useState, type FormEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
  DotsThreeCircleIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  ShareNetworkIcon,
  UsersThreeIcon,
  WarehouseIcon,
} from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { pageHeroPhoto } from "@/data/photo-credits";
import { WELCOME_KEY, WELCOME_SOURCES, type WelcomeSource } from "@/lib/welcome";
import { Button } from "@/components/ui/button";

const ICONS: Record<WelcomeSource, typeof UsersThreeIcon> = {
  arkadas: UsersThreeIcon,
  "sosyal-medya": ShareNetworkIcon,
  arama: MagnifyingGlassIcon,
  kooperatif: WarehouseIcon,
  haber: NewspaperIcon,
  diger: DotsThreeCircleIcon,
};

/**
 * First-visit welcome: one required question, "Bizi nereden duydunuz?". The dialog can't be
 * dismissed (no close button, Escape or outside click) and "Bitti" stays disabled until an answer
 * is picked. The answer is remembered in this browser and sent to the team's sheet (/api/source).
 */
export default function WelcomeDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(true);
  const [source, setSource] = useState<WelcomeSource | null>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const ids = { question: useId(), hint: useId() };

  const finish = (e: FormEvent) => {
    e.preventDefault();
    if (!source) return;
    try {
      localStorage.setItem(WELCOME_KEY, JSON.stringify({ source, at: new Date().toISOString() }));
    } catch {}
    // Fire and forget: the visitor never waits on the sheet.
    fetch("/api/source", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ source }),
      keepalive: true,
    }).catch(() => {});
    setOpen(false);
  };

  return (
    <Dialog.Root
      open={open}
      // Only "Bitti" closes it: Escape, outside clicks and focus leaving are ignored.
      onOpenChange={() => {}}
      onOpenChangeComplete={(isOpen) => !isOpen && onDone()}
      disablePointerDismissal
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[70] bg-[rgb(8_20_12/0.45)] backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-[71] flex items-end justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
          <Dialog.Popup
            initialFocus={title}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-lift outline-none transition-[opacity,transform] duration-200 ease-out data-ending-style:translate-y-2 data-ending-style:opacity-0 data-starting-style:translate-y-3 data-starting-style:opacity-0"
          >
            <div className="relative h-28 sm:h-32">
              <Image src={pageHeroPhoto.src} alt="" fill sizes="(min-width: 640px) 32rem, 100vw" className="object-cover object-[50%_62%]" />
            </div>
            <form onSubmit={finish} className="p-5 sm:p-7">
              <Dialog.Title ref={title} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none sm:text-3xl">
                Hoş geldiniz
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-muted-foreground">
                Başlamadan önce tek bir soru: cevabınız {siteConfig.name} ekibinin daha çok çiftçiye ulaşmasına yardım eder.
              </Dialog.Description>

              <p id={ids.question} className="mt-6 font-semibold">
                Bizi nereden duydunuz? <span className="font-normal text-muted-foreground">(zorunlu)</span>
              </p>
              <div role="radiogroup" aria-labelledby={ids.question} aria-required="true" className="mt-3 grid gap-2 min-[400px]:grid-cols-2">
                {WELCOME_SOURCES.map(({ id, label }) => {
                  const Icon = ICONS[id];
                  return (
                    <label
                      key={id}
                      className="relative flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border px-3.5 py-2.5 transition-colors duration-150 hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:checked]:text-primary has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
                    >
                      <input
                        type="radio"
                        name="kaynak"
                        value={id}
                        checked={source === id}
                        onChange={() => setSource(id)}
                        // Invisible but covering the whole tile, so any click on it lands on the radio.
                        className="absolute inset-0 cursor-pointer appearance-none rounded-lg opacity-0"
                      />
                      <Icon aria-hidden="true" weight="duotone" className="size-6 shrink-0" />
                      <span className="font-medium leading-snug">{label}</span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p id={ids.hint} aria-live="polite" className="text-sm text-muted-foreground">
                  {source ? "Teşekkürler, siteye geçebilirsiniz." : "Devam etmek için bir seçenek işaretleyin."}
                </p>
                {/* Greyed out and unclickable until an answer is picked. */}
                <span className={source ? "" : "cursor-not-allowed"}>
                  <Button
                    type="submit"
                    disabled={!source}
                    aria-describedby={ids.hint}
                    className="w-full disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none sm:w-auto sm:min-w-32"
                  >
                    Bitti
                  </Button>
                </span>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
