import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  CaretRightIcon,
  ChatsCircleIcon,
  CheckCircleIcon,
  GearSixIcon,
  GrainsIcon,
  PlantIcon,
  PlusIcon,
  SquaresFourIcon,
  StorefrontIcon,
  TractorIcon,
  WrenchIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { ListingCard } from "@/components/market/ListingCard";
import { ListingRow } from "@/components/market/ListingRow";
import { MarketFilters } from "@/components/market/MarketFilters";
import { SafetyNote } from "@/components/market/SafetyNote";
import { buttonVariants } from "@/components/ui/button";
import { getUserId } from "@/lib/auth";
import { CATEGORIES, categoryLabel, marketHref, parseMarketQuery, type CategoryId, type MarketQuery, type MarketView } from "@/lib/market";
import { PAGE_SIZE, listListings, marketSummary } from "@/lib/market-data";
import { requestNow } from "@/lib/now";

export const metadata: Metadata = {
  title: "Pazar",
  description: "Çiftçiden çiftçiye pazar: ürün, tohum ve gübre, el aletleri, ekipman ve araç ilanları. Satıcıyla site içinden mesajlaşın, teklif verin.",
};

export default function MarketPage({ searchParams }: PageProps<"/pazar">) {
  return (
    <>
      {/* Phones: straight to the search (sahibinden-style); the title band is for wide screens. */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-3 py-2.5 xl:hidden">
        <h1 className="text-xl font-bold tracking-tight">Pazar</h1>
        <div className="flex gap-2">
          <Link href="/mesajlar" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ChatsCircleIcon aria-hidden="true" weight="duotone" />
            Mesajlar
          </Link>
          <Link href="/pazar/ilan-ver" className={buttonVariants({ variant: "create", size: "sm" })}>
            <PlusIcon aria-hidden="true" weight="bold" />
            İlan ver
          </Link>
        </div>
      </div>
      <div className="max-xl:hidden">
      <ToolHeader
        eyebrow="Pazar"
        title="Çiftçi Pazarı"
        intro="Ürününüzü, tohumunuzu, aletinizi ya da aracınızı ilan edin; alıcıyla site içinden mesajlaşın. Ödeme ve teslim yüz yüze yapılır."
        actions={
          <>
            <Link href="/pazar/ilan-ver" className={buttonVariants({ variant: "create" })}>
              <PlusIcon aria-hidden="true" weight="bold" />
              İlan ver
            </Link>
            <Link href="/mesajlar" className={buttonVariants({ variant: "outline" })}>
              <ChatsCircleIcon aria-hidden="true" weight="duotone" />
              Mesajlar
            </Link>
          </>
        }
      />
      </div>
      <div className="mx-auto max-w-6xl py-3 xl:px-4 xl:py-8">
        <Suspense fallback={<MarketSkeleton />}>
          <Market searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

const VIEWS: { id: MarketView; label: string }[] = [
  { id: "tumu", label: "Tüm ilanlar" },
  { id: "favoriler", label: "Favorilerim" },
  { id: "ilanlarim", label: "İlanlarım" },
];

/** Each category's picture in the phone's category list. */
const CATEGORY_ICON: Record<Exclude<CategoryId, "tumu">, typeof PlantIcon> = {
  urun: GrainsIcon,
  tohum: PlantIcon,
  alet: WrenchIcon,
  ekipman: GearSixIcon,
  arac: TractorIcon,
};

async function Market({ searchParams }: { searchParams: PageProps<"/pazar">["searchParams"] }) {
  const sp = await searchParams;
  const query = parseMarketQuery(sp);
  const userId = await getUserId();
  const [{ items, total }, summary, now] = await Promise.all([listListings(query, userId), marketSummary(), requestNow()]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const removed = sp.kaldirildi === "1";
  // Browsing everything (no category, words or place): the phone shows the category list first.
  const browsing = query.gorunum === "tumu" && query.kategori === "tumu" && !query.q && !query.il && query.sayfa === 1;

  return (
    <div className="space-y-4 xl:space-y-6">
      {removed && (
        <p role="status" className="mx-3 flex items-center gap-2 rounded-xl border border-primary/30 bg-secondary px-4 py-3 font-semibold xl:mx-0">
          <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 text-primary" />
          İlanınız kaldırıldı.
        </p>
      )}

      {userId && (
        <nav aria-label="İlan görünümü" className="px-3 xl:px-0">
          <ul className="grid grid-cols-3 gap-1 rounded-[var(--btn-radius)] bg-muted p-1 xl:flex xl:flex-wrap xl:gap-2 xl:bg-transparent xl:p-0">
            {VIEWS.map((v) => (
              <li key={v.id}>
                <Link
                  href={marketHref(query, { gorunum: v.id })}
                  aria-current={query.gorunum === v.id ? "page" : undefined}
                  className="flex min-h-10 items-center justify-center rounded-[calc(var(--btn-radius)-2px)] px-2 text-sm font-semibold text-muted-foreground transition-colors aria-[current=page]:bg-card aria-[current=page]:text-foreground aria-[current=page]:shadow-soft xl:min-h-11 xl:rounded-full xl:border-2 xl:border-border xl:px-4 xl:text-base xl:text-foreground xl:hover:border-primary/50 xl:aria-[current=page]:border-primary xl:aria-[current=page]:bg-primary xl:aria-[current=page]:text-primary-foreground"
                >
                  {v.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="px-3 xl:px-0">
        <MarketFilters query={query} />
      </div>

      {/* Phones: sahibinden's category list, with live counts. */}
      {browsing && (
        <nav aria-label="Kategoriler" className="border-y border-border bg-card xl:hidden">
          <p className="border-b border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Kategoriler</p>
          <ul className="divide-y divide-border">
            {CATEGORIES.filter((c) => c.id !== "tumu").map((c) => {
              const Icon = CATEGORY_ICON[c.id as Exclude<CategoryId, "tumu">];
              return (
                <li key={c.id}>
                  <Link href={marketHref(query, { kategori: c.id })} className="flex min-h-11 items-center gap-3 px-4 transition-colors hover:bg-secondary">
                    <Icon aria-hidden="true" weight="duotone" className="size-6 shrink-0 text-primary" />
                    <span className="flex-1 font-semibold">{c.label}</span>
                    <span className="text-sm text-muted-foreground tabular-nums">({(summary.byCategory[c.id] ?? 0).toLocaleString("tr-TR")})</span>
                    <CaretRightIcon aria-hidden="true" weight="bold" className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Phones, in a category: where you are, and the way back to all. */}
      {query.kategori !== "tumu" && (
        <div className="flex items-center gap-2 px-3 xl:hidden">
          <SquaresFourIcon aria-hidden="true" weight="duotone" className="size-5 text-primary" />
          <span className="text-sm text-muted-foreground">Pazar ›</span>
          <span className="font-semibold">{categoryLabel(query.kategori)}</span>
          <Link href={marketHref(query, { kategori: "tumu" })} aria-label="Kategoriyi kaldır" className="ml-auto inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
            <XIcon aria-hidden="true" weight="bold" className="size-5" />
          </Link>
        </div>
      )}

      <nav aria-label="Kategoriler" className="max-xl:hidden">
        <ul className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link
                href={marketHref(query, { kategori: c.id })}
                aria-current={query.kategori === c.id ? "page" : undefined}
                className="inline-flex min-h-9 items-center rounded-md border border-border bg-card px-3 text-sm font-medium transition-colors hover:border-primary/40 aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <SafetyNote className="max-xl:hidden" />

      <p className="px-3 font-semibold xl:hidden" aria-live="polite">
        {total === 0 ? "İlan bulunamadı." : browsing ? "Son ilanlar" : `${total.toLocaleString("tr-TR")} ilan`}
        {pages > 1 && <span className="font-normal text-muted-foreground">{` · Sayfa ${query.sayfa} / ${pages}`}</span>}
      </p>
      <p className="text-muted-foreground max-xl:hidden" aria-live="polite">
        {total === 0 ? "İlan bulunamadı." : `${total.toLocaleString("tr-TR")} ilan`}
        {pages > 1 && ` · Sayfa ${query.sayfa} / ${pages}`}
      </p>

      {items.length === 0 ? (
        <div className="px-3 xl:px-0">
          <EmptyState query={query} signedIn={Boolean(userId)} />
        </div>
      ) : (
        <>
          <ul className="divide-y divide-border border-y border-border bg-card xl:hidden">
            {items.map((l) => (
              <ListingRow key={l.id} listing={l} now={now} mine={l.sellerId === userId} />
            ))}
          </ul>
          <ul className="grid grid-cols-4 gap-4 max-xl:hidden">
            {items.map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} now={now} mine={l.sellerId === userId} />
              </li>
            ))}
          </ul>
        </>
      )}

      {pages > 1 && (
        <nav aria-label="Sayfalar" className="flex items-center justify-between gap-3 px-3 pt-2 xl:px-0 xl:pt-4">
          {query.sayfa > 1 ? (
            <Link href={marketHref(query, { sayfa: query.sayfa - 1 })} className={buttonVariants({ variant: "outline" })}>
              Önceki sayfa
            </Link>
          ) : (
            <span />
          )}
          {query.sayfa < pages && (
            <Link href={marketHref(query, { sayfa: query.sayfa + 1 })} className={buttonVariants({ variant: "outline" })}>
              Sonraki sayfa
            </Link>
          )}
        </nav>
      )}

      <SafetyNote className="mx-3 text-sm xl:hidden" />
    </div>
  );
}

function EmptyState({ query, signedIn }: { query: MarketQuery; signedIn: boolean }) {
  const filtered = query.q || query.il || query.kategori !== "tumu";
  const text =
    query.gorunum === "favoriler"
      ? "Henüz favori ilanınız yok. Beğendiğiniz ilanlardaki kalbe dokunun, burada toplansın."
      : query.gorunum === "ilanlarim"
        ? "Henüz ilanınız yok. İlk ilanınızı birkaç dakikada verebilirsiniz."
        : filtered
          ? "Bu aramaya uygun ilan yok. Filtreleri temizleyin ya da başka bir kelime deneyin."
          : "Pazar yeni açıldı, henüz ilan yok. İlk ilanı siz verin!";
  return (
    <div className="rounded-lg border border-dashed border-input px-4 py-6 text-center">
      <StorefrontIcon aria-hidden="true" weight="duotone" className="mx-auto size-12 text-primary" />
      <p className="mx-auto mt-3 max-w-md text-lg">{text}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {filtered && query.gorunum === "tumu" && (
          <Link href="/pazar" className={buttonVariants({ variant: "outline" })}>
            Filtreleri temizle
          </Link>
        )}
        {query.gorunum === "favoriler" ? (
          <Link href="/pazar" className={buttonVariants()}>
            Pazara göz at
          </Link>
        ) : (
          <Link href={signedIn ? "/pazar/ilan-ver" : "/giris?redirect_url=%2Fpazar%2Filan-ver"} className={buttonVariants({ variant: "create" })}>
            İlan ver
          </Link>
        )}
      </div>
    </div>
  );
}

function MarketSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-6 px-3 xl:px-0">
      <div className="h-12 rounded-lg bg-muted motion-safe:animate-pulse" />
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <span key={c.id} className="h-9 w-20 rounded-md bg-muted" />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="aspect-[4/3] bg-muted motion-safe:animate-pulse" />
            <div className="space-y-2 p-3">
              <div className="h-5 w-2/3 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
