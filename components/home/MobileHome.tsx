import Link from "next/link";
import { Suspense } from "react";
import { MagnifyingGlassIcon, PlusIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { AdvertiseBox, SponsorBanner } from "@/components/home/AdSlots";
import { BorsaWeather } from "@/components/home/BorsaWeather";
import { borsaMono, borsaSans } from "@/components/home/fonts";
import { NewsTicker } from "@/components/home/NewsTicker";
import { ForumFeed } from "@/components/forum/ForumFeed";
import { siteConfig } from "@/config/site";
import { forumCategories } from "@/lib/forum-categories";
import { listTopics } from "@/lib/forum-data";
import { formatPrice } from "@/lib/market";
import { marketSummary } from "@/lib/market-data";
import { requestNow } from "@/lib/now";

/**
 * The home page on phones and tablets, in the Borsa design (chosen on /tasarimlar, no. 17): a light
 * grey page of compact white boxes, Fira Sans with Fira Code for figures. In order: a thin search bar,
 * the sponsor and "Bu alanda reklam vermek için" strips, the "Çiftçi destekleri & haberler" ticker,
 * hava and Pazar side by side, then the forum, which grows with "Daha fazla göster".
 */
export function MobileHome() {
  return (
    <div
      className={`${borsaSans.className} ${borsaMono.variable} min-h-full bg-[#f1f3f5] text-[13px] leading-[1.45] text-[#111827] [&_:is(h1,h2,h3)]:font-[inherit] [&_:is(h1,h2,h3)]:tracking-normal`}
    >
      <div className="mx-auto max-w-3xl space-y-2 p-2 pb-4 sm:p-3">
        <h1 className="sr-only">{siteConfig.name}: çiftçi forumu, pazar ve hava durumu</h1>
        <HomeSearch />
        <SponsorBanner />
        <AdvertiseBox />
        <Suspense>
          <NewsTicker />
        </Suspense>
        <div className="grid grid-cols-2 gap-2">
          <BorsaWeather />
          <Suspense fallback={<BoxSkeleton />}>
            <MarketBox />
          </Suspense>
        </div>
        <Suspense fallback={<ForumSkeleton />}>
          <ForumBlock />
        </Suspense>
      </div>
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
      <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#4b5563]" />
      <input
        id="ana-ara"
        name="q"
        type="search"
        enterKeyHint="search"
        placeholder="Forumda ve Pazar’da ara"
        className="h-10 w-full rounded-md border border-[#dfe3e8] bg-white pl-8 pr-3 text-base text-[#111827] outline-none transition-colors placeholder:text-[#4b5563] focus:border-[#1d4ed8] focus-visible:ring-2 focus-visible:ring-[#1d4ed8]/25"
      />
    </form>
  );
}

/** Pazar (Borsa): a Pazar logo, the live ad count with today's new ones, then the three newest ads. */
async function MarketBox() {
  const summary = await marketSummary();
  return (
    <section aria-labelledby="pazar-baslik" className="flex h-full flex-col rounded-md border border-[#dfe3e8] bg-white">
      <div className="flex items-center gap-1.5 border-b border-[#dfe3e8] px-2.5 py-1.5">
        <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#ffe4e6]">
          <StorefrontIcon weight="fill" className="size-4 text-[#be123c]" />
        </span>
        <h2 id="pazar-baslik" className="text-[12.5px] font-bold">
          <Link href="/pazar" className="hover:underline">
            Pazar
          </Link>
        </h2>
        {summary.today > 0 && (
          <span className="ml-auto font-borsa-mono text-[11px] font-semibold text-[#15803d]">
            +{summary.today.toLocaleString("tr-TR")} bugün
          </span>
        )}
      </div>
      <Link href="/pazar" tabIndex={-1} aria-hidden="true" className="block px-2.5 pt-1.5">
        <span className="block font-borsa-mono text-[26px] font-semibold leading-tight">{summary.active.toLocaleString("tr-TR")}</span>
        <span className="block text-[11.5px] text-[#4b5563]">aktif ilan</span>
      </Link>
      {summary.latest.length > 0 ? (
        <ul aria-label="En yeni ilanlar" className="mt-auto border-t border-[#dfe3e8] px-2.5 py-1">
          {summary.latest.map((l) => (
            <li key={l.id}>
              <Link href={`/pazar/${l.id}`} className="flex h-6 items-center gap-1.5 text-[11.5px] hover:underline">
                <span className="min-w-0 flex-1 truncate font-medium">{l.title}</span>
                <span className="shrink-0 font-borsa-mono font-semibold">{formatPrice(l.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Link href="/pazar/ilan-ver" className="mt-auto flex min-h-10 items-center border-t border-[#dfe3e8] px-2.5 text-[12px] font-semibold text-[#1d4ed8] hover:underline">
          İlk ilanı siz verin →
        </Link>
      )}
    </section>
  );
}

/** The forum (Borsa): one header row with the topic count, three orders and a red "+ Konu", then dense rows. */
async function ForumBlock() {
  const [cats, first, now] = await Promise.all([forumCategories(), listTopics({ q: "", kategori: "tumu", sirala: "yeni", sayfa: 1 }), requestNow()]);
  return (
    <section id="forum" aria-labelledby="forum-baslik" className="scroll-mt-16 overflow-hidden rounded-md border border-[#dfe3e8] bg-white">
      <ForumFeed
        initial={first}
        cats={cats}
        now={now.toISOString()}
        tabs
        dense
        heading={
          <h2 id="forum-baslik" className="mr-1.5 shrink-0 font-bold">
            <Link href="/forum" className="hover:underline">
              Forum
            </Link>{" "}
            <span className="font-borsa-mono text-[11px] font-normal text-[#4b5563]">
              {first.total.toLocaleString("tr-TR")}
              <span className="sr-only"> konu</span>
            </span>
          </h2>
        }
        action={
          <Link href="/forum/yeni" className="inline-flex min-h-8 items-center gap-0.5 rounded bg-[#dc2626] px-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#b91c1c]">
            <PlusIcon aria-hidden="true" weight="bold" className="size-3.5" />
            Konu
            <span className="sr-only"> aç</span>
          </Link>
        }
      />
      <Link href="/forum" className="flex min-h-11 items-center justify-center border-t border-[#dfe3e8] text-[12.5px] font-semibold text-[#1d4ed8] hover:underline">
        Forumun tamamı
      </Link>
    </section>
  );
}

function BoxSkeleton() {
  return <div aria-hidden="true" className="h-[9.5rem] rounded-md border border-[#dfe3e8] bg-white" />;
}

function ForumSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-md border border-[#dfe3e8] bg-white">
      <div className="h-11 border-b border-[#dfe3e8]" />
      <div className="space-y-3 p-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 rounded bg-[#eef0f3] motion-safe:animate-pulse" />
        ))}
      </div>
    </div>
  );
}
