import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { NewsCard } from "@/components/NewsCard";
import { LiveSearch } from "@/components/search/LiveSearch";
import { TopicList } from "@/components/forum/TopicList";
import { box, boxHeader } from "@/components/forum/ForumSections";
import { ListingRow } from "@/components/market/ListingRow";
import { forumCategories } from "@/lib/forum-categories";
import { listTopics } from "@/lib/forum-data";
import { listListings } from "@/lib/market-data";
import { parseMarketQuery } from "@/lib/market";
import { requestNow } from "@/lib/now";
import { searchNews, searchReplies } from "@/lib/search-data";
import { agoLabel } from "@/lib/tr-time";

export const metadata: Metadata = { title: "Ara", robots: { index: false } };

/** The search box's full results: forum topics, replies, Pazar listings and news for the same words. */
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
  const [topics, listings, replies, news] = q
    ? await Promise.all([listTopics({ q, kategori: "tumu", sirala: "yeni", sayfa: 1 }), listListings(parseMarketQuery({ q }), null), searchReplies(q, 8), searchNews(q, 6)])
    : [{ items: [], total: 0 }, { items: [], total: 0 }, [], []];
  const enc = encodeURIComponent(q);

  return (
    <div className="space-y-3">
      <LiveSearch id="ara-q" defaultValue={q} className="mx-2 sm:mx-0" />

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
          <section aria-labelledby="ara-yanitlar" className={box}>
            <h2 id="ara-yanitlar" className={boxHeader}>
              <span>Yanıtlar</span>
              <span className="text-[12px] font-medium text-muted-foreground">{replies.length === 8 ? "8+" : replies.length} yanıt</span>
            </h2>
            {replies.length ? (
              <ul className="divide-y divide-border text-[13px] leading-[1.45]">
                {replies.map((r) => (
                  <li key={r.id}>
                    <Link href={`/forum/${r.topicId}#yanit-${r.id}`} className="block px-3 py-2 transition-colors hover:bg-muted/50">
                      <span className="block font-medium">{r.snippet}</span>
                      <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                        {r.authorName} · “{r.topicTitle}” · {agoLabel(new Date(r.createdAt), now)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-center text-muted-foreground">Yanıtlarda bu kelimeler yok.</p>
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
          <section aria-labelledby="ara-haberler" className={box}>
            <h2 id="ara-haberler" className={boxHeader}>
              <span>Haberler</span>
              <span className="text-[12px] font-medium text-muted-foreground">{news.length} haber</span>
            </h2>
            {news.length ? (
              <ul className="divide-y divide-border">
                {news.map((a) => (
                  <li key={a.slug}>
                    <NewsCard article={a} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-center text-muted-foreground">Haberlerde bu kelimeler yok.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
