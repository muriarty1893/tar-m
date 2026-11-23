import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import {
  CaretRightIcon,
  ChatsCircleIcon,
  CheckCircleIcon,
  FunnelIcon,
  GearSixIcon,
  GrainsIcon,
  ListBulletsIcon,
  PlantIcon,
  PlusIcon,
  SquaresFourIcon,
  StorefrontIcon,
  TractorIcon,
  WrenchIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { ListingCard } from "@/components/market/ListingCard";
import { ListingRow } from "@/components/market/ListingRow";
import { ListingTable } from "@/components/market/ListingTable";
import { MarketFilterForm, MarketSearch, SortSelect } from "@/components/market/MarketControls";
import { MarketPagination } from "@/components/market/MarketPagination";
import { SafetyNote } from "@/components/market/SafetyNote";
import { buttonVariants } from "@/components/ui/button";
import { getUserId, signInHref } from "@/lib/auth";
import {
  CATEGORIES,
  DATE_FILTERS,
  categoryLabel,
  formatPrice,
  hasSideFilters,
  marketHref,
  parseMarketQuery,
  type CategoryId,
  type MarketQuery,
  type MarketView,
} from "@/lib/market";
import { PAGE_SIZE, listListings, marketSummary, type MarketSummary } from "@/lib/market-data";
import { requestNow } from "@/lib/now";

export const metadata: Metadata = {
  title: "Pazar",
  description: "Çiftçiden çiftçiye pazar: ürün, tohum ve gübre, el aletleri, ekipman ve araç ilanları. Satıcıyla site içinden mesajlaşın, teklif verin.",
};

/**
 * Pazar, laid out like sahibinden.com (so it feels familiar) in the site's own colours: a top band
 * with the search bar and "Ücretsiz İlan Ver"; on wide screens the categories and filter sections
 * in a left column, "… ilan bulundu", tabs over a dense results table (or photo cards) and numbered
 * pages; on phones the category list, a "Filtrele | Sırala" bar with a full-screen filter sheet,
 * and photo rows.
 */
export default function MarketPage({ searchParams }: PageProps<"/pazar">) {
  return (
    <Suspense fallback={<MarketSkeleton />}>
      <Market searchParams={searchParams} />
    </Suspense>
  );
}

const VIEWS: { id: MarketView; label: string }[] = [
  { id: "tumu", label: "Tüm ilanlar" },
  { id: "favoriler", label: "Favorilerim" },
  { id: "ilanlarim", label: "İlanlarım" },
];

/** Each category's picture in the category lists. */
const CATEGORY_ICON: Record<Exclude<CategoryId, "tumu">, typeof PlantIcon> = {
  urun: GrainsIcon,
  tohum: PlantIcon,
  alet: WrenchIcon,
  ekipman: GearSixIcon,
  arac: TractorIcon,
};

const LISTING_CATEGORIES = CATEGORIES.filter((c) => c.id !== "tumu") as { id: Exclude<CategoryId, "tumu">; label: string }[];
const count = (n: number) => n.toLocaleString("tr-TR");
const box = "overflow-hidden rounded-md border border-border bg-card";
const FILTER_SHEET = "filtre-sayfasi";

async function Market({ searchParams }: { searchParams: PageProps<"/pazar">["searchParams"] }) {
  const sp = await searchParams;
  const query = parseMarketQuery(sp);
  const userId = await getUserId();
  const [{ items, total }, summary, now] = await Promise.all([listListings(query, userId), marketSummary(), requestNow()]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const removed = sp.kaldirildi === "1";
  const sideFilters = [query.il, query.fmin || query.fmax, query.tarih, query.foto].filter(Boolean).length;
  // Browsing everything (no category, words or filter): the phone shows the category list first.
  const browsing = query.gorunum === "tumu" && query.kategori === "tumu" && !query.q && !hasSideFilters(query) && query.sayfa === 1;
  const viewHref = (v: MarketView) => (userId || v === "tumu" ? marketHref(query, { gorunum: v }) : signInHref(marketHref(query, { gorunum: v })));

  return (
    <>
      {/* sahibinden's top band: the name, the search bar, then Mesajlar and "Ücretsiz İlan Ver". */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 xl:flex-nowrap xl:px-4">
          <h1 className="text-xl font-bold leading-tight tracking-tight max-xl:flex-1">
            <Link href="/pazar">Pazar</Link>
          </h1>
          <div className="order-last w-full xl:order-none xl:w-auto xl:max-w-2xl xl:flex-1">
            <MarketSearch query={query} />
          </div>
          <div className="flex shrink-0 gap-2 xl:ml-auto">
            <Link href="/mesajlar" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <ChatsCircleIcon aria-hidden="true" weight="duotone" />
              Mesajlar
            </Link>
            <Link href="/pazar/ilan-ver" className={buttonVariants({ variant: "create", size: "sm" })}>
              <PlusIcon aria-hidden="true" weight="bold" />
              <span>
                <span className="max-xl:hidden">Ücretsiz </span>İlan ver
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl pb-3 xl:grid xl:grid-cols-[14.5rem_minmax(0,1fr)] xl:items-start xl:gap-4 xl:px-4 xl:py-3">
        {/* ------------------------------------------------ Wide screens: the left column */}
        <aside aria-label="Kategoriler ve filtreler" className="space-y-3 max-xl:hidden">
          <CategoryBox query={query} summary={summary} />
          <section aria-labelledby="filtre-baslik" className={box}>
            <h2 id="filtre-baslik" className="flex min-h-9 items-center gap-1.5 border-b border-border bg-muted/50 px-3 text-[13.5px] font-bold">
              <FunnelIcon aria-hidden="true" weight="duotone" className="size-4 text-primary" />
              Filtrele
            </h2>
            <MarketFilterForm query={query} id="yan" />
          </section>
          <SafetyNote className="text-[12.5px]" />
        </aside>

        {/* ------------------------------------------------ Results */}
        <div className="min-w-0 space-y-3 max-xl:pt-3">
          {removed && (
            <p role="status" className="mx-3 flex items-center gap-2 rounded-md border border-primary/30 bg-secondary px-4 py-3 font-semibold xl:mx-0">
              <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 text-primary" />
              İlanınız kaldırıldı.
            </p>
          )}

          <nav aria-label="Konum" className="text-[12.5px] text-muted-foreground max-xl:hidden">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-primary hover:underline">
                  Ana sayfa
                </Link>
              </li>
              <Crumb>
                {query.kategori === "tumu" ? (
                  <span aria-current="page" className="font-semibold text-foreground">Pazar</span>
                ) : (
                  <Link href={marketHref(query, { kategori: "tumu" })} className="hover:text-primary hover:underline">
                    Pazar
                  </Link>
                )}
              </Crumb>
              {query.kategori !== "tumu" && (
                <Crumb>
                  <span aria-current="page" className="font-semibold text-foreground">{categoryLabel(query.kategori)}</span>
                </Crumb>
              )}
            </ol>
          </nav>

          {/* Phones: Tüm ilanlar / Favorilerim / İlanlarım */}
          {userId && (
            <nav aria-label="İlan görünümü" className="px-3 xl:hidden">
              <ul className="grid grid-cols-3 gap-1 rounded-md bg-muted p-1">
                {VIEWS.map((v) => (
                  <li key={v.id}>
                    <Link
                      href={viewHref(v.id)}
                      aria-current={query.gorunum === v.id ? "page" : undefined}
                      className="flex min-h-10 items-center justify-center rounded px-2 text-sm font-semibold text-muted-foreground transition-colors aria-[current=page]:bg-card aria-[current=page]:text-foreground aria-[current=page]:shadow-soft"
                    >
                      {v.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Phones: the category list, with live counts. */}
          {browsing && (
            <nav aria-label="Kategoriler" className="border-y border-border bg-card xl:hidden">
              <h2 className="border-b border-border bg-muted/50 px-4 py-2 text-[13px] font-bold">Kategoriler</h2>
              <ul className="divide-y divide-border">
                {LISTING_CATEGORIES.map((c) => {
                  const Icon = CATEGORY_ICON[c.id];
                  return (
                    <li key={c.id}>
                      <Link href={marketHref(query, { kategori: c.id })} className="flex min-h-11 items-center gap-3 px-4 transition-colors hover:bg-secondary">
                        <Icon aria-hidden="true" weight="duotone" className="size-6 shrink-0 text-primary" />
                        <span className="flex-1 font-semibold">{c.label}</span>
                        <span className="text-sm text-muted-foreground tabular-nums">({count(summary.byCategory[c.id] ?? 0)})</span>
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
              <Link href={marketHref(query, { kategori: "tumu" })} className="text-sm text-muted-foreground hover:underline">
                Pazar
              </Link>
              <span aria-hidden="true" className="text-sm text-muted-foreground">›</span>
              <span className="font-semibold">{categoryLabel(query.kategori)}</span>
            </div>
          )}

          {/* Phones: sahibinden's "Filtrele | Sırala" bar; Filtrele opens a full-screen sheet. */}
          <div className="grid grid-cols-2 gap-2 px-3 xl:hidden">
            <button
              type="button"
              popoverTarget={FILTER_SHEET}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-card font-semibold"
            >
              <FunnelIcon aria-hidden="true" weight="duotone" className="size-5 text-primary" />
              Filtrele
              {sideFilters > 0 && <span className="rounded bg-primary px-1.5 text-[12px] font-bold leading-5 text-primary-foreground">{sideFilters}</span>}
            </button>
            <SortSelect query={query} id="sirala-tel" />
          </div>
          <div id={FILTER_SHEET} popover="auto" aria-label="Filtrele" className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-background p-0 xl:hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface py-1 pl-4 pr-1">
              <h2 className="text-lg font-bold">Filtrele</h2>
              <button
                type="button"
                popoverTarget={FILTER_SHEET}
                popoverTargetAction="hide"
                aria-label="Kapat"
                className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <XIcon aria-hidden="true" weight="bold" className="size-5" />
              </button>
            </div>
            <div className="border-b border-border bg-card">
              <MarketFilterForm query={query} id="tel" />
            </div>
          </div>

          <p aria-live="polite" className="px-3 text-[14px] xl:px-0 xl:text-[15px]">
            <Found query={query} total={total} />
          </p>

          <ActiveFilters query={query} />

          <section aria-label="İlanlar" className="border-y border-border bg-card xl:rounded-md xl:border-x">
            {/* Wide screens: tabs on the box (Tüm ilanlar / Favorilerim / İlanlarım), the order and the list / gallery switch. */}
            <div className="flex items-end justify-between gap-3 border-b border-border bg-muted/40 px-2 max-xl:hidden">
              <nav aria-label="İlan görünümü">
                <ul className="flex">
                  {VIEWS.map((v) => (
                    <li key={v.id}>
                      <Link
                        href={viewHref(v.id)}
                        aria-current={query.gorunum === v.id ? "page" : undefined}
                        className="-mb-px flex min-h-10 items-center rounded-t-md border border-transparent px-3.5 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:text-primary aria-[current=page]:border-border aria-[current=page]:border-b-card aria-[current=page]:bg-card aria-[current=page]:text-foreground"
                      >
                        {v.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              {total > 0 && (
                <div className="flex items-center gap-2 py-1.5">
                  <SortSelect query={query} id="sirala" />
                  <LayoutToggle query={query} />
                </div>
              )}
            </div>

            {items.length === 0 ? (
              <div className="p-3">
                <EmptyState query={query} signedIn={Boolean(userId)} />
              </div>
            ) : (
              <>
                <ul className="divide-y divide-border xl:hidden">
                  {items.map((l) => (
                    <ListingRow key={l.id} listing={l} now={now} mine={l.sellerId === userId} />
                  ))}
                </ul>
                <div className="max-xl:hidden">
                  {query.duzen === "galeri" ? (
                    <ul className="grid grid-cols-4 gap-3 p-3">
                      {items.map((l) => (
                        <li key={l.id}>
                          <ListingCard listing={l} now={now} mine={l.sellerId === userId} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ListingTable items={items} userId={userId} />
                  )}
                </div>
              </>
            )}
          </section>

          <div className="px-3 xl:px-0">
            <MarketPagination query={query} pages={pages} />
          </div>

          <SafetyNote className="mx-3 text-sm xl:hidden" />
        </div>
      </div>
    </>
  );
}

/** sahibinden's line over the results: “traktör” aramanızda 12 ilan bulundu. */
function Found({ query, total }: { query: MarketQuery; total: number }) {
  const n = <b className="font-bold">{count(total)} ilan</b>;
  if (query.gorunum === "favoriler") return <>Favorilerinizde {n} var.</>;
  if (query.gorunum === "ilanlarim") return <><b className="font-bold">{count(total)} ilanınız</b> var.</>;
  if (total === 0) return <>Aramanıza uygun ilan bulunamadı.</>;
  if (query.q)
    return (
      <>
        <b className="font-bold">“{query.q}”</b> aramanızda {n} bulundu.
      </>
    );
  if (query.kategori !== "tumu")
    return (
      <>
        <b className="font-bold">{categoryLabel(query.kategori)}</b> kategorisinde {n} bulundu.
      </>
    );
  return <>Pazar’da {n} bulundu.</>;
}

function Crumb({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center gap-1">
      <CaretRightIcon aria-hidden="true" weight="bold" className="size-3" />
      {children}
    </li>
  );
}

/** The left column's category tree: Pazar with its total, the categories under it with their counts. */
function CategoryBox({ query, summary }: { query: MarketQuery; summary: MarketSummary }) {
  const link =
    "flex min-h-8 items-center gap-2 border-l-2 border-transparent pr-3 text-[13px] transition-colors hover:bg-muted/60 hover:text-primary aria-[current=page]:border-primary aria-[current=page]:bg-secondary aria-[current=page]:font-bold aria-[current=page]:text-primary";
  return (
    <nav aria-labelledby="kategori-baslik" className={box}>
      <h2 id="kategori-baslik" className="flex min-h-9 items-center border-b border-border bg-muted/50 px-3 text-[13.5px] font-bold">
        Kategoriler
      </h2>
      <ul className="py-1">
        <li>
          <Link href={marketHref(query, { kategori: "tumu" })} aria-current={query.kategori === "tumu" ? "page" : undefined} className={`${link} pl-3 font-semibold`}>
            <StorefrontIcon aria-hidden="true" weight="duotone" className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate">Pazar</span>
            <span className="shrink-0 font-borsa-mono text-[11.5px] font-normal text-muted-foreground">({count(summary.active)})</span>
          </Link>
          <ul>
            {LISTING_CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICON[c.id];
              return (
                <li key={c.id}>
                  <Link href={marketHref(query, { kategori: c.id })} aria-current={query.kategori === c.id ? "page" : undefined} className={`${link} pl-7`}>
                    <Icon aria-hidden="true" weight="duotone" className="size-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate">{c.label}</span>
                    <span className="shrink-0 font-borsa-mono text-[11.5px] font-normal text-muted-foreground">({count(summary.byCategory[c.id] ?? 0)})</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
      </ul>
    </nav>
  );
}

/** The filters in use as chips; each one's × takes it off. */
function ActiveFilters({ query }: { query: MarketQuery }) {
  const chips: { label: string; off: Partial<MarketQuery> }[] = [];
  if (query.q) chips.push({ label: `“${query.q}”`, off: { q: "" } });
  if (query.il) chips.push({ label: query.il, off: { il: "" } });
  if (query.fmin || query.fmax)
    chips.push({
      label: query.fmin && query.fmax ? `${formatPrice(query.fmin)} – ${formatPrice(query.fmax)}` : query.fmin ? `En az ${formatPrice(query.fmin)}` : `En çok ${formatPrice(query.fmax ?? 0)}`,
      off: { fmin: null, fmax: null },
    });
  if (query.tarih) chips.push({ label: DATE_FILTERS.find((d) => d.days === query.tarih)?.label ?? "", off: { tarih: 0 } });
  if (query.foto) chips.push({ label: "Fotoğraflı", off: { foto: false } });
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 xl:px-0">
      <span className="text-[13px] text-muted-foreground">Seçili filtreler:</span>
      {chips.map((c) => (
        <Link
          key={c.label}
          href={marketHref(query, c.off)}
          aria-label={`${c.label} filtresini kaldır`}
          className="inline-flex min-h-8 items-center gap-1 rounded-md border border-primary/30 bg-secondary px-2 text-[13px] font-semibold text-primary transition-colors hover:border-primary"
        >
          {c.label}
          <XIcon aria-hidden="true" weight="bold" className="size-3.5" />
        </Link>
      ))}
      {chips.length > 1 && (
        <Link href={marketHref(query, { q: "", il: "", fmin: null, fmax: null, tarih: 0, foto: false })} className="inline-flex min-h-8 items-center px-1 text-[13px] font-semibold text-primary hover:underline">
          Tümünü temizle
        </Link>
      )}
    </div>
  );
}

/** Wide screens: the list / gallery switch. */
function LayoutToggle({ query }: { query: MarketQuery }) {
  const options = [
    { id: "liste" as const, label: "Liste", Icon: ListBulletsIcon },
    { id: "galeri" as const, label: "Galeri", Icon: SquaresFourIcon },
  ];
  return (
    <nav aria-label="Görünüm">
      <ul className="flex divide-x divide-input overflow-hidden rounded-md border border-input bg-card">
        {options.map(({ id, label, Icon }) => (
          <li key={id}>
            <Link
              href={marketHref(query, { duzen: id, sayfa: query.sayfa })}
              aria-current={query.duzen === id ? "page" : undefined}
              title={label}
              className="flex min-h-9 items-center gap-1.5 px-2.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted/60 aria-[current=page]:bg-secondary aria-[current=page]:text-primary"
            >
              <Icon aria-hidden="true" weight="bold" className="size-4" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function EmptyState({ query, signedIn }: { query: MarketQuery; signedIn: boolean }) {
  const filtered = query.q || query.kategori !== "tumu" || hasSideFilters(query);
  const text =
    query.gorunum === "favoriler"
      ? "Henüz favori ilanınız yok. Beğendiğiniz ilanlardaki kalbe dokunun, burada toplansın."
      : query.gorunum === "ilanlarim"
        ? "Henüz ilanınız yok. İlk ilanınızı birkaç dakikada verebilirsiniz."
        : filtered
          ? "Bir filtreyi kaldırmayı, fiyat aralığını genişletmeyi ya da başka bir kelimeyi deneyin."
          : "Pazar yeni açıldı, henüz ilan yok. İlk ilanı siz verin!";
  return (
    <div className="rounded-md border border-dashed border-input px-4 py-6 text-center">
      <StorefrontIcon aria-hidden="true" weight="duotone" className="mx-auto size-9 text-primary" />
      <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-muted-foreground">{text}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
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
    <div aria-hidden="true">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-3 py-2.5 xl:px-4">
          <span className="text-xl font-bold">Pazar</span>
          <div className="h-10 flex-1 rounded-md bg-muted" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl xl:grid xl:grid-cols-[14.5rem_minmax(0,1fr)] xl:gap-4 xl:px-4 xl:py-3">
        <div className="space-y-3 max-xl:hidden">
          <div className="h-56 rounded-md border border-border bg-card" />
          <div className="h-96 rounded-md border border-border bg-card" />
        </div>
        <div className="space-y-3 px-3 pt-3 xl:px-0 xl:pt-0">
          <div className="h-5 w-64 rounded bg-muted" />
          <div className="divide-y divide-border rounded-md border border-border bg-card">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex gap-3 p-2">
                <div className="h-[4.125rem] w-[5.5rem] rounded-sm bg-muted motion-safe:animate-pulse" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
