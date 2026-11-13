import Link from "next/link";
import { Suspense } from "react";
import { PlusIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { AdvertiseBox, SponsorBanner } from "@/components/home/AdSlots";
import { getSlots } from "@/lib/site-slots";
import { BorsaWeather } from "@/components/home/BorsaWeather";
import { NewsTicker } from "@/components/home/NewsTicker";
import { LiveSearch } from "@/components/search/LiveSearch";
import { ForumFeed } from "@/components/forum/ForumFeed";
import { siteConfig } from "@/config/site";
import { categoryHref } from "@/lib/forum";
import { categoryStats, forumCategories, sectionTotals } from "@/lib/forum-categories";
import { listTopics } from "@/lib/forum-data";
import { formatPrice } from "@/lib/market";
import { marketSummary } from "@/lib/market-data";
import { requestNow } from "@/lib/now";

/** How many of the newest ads the Pazar box lists: three on a phone, five on a wide screen. */
const PHONE_ADS = 3;

/**
 * The home page, in the Borsa design (chosen on /tasarimlar, no. 17): compact white boxes on the grey
 * page, Fira Code for figures. The same order on every screen: a thin search bar (results open under
 * it while typing), the sponsor and
 * "Bu alanda reklam vermek için" strips, the "Çiftçi destekleri & haberler" ticker, hava and Pazar
 * side by side, then the forum, which grows with "Daha fazla göster". From 1280 px the page widens:
 * the two ad strips share a line, hava shows five days, Pazar five ads, and the forum's sections sit
 * beside the topics.
 */
/** The sponsor and "reklam" strips as set in Yönetim → Reklam; a switched-off one leaves its place to the other. */
async function AdStrips() {
  const { sponsor, reklam } = await getSlots();
  const shown = [sponsor.enabled && <SponsorBanner key="s" slot={sponsor} />, reklam.enabled && <AdvertiseBox key="r" slot={reklam} />].filter(Boolean);
  if (!shown.length) return null;
  return <div className={`space-y-2 xl:gap-3 xl:space-y-0 ${shown.length === 2 ? "xl:grid xl:grid-cols-2" : ""}`}>{shown}</div>;
}

export function PortalHome() {
  return (
    <div className="text-[13px] leading-[1.45]">
      <div className="mx-auto max-w-3xl space-y-2 p-2 pb-4 sm:p-3 xl:max-w-6xl xl:space-y-3 xl:px-4 xl:py-4">
        <h1 className="sr-only">{siteConfig.name}: çiftçi forumu, pazar ve hava durumu</h1>
        <LiveSearch id="ana-ara" />
        <AdStrips />
        <Suspense>
          <NewsTicker />
        </Suspense>
        <div className="grid grid-cols-2 gap-2 xl:gap-3">
          <BorsaWeather />
          <Suspense fallback={<BoxSkeleton />}>
            <MarketBox />
          </Suspense>
        </div>
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start xl:gap-3">
          <Suspense fallback={<ForumSkeleton />}>
            <ForumBlock />
          </Suspense>
          <Suspense>
            <SectionsBox />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/** Pazar (Borsa): a Pazar logo, the live ad count with today's new ones, then the newest ads. */
async function MarketBox() {
  const summary = await marketSummary();
  return (
    <section aria-labelledby="pazar-baslik" className="flex h-full flex-col rounded-md border border-border bg-card">
      <div className="flex items-center gap-1.5 border-b border-border px-2.5 py-1.5">
        <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#ffe4e6]">
          <StorefrontIcon weight="fill" className="size-4 text-[#be123c]" />
        </span>
        <h2 id="pazar-baslik" className="text-[12.5px] font-bold xl:text-[13.5px]">
          <Link href="/pazar" className="hover:underline">
            Pazar
          </Link>
        </h2>
        {summary.today > 0 && (
          <span className="ml-auto font-borsa-mono text-[11px] font-semibold text-good">
            +{summary.today.toLocaleString("tr-TR")} bugün
          </span>
        )}
      </div>
      <Link href="/pazar" tabIndex={-1} aria-hidden="true" className="block px-2.5 pt-1.5">
        <span className="block font-borsa-mono text-[26px] font-semibold leading-tight">{summary.active.toLocaleString("tr-TR")}</span>
        <span className="block text-[11.5px] text-muted-foreground">aktif ilan</span>
      </Link>
      {summary.latest.length > 0 ? (
        <ul aria-label="En yeni ilanlar" className="mt-auto border-t border-border px-2.5 py-1">
          {summary.latest.map((l, i) => (
            <li key={l.id} className={i >= PHONE_ADS ? "max-xl:hidden" : undefined}>
              <Link href={`/pazar/ilan/${l.id}`} className="flex h-6 items-center gap-1.5 text-[11.5px] hover:underline xl:h-7 xl:text-[12.5px]">
                <span className="min-w-0 flex-1 truncate font-medium">{l.title}</span>
                <span className="shrink-0 font-borsa-mono font-semibold">{formatPrice(l.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Link href="/pazar/ilan-ver" className="mt-auto flex min-h-10 items-center border-t border-border px-2.5 text-[12px] font-semibold text-primary hover:underline">
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
    <section id="forum" aria-labelledby="forum-baslik" className="scroll-mt-16 overflow-hidden rounded-md border border-border bg-card">
      <ForumFeed
        initial={first}
        cats={cats}
        now={now.toISOString()}
        tabs
        dense
        heading={
          <h2 id="forum-baslik" className="mr-1.5 shrink-0 font-bold xl:text-[14px]">
            <Link href="/forum" className="hover:underline">
              Forum
            </Link>{" "}
            <span className="font-borsa-mono text-[11px] font-normal text-muted-foreground">
              {first.total.toLocaleString("tr-TR")}
              <span className="sr-only"> konu</span>
            </span>
          </h2>
        }
        action={
          <Link href="/forum/yeni" className="inline-flex min-h-8 items-center gap-0.5 rounded bg-create px-2 text-[12px] font-semibold text-create-foreground transition-colors hover:bg-[var(--create-hover)]">
            <PlusIcon aria-hidden="true" weight="bold" className="size-3.5" />
            Konu
            <span className="sr-only"> aç</span>
          </Link>
        }
      />
      <Link href="/forum" className="flex min-h-11 items-center justify-center border-t border-border text-[12.5px] font-semibold text-primary hover:underline">
        Forumun tamamı
      </Link>
    </section>
  );
}

/** Wide screens: the forum's sections beside the topics, each with its topic count. */
async function SectionsBox() {
  const [cats, stats] = await Promise.all([forumCategories(), categoryStats()]);
  return (
    <section aria-labelledby="bolumler-baslik" className="hidden overflow-hidden rounded-md border border-border bg-card xl:block">
      <h2 id="bolumler-baslik" className="flex min-h-11 items-center border-b border-border px-3 text-[14px] font-bold">
        Forum bölümleri
      </h2>
      <ul className="divide-y divide-border">
        {cats.sections.map((s) => {
          const total = sectionTotals(s, stats);
          return (
            <li key={s.id}>
              <Link href={categoryHref(s.id)} className="flex min-h-10 items-center gap-2 px-3 text-[13px] transition-colors hover:bg-muted/50">
                <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
                <span className="shrink-0 font-borsa-mono text-[11.5px] text-muted-foreground">
                  {total.topics.toLocaleString("tr-TR")}
                  <span className="sr-only"> konu</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function BoxSkeleton() {
  return <div aria-hidden="true" className="h-[9.5rem] rounded-md border border-border bg-card" />;
}

function ForumSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-md border border-border bg-card">
      <div className="h-11 border-b border-border" />
      <div className="space-y-3 p-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 rounded bg-muted motion-safe:animate-pulse" />
        ))}
      </div>
    </div>
  );
}
