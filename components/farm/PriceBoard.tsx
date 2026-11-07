"use client";

import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { PRICES, PRICE_GROUPS, filterPrices, trendLabel, type PriceGroupId, type PriceSort } from "@/data/demo-prices";
import { formatPrice } from "@/lib/market";
import { Input } from "@/components/ui/input";

const tone = (change: number) => (change > 0 ? "text-primary" : change < 0 ? "text-destructive" : "text-muted-foreground");

/** The last six weeks as a small line (decorative: the change is also given in words). */
function Sparkline({ line, change }: { line: number[]; change: number }) {
  const step = 60 / (line.length - 1);
  return (
    <svg viewBox="0 0 60 16" aria-hidden="true" className={`h-6 w-20 shrink-0 ${tone(change)}`}>
      <polyline points={line.map((y, i) => `${i * step},${y}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Change({ change }: { change: number }) {
  return (
    <span className={`inline-flex items-center gap-0.5 font-borsa-mono text-[12px] font-semibold ${tone(change)}`}>
      {change > 0 ? <ArrowUpIcon aria-hidden="true" weight="bold" className="size-3" /> : change < 0 ? <ArrowDownIcon aria-hidden="true" weight="bold" className="size-3" /> : null}
      <span aria-hidden="true">
        {change > 0 ? "+" : change < 0 ? "−" : ""}%{Math.abs(change).toFixed(1).replace(".", ",")}
      </span>
      <span className="sr-only">{trendLabel(change)}</span>
    </span>
  );
}

/** Crop prices per kilo: search by crop or exchange, groups, A–Z or largest change. */
export function PriceBoard() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<PriceGroupId>("tumu");
  const [sort, setSort] = useState<PriceSort>("az");
  const rows = filterPrices(PRICES, { query, group, sort });

  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <label htmlFor="fiyat-ara" className="sr-only">
            Ürün ya da borsa ara
          </label>
          <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="fiyat-ara" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buğday, nohut, Konya…" className="pl-9" />
        </div>
        <div role="group" aria-label="Sıralama" className="grid grid-cols-2 gap-1 rounded-md border border-border bg-card p-1">
          {(
            [
              ["az", "A–Z"],
              ["degisim", "En çok değişen"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={sort === id}
              onClick={() => setSort(id)}
              className="min-h-9 cursor-pointer rounded px-3 text-sm font-semibold text-muted-foreground aria-pressed:bg-secondary aria-pressed:text-primary"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div role="group" aria-label="Ürün grupları" className="flex flex-wrap gap-1.5">
        {PRICE_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={group === g.id}
            onClick={() => setGroup(g.id)}
            className="min-h-9 cursor-pointer rounded-md border border-border bg-card px-3 text-sm font-medium transition-colors hover:border-primary/40 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="text-muted-foreground" aria-live="polite">
        {rows.length} ürün
      </p>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-input bg-card px-4 py-4 text-center">Bu aramaya uygun ürün yok.</p>
      ) : (
        <>
          {/* Phones: one row per crop in a single box. */}
          <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card md:hidden">
            {rows.map((p) => (
              <li key={p.name} className="flex items-center gap-3 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold">{p.name}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{p.exchange}</p>
                </div>
                <div className="text-right">
                  <p className="font-borsa-mono text-[14px] font-semibold">{formatPrice(p.price)}</p>
                  <Change change={p.change} />
                </div>
              </li>
            ))}
          </ul>
          {/* Wider screens: a table. */}
          <div className="hidden overflow-hidden rounded-md border border-border bg-card md:block">
            <table className="w-full text-left text-[13.5px]">
              <caption className="sr-only">Ürün fiyatları, kilogram başına (örnek veriler)</caption>
              <thead className="bg-surface">
                <tr className="border-b border-border text-[11.5px] uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-2 font-semibold">Ürün</th>
                  <th scope="col" className="px-4 py-2 font-semibold">Borsa</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">Fiyat (kg)</th>
                  <th scope="col" className="px-4 py-2 font-semibold">Haftalık değişim</th>
                  <th scope="col" className="px-4 py-2 font-semibold">
                    <span className="sr-only">Son 6 hafta</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((p) => (
                  <tr key={p.name}>
                    <th scope="row" className="px-4 py-2 font-semibold">
                      {p.name}
                    </th>
                    <td className="px-4 py-2 text-muted-foreground">{p.exchange}</td>
                    <td className="px-4 py-2 text-right font-borsa-mono font-semibold">{formatPrice(p.price)}</td>
                    <td className="px-4 py-2">
                      <Change change={p.change} />
                    </td>
                    <td className="px-4 py-2">
                      <Sparkline line={p.line} change={p.change} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
