"use client";

import { useId, useState, useTransition } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { saveSlot, type SlotResult } from "@/app/yonetim/actions";
import { AdvertiseBox, SponsorBanner } from "@/components/home/AdSlots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Slot = { id: "sponsor" | "reklam"; enabled: boolean; name: string; text: string; url: string; sample: boolean };

const COPY = {
  sponsor: {
    title: "Sponsor şeridi",
    name: "Sponsorun adı",
    nameHint: "Kalın yazılır, ör. sukocu.com",
    text: "Kısa tanıtım",
    textHint: "Adın yanında gri yazılır, ör. Yakıtsız, elektriksiz su pompası",
    url: "Bağlantı",
    urlHint: "Sponsorun sitesi (https://…). Boş bırakılırsa dokununca alanın ne olduğu anlatılır.",
  },
  reklam: {
    title: "“Reklam verin” kutusu",
    name: "Bağlantı yazısı",
    nameHint: "Sağdaki mavi yazı, ör. İletişim",
    text: "Kutunun yazısı",
    textHint: "ör. Bu alanda reklam vermek için",
    url: "Açacağı sayfa",
    urlHint: "Sitedeki bir sayfa (ör. /is-birligi) ya da https:// ile başlayan bir adres.",
  },
} as const;

/** One home-page ad space: its fields, a live preview as it will look, and Kaydet. */
export function SlotEditor({ slot }: { slot: Slot }) {
  const [v, setV] = useState(slot);
  const [result, setResult] = useState<SlotResult | null>(null);
  const [pending, start] = useTransition();
  const id = useId();
  const c = COPY[slot.id];
  const set = <K extends keyof Slot>(k: K, value: Slot[K]) => {
    setV((old) => ({ ...old, [k]: value }));
    setResult(null);
  };
  const err = result?.errors ?? {};

  const field = (k: "name" | "text" | "url", label: string, hint: string, max: number) => (
    <div className="space-y-1">
      <label htmlFor={`${id}-${k}`} className="block text-[13px] font-semibold">
        {label}
      </label>
      <Input
        id={`${id}-${k}`}
        value={v[k]}
        maxLength={max}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={Boolean(err[k])}
        aria-describedby={`${id}-${k}-hint`}
        className="h-10"
      />
      <p id={`${id}-${k}-hint`} className={`text-[12px] ${err[k] ? "text-destructive" : "text-muted-foreground"}`}>
        {err[k] ?? hint}
      </p>
    </div>
  );

  return (
    <form
      className="space-y-3 rounded-md border border-border bg-card p-3 sm:p-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setResult(await saveSlot(slot.id, v)));
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[15px] font-bold">{c.title}</h2>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[13px] font-semibold">
          <input type="checkbox" checked={v.enabled} onChange={(e) => set("enabled", e.target.checked)} className="size-5 accent-[var(--primary)]" />
          Ana sayfada göster
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {field("name", c.name, c.nameHint, 60)}
        {field("text", c.text, c.textHint, 120)}
        <div className="sm:col-span-2">{field("url", c.url, c.urlHint, 300)}</div>
      </div>

      {slot.id === "sponsor" && (
        <label className="flex cursor-pointer items-start gap-2 text-[13px]">
          <input type="checkbox" checked={v.sample} onChange={(e) => set("sample", e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--primary)]" />
          <span>
            <b>Örnek içerik</b>: yanına “örnek” yazılır ve bağlantı açılmaz. Gerçek bir sponsor girince işareti kaldırın.
          </span>
        </label>
      )}

      <div className="space-y-1">
        <p className="text-[12px] font-semibold text-muted-foreground">Önizleme</p>
        <div className={`text-[13px] leading-[1.45] ${v.enabled ? "" : "opacity-50"}`} inert>
          {slot.id === "sponsor" ? <SponsorBanner slot={v} /> : <AdvertiseBox slot={v} />}
        </div>
        {!v.enabled && <p className="text-[12px] text-muted-foreground">Kapalıyken ana sayfada görünmez; diğer alan tüm satırı kaplar.</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        <p role="status" className="flex items-center gap-1.5 text-[13px] empty:hidden">
          {result?.saved && (
            <>
              <CheckCircleIcon aria-hidden="true" weight="fill" className="size-4 text-good" />
              Kaydedildi; ana sayfada görünüyor.
            </>
          )}
          {result?.message && <span className="text-destructive">{result.message}</span>}
        </p>
      </div>
    </form>
  );
}
