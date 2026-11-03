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
  const bg = change > 0 ? "bg-secondary" : change < 0 ? "bg-destructive/10" : "bg-muted";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${bg} ${tone(change)}`}>
      {change > 0 ? <ArrowUpIcon aria-hidden="true" weight="bold" className="size-4" /> : change < 0 ? <ArrowDownIcon aria-hidden="true" weight="bold" className="size-4" /> : null}
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
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <label htmlFor="fiyat-ara" className="sr-only">
            Ürün ya da borsa ara
          </label>
          <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input id="fiyat-ara" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buğday, nohut, Konya…" className="pl-12" />
        </div>
        <div role="group" aria-label="Sıralama" className="grid grid-cols-2 gap-1 rounded-[var(--btn-radius)] bg-muted p-1">
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
              className="min-h-11 cursor-pointer rounded-[calc(var(--btn-radius)-2px)] px-4 font-semibold text-muted-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-soft"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div role="group" aria-label="Ürün grupları" className="flex flex-wrap gap-2">
        {PRICE_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={group === g.id}
            onClick={() => setGroup(g.id)}
            className="min-h-11 cursor-pointer rounded-full bg-secondary px-4 font-semibold transition-colors aria-pressed:bg-foreground aria-pressed:text-background"
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="text-muted-foreground" aria-live="polite">
        {rows.length} ürün
      </p>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-input px-6 py-10 text-center text-lg">Bu aramaya uygun ürün yok.</p>
      ) : (
        <>
          {/* Phones: one card per crop. */}
          <ul className="grid gap-3 md:hidden">
            {rows.map((p) => (
              <li key={p.name} className="flex items-center gap-3 rounded-2xl border border-border p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold">{p.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{p.exchange}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatPrice(p.price)}</p>
                  <Change change={p.change} />
                </div>
              </li>
            ))}
          </ul>
          {/* Wider screens: a table. */}
          <div className="hidden overflow-hidden rounded-2xl border border-border md:block">
            <table className="w-full text-left">
              <caption className="sr-only">Ürün fiyatları, kilogram başına (örnek veriler)</caption>
              <thead className="bg-surface">
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-semibold">Ürün</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Borsa</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Fiyat (kg)</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Haftalık değişim</th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    <span className="sr-only">Son 6 hafta</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((p) => (
                  <tr key={p.name}>
                    <th scope="row" className="px-5 py-4 text-lg font-bold">
                      {p.name}
                    </th>
                    <td className="px-5 py-4 text-muted-foreground">{p.exchange}</td>
                    <td className="px-5 py-4 text-right text-lg font-bold tabular-nums">{formatPrice(p.price)}</td>
                    <td className="px-5 py-4">
                      <Change change={p.change} />
                    </td>
                    <td className="px-5 py-4">
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
