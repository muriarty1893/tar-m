import Link from "next/link";
import { Suspense } from "react";
import { ChatsTeardropIcon, MagnifyingGlassIcon, NotePencilIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { AdvertiseBox, SponsorBanner } from "@/components/home/AdSlots";
import { WeatherTile } from "@/components/home/WeatherTile";
import { AllTopicsLink, ForumFeed } from "@/components/forum/ForumFeed";
import { sectionTone } from "@/components/forum/parts";
import { siteConfig } from "@/config/site";
import { categoryHref } from "@/lib/forum";
import { forumCategories } from "@/lib/forum-categories";
import { listTopics } from "@/lib/forum-data";
import { formatPrice } from "@/lib/market";
import { marketSummary } from "@/lib/market-data";
import { requestNow } from "@/lib/now";

/**
 * The home page on phones and tablets: a portal in the spirit of r10.net, built like the app's home
 * screen. A thin search bar, the sponsor and "Reklam vermek için" spaces, today's weather and Pazar side
 * by side, then the forum, which grows with "Daha fazla göster".
 */
export function MobileHome() {
  return (
    <div className="mx-auto max-w-3xl space-y-3 pb-6 pt-3">
      <h1 className="sr-only">{siteConfig.name}: çiftçi forumu, pazar ve hava durumu</h1>
      <div className="space-y-3 px-3">
        <HomeSearch />
        <SponsorBanner />
        <AdvertiseBox />
        <div className="grid grid-cols-2 gap-2.5">
          <WeatherTile />
          <Suspense fallback={<TileSkeleton />}>
            <MarketTile />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<ForumSkeleton />}>
        <ForumBlock />
      </Suspense>
    </div>
  );
}

/** One thin line: search the forum and Pazar at once (/ara). */
function HomeSearch() {
  return (
    <form role="search" aria-label="Sitede ara" action="/ara" className="relative">
      <label htmlFor="ana-ara" className="sr-only">
        Forumda ve Pazar’da ara
      </label>
      <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
      <input
        id="ana-ara"
        name="q"
        type="search"
        enterKeyHint="search"
        placeholder="Forumda ve Pazar’da ara…"
        className="h-11 w-full rounded-full border border-input bg-muted/60 pl-11 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background focus-visible:ring-4 focus-visible:ring-ring/20"
      />
    </form>
  );
}

async function MarketTile() {
  const summary = await marketSummary();
  return (
    <Link href="/pazar" className="group flex h-full min-w-0 items-center rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-secondary">
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <StorefrontIcon aria-hidden="true" weight="duotone" className="size-6 shrink-0 text-rose-700" />
          <span className="text-sm font-semibold text-muted-foreground">Pazar</span>
          <span className="ml-auto whitespace-nowrap font-heading text-lg font-bold leading-none tabular-nums">
            {summary.active.toLocaleString("tr-TR")}
            <span className="ml-0.5 font-sans text-xs font-semibold text-muted-foreground"> ilan</span>
          </span>
        </span>
        <span className="mt-0.5 block truncate text-sm font-semibold leading-snug text-foreground">
          {summary.newest ? (
            <>
              <span className="sr-only">En yeni ilan: </span>
              {summary.newest.title} · {formatPrice(summary.newest.price)}
            </>
          ) : (
            "İlk ilanı siz verin"
          )}
        </span>
      </span>
    </Link>
  );
}

/** The forum, r10-style: a dark title bar with "Konu aç", the sections to jump to, then the topics. */
async function ForumBlock() {
  const [cats, first, now] = await Promise.all([forumCategories(), listTopics({ q: "", kategori: "tumu", sirala: "yeni", sayfa: 1 }), requestNow()]);
  return (
    <section id="forum" aria-labelledby="forum-baslik" className="scroll-mt-16 overflow-hidden border-y border-border bg-card sm:mx-3 sm:rounded-xl sm:border-x">
      <div className="flex items-center justify-between gap-3 bg-[var(--bar)] px-4 py-2.5 text-[var(--bar-fg)]">
        <h2 id="forum-baslik" className="flex items-center gap-2 text-lg font-bold">
          <ChatsTeardropIcon aria-hidden="true" weight="fill" className="size-6 text-leaf" />
          Forum
        </h2>
        <Link href="/forum/yeni" className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--btn-radius)] bg-[var(--bar-cta)] px-3 text-sm font-bold text-[var(--bar-cta-fg)] transition-colors hover:bg-[color-mix(in_oklab,var(--bar-cta),black_12%)]">
          <NotePencilIcon aria-hidden="true" weight="bold" className="size-4" />
          Konu aç
        </Link>
      </div>
      <nav aria-label="Forum bölümleri" className="border-b border-border">
        <ul className="flex gap-1.5 overflow-x-auto px-3 py-2.5 [scrollbar-width:none]">
          {cats.sections.map((s) => (
            <li key={s.id} className="shrink-0">
              <Link href={categoryHref(s.id)} className={`inline-flex min-h-9 items-center rounded-md px-2.5 text-sm font-semibold transition-opacity hover:opacity-80 ${sectionTone(s.id)}`}>
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <ForumFeed initial={first} cats={cats} now={now.toISOString()} tabs />
      <AllTopicsLink />
    </section>
  );
}

function TileSkeleton() {
  return <div aria-hidden="true" className="h-[4.25rem] rounded-xl border border-border bg-muted/50" />;
}

function ForumSkeleton() {
  return (
    <div aria-hidden="true" className="border-y border-border sm:mx-3 sm:rounded-xl sm:border-x">
      <div className="h-12 bg-[var(--bar)] opacity-90" />
      <div className="space-y-3 p-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted motion-safe:animate-pulse" />
        ))}
      </div>
    </div>
  );
}
