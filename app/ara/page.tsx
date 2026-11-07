import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { TopicList } from "@/components/forum/TopicList";
import { box, boxHeader } from "@/components/forum/ForumSections";
import { ListingRow } from "@/components/market/ListingRow";
import { forumCategories } from "@/lib/forum-categories";
import { listTopics } from "@/lib/forum-data";
import { listListings } from "@/lib/market-data";
import { parseMarketQuery } from "@/lib/market";
import { requestNow } from "@/lib/now";

export const metadata: Metadata = { title: "Ara", robots: { index: false } };

/** The home page's search: forum topics and Pazar listings for the same words. */
export default function SearchPage({ searchParams }: PageProps<"/ara">) {
  return (
    <div className="mx-auto max-w-3xl pb-8 pt-3 sm:px-4 sm:pt-8">
      <Suspense fallback={<div aria-hidden="true" className="mx-3 h-96 rounded-xl bg-muted motion-safe:animate-pulse sm:mx-0" />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/ara">["searchParams"] }) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 80);
  const [cats, now] = await Promise.all([forumCategories(), requestNow()]);
  const [topics, listings] = q
    ? await Promise.all([listTopics({ q, kategori: "tumu", sirala: "yeni", sayfa: 1 }), listListings(parseMarketQuery({ q }), null)])
    : [{ items: [], total: 0 }, { items: [], total: 0 }];
  const enc = encodeURIComponent(q);

  return (
    <div className="space-y-3">
      <form role="search" aria-label="Sitede ara" action="/ara" className="relative px-2 sm:px-0">
        <label htmlFor="ara-q" className="sr-only">
          Forumda ve Pazar’da ara
        </label>
        <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="pointer-events-none absolute left-4.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground sm:left-2.5" />
        <input
          id="ara-q"
          name="q"
          type="search"
          defaultValue={q}
          enterKeyHint="search"
          placeholder="Forumda ve Pazar’da ara…"
          className="h-11 w-full rounded-md border border-border bg-card pl-8 pr-3 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/25"
        />
      </form>

      {!q ? (
        <p className="px-3 text-muted-foreground sm:px-0">Aradığınız kelimeleri yazın: “buğday tohumu”, “traktör”, “süt verimi”…</p>
      ) : (
        <>
          <h1 className="px-3 text-xl font-bold sm:px-0">“{q}” için sonuçlar</h1>
          <section aria-labelledby="ara-forum" className={box}>
            <h2 id="ara-forum" className={boxHeader}>
              <span>Forum</span>
              <span className="text-[12px] font-medium text-muted-foreground">{topics.total.toLocaleString("tr-TR")} konu</span>
            </h2>
            {topics.items.length ? (
              <TopicList items={topics.items.slice(0, 8)} cats={cats} now={now} framed={false} />
            ) : (
              <p className="px-4 py-6 text-center text-muted-foreground">Forumda bu kelimelerle konu yok.</p>
            )}
            {topics.total > 8 && (
              <Link href={`/forum?q=${enc}`} className="flex min-h-11 items-center justify-center border-t border-border text-[13px] font-semibold text-primary underline-offset-4 hover:underline">
                Forumdaki tüm sonuçlar
              </Link>
            )}
          </section>
          <section aria-labelledby="ara-pazar" className={box}>
            <h2 id="ara-pazar" className={boxHeader}>
              <span>Pazar</span>
              <span className="text-[12px] font-medium text-muted-foreground">{listings.total.toLocaleString("tr-TR")} ilan</span>
            </h2>
            {listings.items.length ? (
              <ul className="divide-y divide-border">
                {listings.items.slice(0, 8).map((l) => (
                  <ListingRow key={l.id} listing={l} now={now} />
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-center text-muted-foreground">Pazar’da bu kelimelerle ilan yok.</p>
            )}
            {listings.total > 8 && (
              <Link href={`/pazar?q=${enc}`} className="flex min-h-11 items-center justify-center border-t border-border text-[13px] font-semibold text-primary underline-offset-4 hover:underline">
                Pazar’daki tüm sonuçlar
              </Link>
            )}
          </section>
        </>
      )}
    </div>
  );
}
