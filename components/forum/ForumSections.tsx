import Link from "next/link";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { sectionBar } from "@/components/forum/parts";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryHref, type ForumCats } from "@/lib/forum";
import { sectionTotals, type CategoryStats } from "@/lib/forum-categories";
import { agoLabel } from "@/lib/tr-time";

/** A forum box (Borsa): a white card with a hairline, edge to edge on a phone. */
export const box = "overflow-hidden border-y border-border bg-card sm:rounded-md sm:border-x";
/** The box's title row: white, bold, a hairline under it. */
export const boxHeader = "flex min-h-11 items-center justify-between gap-3 border-b border-[var(--bar-line)] bg-[var(--bar)] px-3 text-[14px] font-bold text-[var(--bar-fg)]";

/** The forum's search box: words in titles and texts. */
export function ForumSearch({ q = "" }: { q?: string }) {
  return (
    <form role="search" aria-label="Forumda ara" action="/forum" className="flex gap-2 px-3 sm:px-0">
      <label htmlFor="forum-ara" className="sr-only">
        Forumda ara
      </label>
      <div className="relative flex-1">
        <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="forum-ara" name="q" type="search" defaultValue={q} placeholder="Buğday tohumu, süt verimi, mazot desteği…" enterKeyHint="search" className="pl-9" />
      </div>
      <button type="submit" className={buttonVariants({ variant: "outline" })}>
        Ara
      </button>
    </form>
  );
}

/** r10-style category boxes: each section with its figures and latest topic, its sub-categories under it. */
export function Sections({ cats, stats, now, compact = false }: { cats: ForumCats; stats: Record<string, CategoryStats>; now: Date; compact?: boolean }) {
  return (
    <section aria-labelledby="kategoriler" className={box}>
      <h2 id="kategoriler" className={boxHeader}>
        <span>Kategoriler</span>
        <span aria-hidden="true" className="text-[12px] font-medium text-muted-foreground">
          Konu · Yanıt
        </span>
      </h2>
      <ul className="divide-y divide-border">
        {cats.sections.map((s) => {
          const total = sectionTotals(s, stats);
          return (
            <li key={s.id}>
              <Link href={categoryHref(s.id)} className="flex items-stretch gap-2.5 px-3 py-2 transition-colors hover:bg-muted/50 focus-visible:outline-offset-[-3px]">
                <span aria-hidden="true" className={`w-1 shrink-0 rounded-full ${sectionBar(s.id)}`} />
                <span className="min-w-0 flex-1 text-[13px] leading-[1.45]">
                  <span className="block text-[14px] font-semibold">{s.name}</span>
                  {s.description && !compact && <span className="block truncate text-[12px] text-muted-foreground">{s.description}</span>}
                  {total.last && (
                    <span className="block truncate text-[12px] text-muted-foreground">
                      <span className="sr-only">Son konu: </span>
                      <span className="font-medium text-foreground/80">{total.last.title}</span> · {agoLabel(new Date(total.last.at), now)}
                    </span>
                  )}
                </span>
                <span className="font-borsa-mono shrink-0 self-center text-right text-[12px] leading-5">
                  <span className="block font-bold">{total.topics.toLocaleString("tr-TR")}</span>
                  <span className="block text-muted-foreground">{total.replies.toLocaleString("tr-TR")}</span>
                  <span className="sr-only">
                    {total.topics} konu, {total.replies} yanıt
                  </span>
                </span>
              </Link>
              {s.children.length > 0 && (
                <ul aria-label={`${s.name}: alt kategoriler`} className="flex flex-wrap gap-1.5 px-3 pb-2.5 pl-7">
                  {s.children.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={categoryHref(c.id)}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border px-2 text-[12.5px] font-medium transition-colors hover:border-primary/40 hover:bg-secondary bg-card"
                      >
                        {c.name}
                        <span className="font-borsa-mono text-[11px] text-muted-foreground">{(stats[c.id]?.topics ?? 0).toLocaleString("tr-TR")}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

