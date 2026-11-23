"use client";

import Form from "next/form";
import Link from "next/link";
import { useRef, type FormEvent, type ReactNode } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { provinces } from "@/data/provinces";
import { CONDITIONS, DATE_FILTERS, SORTS, marketHref, marketParams, type MarketQuery } from "@/lib/market";
import { SelectChevron, selectClass } from "@/components/forms/fields";

/**
 * Pazar's controls, laid out as on sahibinden.com: the search bar in the top band, the filter
 * sections in the left column (a full-screen "Filtrele" sheet on phones) and the order picker. All
 * are plain GET forms to /pazar, so they work without JavaScript; each keeps the filters it doesn't
 * show as hidden fields.
 */

type Key = keyof MarketQuery;

/** The query's other filters, as hidden fields. */
function Keep({ query, except }: { query: MarketQuery; except: Key[] }) {
  const params = marketParams({ ...query, sayfa: 1 });
  // Always send the order, so a form with nothing filled in still opens the results, not the showcase.
  if (!params.has("sirala")) params.set("sirala", query.sirala);
  return [...params]
    .filter(([k]) => !except.includes(k as Key))
    .map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />);
}

/** Empty fields stay out of the address (no "?fmin=&fmax="). */
function dropEmpty(e: FormEvent<HTMLFormElement>) {
  const fields = Array.from(e.currentTarget.elements).filter((el) => el instanceof HTMLInputElement || el instanceof HTMLSelectElement);
  for (const el of fields) if (el.name && el.value === "") el.disabled = true;
  // Back on once the browser has read the form, so going back shows the fields as they were.
  setTimeout(() => fields.forEach((el) => (el.disabled = false)));
}

/** Inside the phone's filter sheet (a popover), close it as the results load. */
function closeSheet(el: Element) {
  (el.closest("[popover]") as HTMLElement | null)?.hidePopover?.();
}

/** The search bar: words or an ilan no; the category and filters carry over. */
export function MarketSearch({ query }: { query: MarketQuery }) {
  return (
    <Form action="/pazar" role="search" aria-label="İlan ara" onSubmit={dropEmpty} className="flex">
      <Keep query={query} except={["q"]} />
      <label htmlFor="pazar-q" className="sr-only">
        Kelime veya ilan no ile ara
      </label>
      <input
        id="pazar-q"
        name="q"
        type="search"
        defaultValue={query.q}
        placeholder="Kelime veya ilan no ile ara"
        enterKeyHint="search"
        className="min-h-10 min-w-0 flex-1 rounded-l-md border border-r-0 border-input bg-card px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 xl:text-[14px]"
      />
      <button
        type="submit"
        className="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-r-md bg-primary px-3.5 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="size-5" />
        <span className="max-sm:sr-only">Ara</span>
      </button>
    </Form>
  );
}

