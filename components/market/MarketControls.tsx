"use client";

import Form from "next/form";
import Link from "next/link";
import { useRef, type FormEvent } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { provinces } from "@/data/provinces";
import { DATE_FILTERS, SORTS, marketHref, marketParams, type MarketQuery } from "@/lib/market";
import { SelectChevron, selectClass } from "@/components/forms/fields";

/**
 * Pazar's controls, sahibinden-style: the search bar over the results, the filter box in the left
 * column (a "Filtrele" drawer on phones) and the order picker. All are plain GET forms to /pazar, so
 * they work without JavaScript; each keeps the filters it doesn't show as hidden fields.
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

/** The search bar over the results: words only; the category and filters carry over. */
export function MarketSearch({ query }: { query: MarketQuery }) {
  return (
    <Form action="/pazar" role="search" aria-label="İlan ara" onSubmit={dropEmpty} className="flex">
      <Keep query={query} except={["q"]} />
      <label htmlFor="pazar-q" className="sr-only">
        Ne arıyorsunuz?
      </label>
      <input
        id="pazar-q"
        name="q"
        type="search"
        defaultValue={query.q}
        placeholder="Kelime ile ara: traktör, buğday tohumu, pulverizatör…"
        enterKeyHint="search"
        className="min-h-11 min-w-0 flex-1 rounded-l-md border border-r-0 border-input bg-card px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 xl:text-[15px]"
      />
      <button
        type="submit"
        className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-r-md bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="size-5" />
        <span className="max-sm:sr-only">Ara</span>
      </button>
    </Form>
  );
}

const fieldset = "border-b border-border px-3 py-2.5 [&>*:not(legend)]:clear-both";
const legend = "float-left mb-1.5 w-full text-[13px] font-bold";
const smallInput =
  "min-h-10 w-full min-w-0 rounded-md border border-input bg-card px-2.5 text-[15px] tabular-nums outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20";

/** The left column's filters: place, price range, date and "photos only". `id` keeps two copies apart. */
export function MarketFilterForm({ query, id }: { query: MarketQuery; id: string }) {
  const clear = marketHref(query, { il: "", fmin: null, fmax: null, tarih: 0, foto: false });
  return (
    <Form action="/pazar" aria-label="Filtreler" onSubmit={dropEmpty}>
      <Keep query={query} except={["il", "fmin", "fmax", "tarih", "foto"]} />

      <fieldset className={fieldset}>
        <legend className={legend}>Adres</legend>
        <label htmlFor={`${id}-il`} className="sr-only">
          İl
        </label>
        <div className="relative">
          <select id={`${id}-il`} name="il" defaultValue={query.il} className={`${selectClass} min-h-10 text-[15px]`}>
            <option value="">Tüm Türkiye</option>
            {provinces.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </fieldset>

      <fieldset className={fieldset}>
        <legend className={legend}>Fiyat (₺)</legend>
        <div className="flex items-center gap-1.5">
          <label htmlFor={`${id}-fmin`} className="sr-only">
            En düşük fiyat
          </label>
          <input id={`${id}-fmin`} name="fmin" inputMode="numeric" autoComplete="off" defaultValue={query.fmin ?? ""} placeholder="min" className={smallInput} />
          <span aria-hidden="true" className="text-muted-foreground">
            –
          </span>
          <label htmlFor={`${id}-fmax`} className="sr-only">
            En yüksek fiyat
          </label>
          <input id={`${id}-fmax`} name="fmax" inputMode="numeric" autoComplete="off" defaultValue={query.fmax ?? ""} placeholder="max" className={smallInput} />
        </div>
      </fieldset>

      <fieldset className={fieldset}>
        <legend className={legend}>İlan tarihi</legend>
        <ul className="space-y-0.5">
          {[{ days: 0, label: "Tümü" }, ...DATE_FILTERS].map((d) => (
            <li key={d.days}>
              <label className="flex min-h-10 cursor-pointer items-center gap-2 text-[14px] xl:min-h-8">
                <input type="radio" name="tarih" value={d.days || ""} defaultChecked={query.tarih === d.days} className="size-4 accent-[var(--primary)]" />
                {d.label}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className={fieldset}>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-[14px] xl:min-h-8">
          <input type="checkbox" name="foto" value="1" defaultChecked={query.foto} className="size-4 accent-[var(--primary)]" />
          Sadece fotoğraflı ilanlar
        </label>
      </div>

      <div className="flex items-center gap-3 px-3 py-3">
        <button type="submit" className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-md bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          Ara
        </button>
        <Link href={clear} className="inline-flex min-h-10 items-center text-[14px] font-semibold text-primary hover:underline">
          Temizle
        </Link>
      </div>
    </Form>
  );
}

/** "Sıralama" over the results; changes apply at once (a button does it without JavaScript). */
export function SortSelect({ query, id }: { query: MarketQuery; id: string }) {
  const form = useRef<HTMLFormElement>(null);
  return (
    <Form ref={form} action="/pazar" aria-label="Sıralama" className="flex items-center gap-2">
      <Keep query={query} except={["sirala"]} />
      <label htmlFor={id} className="text-[13px] text-muted-foreground max-sm:sr-only">
        Sıralama
      </label>
      <div className="relative">
        <select id={id} name="sirala" defaultValue={query.sirala} onChange={() => form.current?.requestSubmit()} className={`${selectClass} min-h-10 py-1 text-[14px]`}>
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
