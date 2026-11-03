"use client";

import Form from "next/form";
import { useRef } from "react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { provinces } from "@/data/provinces";
import { SORTS, marketHref, type MarketQuery } from "@/lib/market";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectChevron, selectClass } from "@/components/forms/fields";

/**
 * Pazar's search row: words, province and order. A plain GET form (works without JavaScript); with
 * it, changing the province or the order applies at once.
 */
export function MarketFilters({ query }: { query: MarketQuery }) {
  const form = useRef<HTMLFormElement>(null);
  const submit = () => form.current?.requestSubmit();

  return (
    <Form ref={form} action="/pazar" role="search" aria-label="İlan ara" className="grid gap-3 md:grid-cols-[1fr_14rem_13rem_auto]">
      {query.kategori !== "tumu" && <input type="hidden" name="kategori" value={query.kategori} />}
      {query.gorunum !== "tumu" && <input type="hidden" name="gorunum" value={query.gorunum} />}
      <div className="relative">
        <label htmlFor="pazar-q" className="sr-only">
          Ne arıyorsunuz?
        </label>
        <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input id="pazar-q" name="q" type="search" defaultValue={query.q} placeholder="Traktör, buğday tohumu, pulverizatör…" className="pl-12" enterKeyHint="search" />
      </div>
      <div className="relative">
        <label htmlFor="pazar-il" className="sr-only">
          İl
        </label>
        <select id="pazar-il" name="il" defaultValue={query.il} onChange={submit} className={selectClass}>
          <option value="">Tüm Türkiye</option>
          {provinces.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
      <div className="relative">
        <label htmlFor="pazar-sirala" className="sr-only">
          Sıralama
        </label>
        <select id="pazar-sirala" name="sirala" defaultValue={query.sirala} onChange={submit} className={selectClass}>
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
      <Button type="submit">Ara</Button>
      {(query.q || query.il) && (
        <p className="md:col-span-4">
          <Link href={marketHref(query, { q: "", il: "" })} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary underline-offset-4 hover:underline">
            <XIcon aria-hidden="true" weight="bold" className="size-4" />
            Aramayı temizle
          </Link>
        </p>
      )}
    </Form>
  );
}