/** A grey filter box with a bold heading, as in sahibinden's left column. */
function Box({ title, hideTitle = false, aside, children }: { title: string; hideTitle?: boolean; aside?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="rounded-sm bg-muted/80 px-3 pb-3 pt-2.5">
      <legend className={hideTitle ? "sr-only" : "float-left mb-2 flex w-full items-baseline justify-between text-[14px] font-bold"}>
        {title}
        {aside}
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

const smallInput =
  "min-h-10 w-full min-w-0 rounded-sm border border-input bg-card px-2 text-[15px] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 xl:min-h-8 xl:text-[13px]";
const choice = "flex min-h-10 cursor-pointer items-center gap-2 text-[14px] text-primary xl:min-h-6 xl:text-[13px]";
const heading = "px-0.5 pt-1 text-[15px] font-bold";

/**
 * The left column's filters, in sahibinden's order: Durumu; "Arama Seçenekleri" (Adres, Fiyat,
 * Kelime ile filtrele); "Diğer Seçenekler" (İlan Tarihi, Fotoğraflı ilanlar); the Ara button stays
 * in view at the bottom. `id` keeps two copies (column and phone sheet) apart.
 */
export function MarketFilterForm({ query, id }: { query: MarketQuery; id: string }) {
  const clear = marketHref(query, { q: "", il: "", fmin: null, fmax: null, tarih: 0, durum: "", foto: false });
  return (
    <Form
      action="/pazar"
      aria-label="Filtreler"
      className="space-y-2.5"
      onSubmit={(e) => {
        dropEmpty(e);
        closeSheet(e.currentTarget);
      }}
    >
      <Keep query={query} except={["q", "il", "fmin", "fmax", "tarih", "durum", "foto"]} />

      <p className={heading}>Durumu</p>
      <Box title="Durumu" hideTitle>
        {[...CONDITIONS, { id: "" as const, label: "Tümü" }].map((c) => (
          <label key={c.id || "tumu"} className={choice}>
            <input type="radio" name="durum" value={c.id} defaultChecked={query.durum === c.id} className="size-4 accent-[var(--primary)]" />
            {c.label}
          </label>
        ))}
      </Box>

      <p className={heading}>Arama Seçenekleri</p>
      <Box title="Adres" aside={<span className="text-[12px] font-normal text-primary">Türkiye</span>}>
        <label htmlFor={`${id}-il`} className="sr-only">
          İl
        </label>
        <div className="relative">
          <select id={`${id}-il`} name="il" defaultValue={query.il} className={`${selectClass} min-h-10 rounded-sm text-[15px] xl:min-h-8 xl:py-1 xl:text-[13px]`}>
            <option value="">İl</option>
            {provinces.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </Box>

      <Box title="Fiyat">
        <div className="flex items-center gap-1.5">
          <label htmlFor={`${id}-fmin`} className="sr-only">
            En düşük fiyat (TL)
          </label>
          <input id={`${id}-fmin`} name="fmin" inputMode="numeric" autoComplete="off" defaultValue={query.fmin ?? ""} placeholder="min TL" className={smallInput} />
          <span aria-hidden="true" className="text-muted-foreground">
            -
          </span>
          <label htmlFor={`${id}-fmax`} className="sr-only">
            En yüksek fiyat (TL)
          </label>
          <input id={`${id}-fmax`} name="fmax" inputMode="numeric" autoComplete="off" defaultValue={query.fmax ?? ""} placeholder="max TL" className={smallInput} />
        </div>
      </Box>

      <Box title="Kelime ile filtrele">
        <label htmlFor={`${id}-q`} className="sr-only">
          Kelime
        </label>
        <input id={`${id}-q`} name="q" type="search" defaultValue={query.q} autoComplete="off" className={smallInput} />
      </Box>

      <p className={heading}>Diğer Seçenekler</p>
      <Box title="İlan Tarihi">
        {[...DATE_FILTERS, { days: 0, label: "Tümü" }].map((d) => (
          <label key={d.days} className={choice}>
            <input type="radio" name="tarih" value={d.days || ""} defaultChecked={query.tarih === d.days} className="size-4 accent-[var(--primary)]" />
            {d.label}
          </label>
        ))}
      </Box>

      <Box title="Fotoğraflı ilanlar">
        <label className={choice}>
          <input type="checkbox" name="foto" value="1" defaultChecked={query.foto} className="size-4 accent-[var(--primary)]" />
          Fotoğraflı ilanlar
        </label>
      </Box>

      <div className="sticky bottom-0 z-10 -mx-1 flex items-center gap-3 border-t border-border bg-card/95 px-1 py-2.5 backdrop-blur-sm xl:bg-background/95">
        <button type="submit" className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-sm bg-primary px-4 text-[15px] font-bold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 xl:min-h-9">
          Ara
        </button>
        <Link href={clear} onClick={(e) => closeSheet(e.currentTarget)} className="inline-flex min-h-11 items-center text-[13px] font-semibold text-primary hover:underline xl:min-h-9">
          Temizle
        </Link>
      </div>
    </Form>
  );
}

/** "Sıralama" over the results; changes apply at once (a button does it without JavaScript). */
export function SortSelect({ query, id, className = "" }: { query: MarketQuery; id: string; className?: string }) {
  const form = useRef<HTMLFormElement>(null);
  return (
    <Form ref={form} action="/pazar" aria-label="Sıralama" className={`flex items-center gap-2 ${className}`}>
      <Keep query={query} except={["sirala"]} />
      <label htmlFor={id} className="shrink-0 text-[13px] text-muted-foreground max-xl:sr-only">
        Sıralama
      </label>
      <div className="relative min-w-0 flex-1">
        <select
          id={id}
          name="sirala"
          defaultValue={query.sirala}
          onChange={() => form.current?.requestSubmit()}
          className={`${selectClass} min-h-11 pl-2.5 pr-8 text-[14px] font-semibold xl:min-h-9 xl:py-1 xl:pl-3 xl:pr-9 xl:text-[13px] xl:font-normal`}
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
      <noscript>
        <button type="submit" className="min-h-10 rounded-md border border-input px-3 text-[14px] font-semibold">
          Sırala
        </button>
      </noscript>
    </Form>
  );
}
