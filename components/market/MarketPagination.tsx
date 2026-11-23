import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { marketHref, type MarketQuery } from "@/lib/market";

/** 1 … 4 5 [6] 7 8 … 20: the first, the last and two either side of the current page. */
export function pageList(current: number, pages: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - current) <= 2) out.push(p);
    else if (out.at(-1) !== "…") out.push("…");
  }
  return out;
}

const box = "inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border px-2 text-[14px] font-semibold tabular-nums";

/** sahibinden's numbered pages under the results, with Önceki / Sonraki at the ends. */
export function MarketPagination({ query, pages }: { query: MarketQuery; pages: number }) {
  if (pages <= 1) return null;
  const at = query.sayfa;
  return (
    <nav aria-label="Sayfalar" className="flex flex-wrap items-center justify-center gap-1.5">
      {at > 1 && (
        <Link href={marketHref(query, { sayfa: at - 1 })} rel="prev" className={`${box} gap-1 border-border bg-card text-primary hover:bg-secondary`}>
          <CaretLeftIcon aria-hidden="true" weight="bold" className="size-4" />
          Önceki
        </Link>
      )}
      {pageList(at, pages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} aria-hidden="true" className="px-1 text-muted-foreground">
            …
          </span>
        ) : p === at ? (
          <span key={p} aria-current="page" className={`${box} border-primary bg-primary text-primary-foreground`}>
            <span className="sr-only">Sayfa </span>
            {p}
          </span>
        ) : (
          <Link key={p} href={marketHref(query, { sayfa: p })} className={`${box} border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary`}>
            <span className="sr-only">Sayfa </span>
            {p}
          </Link>
        ),
      )}
      {at < pages && (
        <Link href={marketHref(query, { sayfa: at + 1 })} rel="next" className={`${box} gap-1 border-border bg-card text-primary hover:bg-secondary`}>
          Sonraki
          <CaretRightIcon aria-hidden="true" weight="bold" className="size-4" />
        </Link>
      )}
    </nav>
  );
}
