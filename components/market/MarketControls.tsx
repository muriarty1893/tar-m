"use client";

import Form from "next/form";
import Link from "next/link";
import { useRef, type FormEvent, type ReactNode } from "react";
import { CaretDownIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { provinces } from "@/data/provinces";
import { DATE_FILTERS, SORTS, marketHref, marketParams, type MarketQuery } from "@/lib/market";
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

/** One collapsible filter section, open at first, as sahibinden's left column. */
function Section({ title, children, open = true }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-border">
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between px-3 text-[13px] font-bold transition-colors hover:bg-muted/50 xl:min-h-9 [&::-webkit-details-marker]:hidden">
        {title}
        <CaretDownIcon aria-hidden="true" weight="bold" className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-3 pb-3">{children}</div>
    </details>
  );
}

const smallInput =
  "min-h-10 w-full min-w-0 rounded-md border border-input bg-card px-2.5 text-[15px] tabular-nums outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 xl:min-h-9 xl:text-[13.5px]";
const choice = "flex min-h-10 cursor-pointer items-center gap-2 text-[14px] xl:min-h-7 xl:text-[13px]";

/** The left column's filters: Adres, Fiyat, İlan tarihi, Fotoğraf. `id` keeps two copies apart. */
export function MarketFilterForm({ query, id }: { query: MarketQuery; id: string }) {
  const clear = marketHref(query, { il: "", fmin: null, fmax: null, tarih: 0, foto: false });
  return (
    <Form
      action="/pazar"
      aria-label="Filtreler"
      onSubmit={(e) => {
        dropEmpty(e);
        closeSheet(e.currentTarget);
      }}
    >
      <Keep query={query} except={["il", "fmin", "fmax", "tarih", "foto"]} />

      <Section title="Adres">
        <label htmlFor={`${id}-il`} className="sr-only">
          İl
        </label>
        <div className="relative">
          <select id={`${id}-il`} name="il" defaultValue={query.il} className={`${selectClass} min-h-10 text-[15px] xl:min-h-9 xl:text-[13.5px]`}>
            <option value="">Tüm iller</option>
            {provinces.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </Section>

      <Section title="Fiyat">
        <div className="flex items-center gap-1.5">
          <label htmlFor={`${id}-fmin`} className="sr-only">
            En düşük fiyat (TL)
          </label>
          <input id={`${id}-fmin`} name="fmin" inputMode="numeric" autoComplete="off" defaultValue={query.fmin ?? ""} placeholder="min TL" className={smallInput} />
          <span aria-hidden="true" className="text-muted-foreground">
            –
          </span>
          <label htmlFor={`${id}-fmax`} className="sr-only">
            En yüksek fiyat (TL)
          </label>
          <input id={`${id}-fmax`} name="fmax" inputMode="numeric" autoComplete="off" defaultValue={query.fmax ?? ""} placeholder="max TL" className={smallInput} />
        </div>
      </Section>

      <Section title="İlan tarihi">
        <fieldset>
          <legend className="sr-only">İlan tarihi</legend>
          {[{ days: 0, label: "Tümü" }, ...DATE_FILTERS].map((d) => (
            <label key={d.days} className={choice}>
              <input type="radio" name="tarih" value={d.days || ""} defaultChecked={query.tarih === d.days} className="size-4 accent-[var(--primary)]" />
              {d.label}
            </label>
          ))}
        </fieldset>
      </Section>

      <Section title="Fotoğraf">
        <label className={choice}>
          <input type="checkbox" name="foto" value="1" defaultChecked={query.foto} className="size-4 accent-[var(--primary)]" />
          Fotoğraflı ilanlar
        </label>
      </Section>

      <div className="flex items-center gap-3 p-3">
        <button type="submit" className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-md bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 xl:min-h-9 xl:text-[14px]">
          Ara
        </button>
        <Link href={clear} onClick={(e) => closeSheet(e.currentTarget)} className="inline-flex min-h-10 items-center text-[14px] font-semibold text-primary hover:underline xl:min-h-9 xl:text-[13px]">
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
