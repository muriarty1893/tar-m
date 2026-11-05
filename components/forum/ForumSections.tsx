import Link from "next/link";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { sectionBar } from "@/components/forum/parts";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryHref, type ForumCats } from "@/lib/forum";
import { sectionTotals, type CategoryStats } from "@/lib/forum-categories";
import { agoLabel } from "@/lib/tr-time";

/** A forum box: edge to edge on a phone, a rounded card from 640 px. */
export const box = "overflow-hidden border-y border-border bg-card sm:rounded-xl sm:border-x";
/** The box's dark title bar, as on r10.net. */
export const boxHeader = "flex items-center justify-between gap-3 bg-[var(--bar)] px-4 py-2.5 text-sm font-bold text-[var(--bar-fg)]";

/** The forum's search box: words in titles and texts. */
export function ForumSearch({ q = "" }: { q?: string }) {
  return (
    <form role="search" aria-label="Forumda ara" action="/forum" className="flex gap-2 px-3 sm:px-0">
      <label htmlFor="forum-ara" className="sr-only">
        Forumda ara
      </label>
      <div className="relative flex-1">
        <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input id="forum-ara" name="q" type="search" defaultValue={q} placeholder="Buğday tohumu, süt verimi, mazot desteği…" enterKeyHint="search" className="min-h-12 pl-11" />
      </div>
      <button type="submit" className={buttonVariants({ variant: "outline", className: "min-h-12" })}>
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
        <span aria-hidden="true" className="font-semibold opacity-80">
          Konu · Yanıt
        </span>
      </h2>
      <ul className="divide-y divide-border">
        {cats.sections.map((s) => {
          const total = sectionTotals(s, stats);
          return (
            <li key={s.id}>
              <Link href={categoryHref(s.id)} className="flex items-stretch gap-3 px-4 py-3 transition-colors hover:bg-secondary focus-visible:outline-offset-[-3px]">
                <span aria-hidden="true" className={`w-1 shrink-0 rounded-full ${sectionBar(s.id)}`} />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-snug">{s.name}</span>
                  {s.description && !compact && <span className="block truncate text-sm text-muted-foreground">{s.description}</span>}
                  {total.last && (
                    <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                      <span className="sr-only">Son konu: </span>
                      <span className="font-medium text-foreground/80">{total.last.title}</span> · {agoLabel(new Date(total.last.at), now)}
                    </span>
                  )}
                </span>
                <span className="shrink-0 self-center text-right text-sm leading-5 tabular-nums">
                  <span className="block font-bold">{total.topics.toLocaleString("tr-TR")}</span>
                  <span className="block text-muted-foreground">{total.replies.toLocaleString("tr-TR")}</span>
                  <span className="sr-only">
                    {total.topics} konu, {total.replies} yanıt
                  </span>
                </span>
              </Link>
              {s.children.length > 0 && (
                <ul aria-label={`${s.name}: alt kategoriler`} className="flex flex-wrap gap-1.5 px-4 pb-3 pl-8">
                  {s.children.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={categoryHref(c.id)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border px-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-secondary"
                      >
                        {c.name}
                        <span className="text-xs text-muted-foreground tabular-nums">{(stats[c.id]?.topics ?? 0).toLocaleString("tr-TR")}</span>
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

