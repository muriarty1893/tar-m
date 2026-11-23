import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import {
  CaretRightIcon,
  ChatsCircleIcon,
  CheckCircleIcon,
  ClockIcon,
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
  conditionLabel,
  formatTL,
  hasSideFilters,
  marketHref,
  parseMarketQuery,
  type CategoryId,
  type MarketQuery,
  type MarketView,
} from "@/lib/market";
import { PAGE_SIZE, listListings, marketSummary, type ListingCard as Card, type MarketSummary } from "@/lib/market-data";
import { requestNow } from "@/lib/now";

export const metadata: Metadata = {
  title: "Pazar",
  description: "Çiftçiden çiftçiye pazar: ürün, tohum ve gübre, el aletleri, ekipman ve araç ilanları. Satıcıyla site içinden mesajlaşın, teklif verin.",
};

/**
 * Pazar, copied from sahibinden.com's layout so it feels familiar, in the site's own colours.
 * /pazar with nothing chosen is sahibinden's home: quick date links and the category tree on the
 * left, "Pazar Vitrini" (a grid of the newest listings) on the right. Any search, category or filter
 * shows the results page: the category tree and filter boxes on the left; the "… sonuç bulundu"
 * box, a "Tümü" tab, the list / gallery switch and sorting over the results table; numbered pages.
 * Phones get the category list, a "Filtrele | Sırala" bar with a full-screen filter sheet, and rows.
 */
export default function MarketPage({ searchParams }: PageProps<"/pazar">) {
  return (
    <Suspense fallback={<MarketSkeleton />}>
      <Market searchParams={searchParams} />
    </Suspense>
  );
}

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
const FILTER_SHEET = "filtre-sayfasi";
/** How many listings the showcase shows (5 rows of 7 on wide screens). */
const SHOWCASE = 35;

async function Market({ searchParams }: { searchParams: PageProps<"/pazar">["searchParams"] }) {
  const sp = await searchParams;
  const query = parseMarketQuery(sp);
  // Nothing in the address at all: sahibinden's home page (the showcase), not the results.
  const showcase = Object.keys(sp).length === 0;
  const userId = await getUserId();
  const [{ items, total }, summary, now] = await Promise.all([listListings(query, userId, showcase ? SHOWCASE : PAGE_SIZE), marketSummary(), requestNow()]);
  const viewHref = (v: MarketView) => (userId || v === "tumu" ? marketHref(query, { gorunum: v }) : signInHref(marketHref(query, { gorunum: v })));

  return (
    <>
      {/* sahibinden's header: the name, the search bar, then Mesajlar and "Ücretsiz İlan Ver". */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 xl:flex-nowrap xl:px-4">
          <h1 className="text-xl font-bold leading-tight tracking-tight max-xl:flex-1">
            <Link href="/pazar">Pazar</Link>
          </h1>
          <div className="order-last w-full xl:order-none xl:w-auto xl:max-w-xl xl:flex-1">
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
                <span className="max-xl:hidden">Ücretsiz </span>İlan Ver
              </span>
            </Link>
          </div>
        </div>
        {/* The strip under it: where you are on the left, your lists on the right. */}
        <div className="border-t border-border bg-muted/60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-1.5 text-[12.5px] xl:px-4">
            <nav aria-label="Konum">
              <ol className="flex flex-wrap items-center gap-1 text-primary">
                <li>
                  <Link href="/" className="hover:underline">
                    Anasayfa
                  </Link>
                </li>
                <Crumb>
                  <Link href="/pazar" className="hover:underline" aria-current={showcase ? "page" : undefined}>
                    Pazar
                  </Link>
                </Crumb>
                {query.kategori !== "tumu" && (
                  <Crumb>
                    <Link href={marketHref(query, { kategori: query.kategori, q: "", il: "", fmin: null, fmax: null, tarih: 0, durum: "", foto: false })} className="hover:underline" aria-current="page">
                      {categoryLabel(query.kategori)}
                    </Link>
                  </Crumb>
                )}
              </ol>
            </nav>
            <ul className="flex items-center divide-x divide-border text-primary max-sm:hidden">
              <li className="pr-2">
                <Link href={viewHref("favoriler")} className="hover:underline">
                  Favori İlanlarım
                </Link>
              </li>
              <li className="px-2">
                <Link href={viewHref("ilanlarim")} className="hover:underline">
                  İlanlarım
                </Link>
              </li>
              <li className="pl-2">
                <Link href="/mesajlar" className="hover:underline">
                  Mesajlarım
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {sp.kaldirildi === "1" && (
        <p role="status" className="mx-auto mt-3 flex max-w-6xl items-center gap-2 px-3 font-semibold xl:px-4">
          <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 text-primary" />
          İlanınız kaldırıldı.
        </p>
      )}

      {showcase ? (
        <Showcase items={items} summary={summary} />
      ) : (
        <Results query={query} items={items} total={total} summary={summary} userId={userId} now={now} viewHref={viewHref} />
      )}
    </>
  );
}

// ---------------------------------------------------------------- Home: the showcase

/** sahibinden's home: quick date links and the category tree on the left, the showcase on the right. */
function Showcase({ items, summary }: { items: Card[]; summary: MarketSummary }) {
  const all = parseMarketQuery({});
  return (
    <div className="mx-auto max-w-6xl pb-4 xl:grid xl:grid-cols-[15rem_minmax(0,1fr)] xl:items-start xl:gap-6 xl:px-4 xl:py-4">
      <aside aria-label="Kategoriler ve tarihler" className="max-xl:border-b max-xl:border-border max-xl:bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5 text-[13.5px] xl:px-0 xl:pt-0">
          <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted-foreground/70 text-white">
            <ClockIcon weight="bold" className="size-4" />
          </span>
          <span className="flex flex-wrap items-center gap-1 text-primary">
            <Link href={marketHref(all, { tarih: 1 })} className="hover:underline">
              Son 24 Saat
            </Link>
            /
            <Link href={marketHref(all, { tarih: 7 })} className="hover:underline">
              1 Hafta
            </Link>
            /
            <Link href={marketHref(all, { tarih: 30 })} className="hover:underline">
              1 Ay
            </Link>
          </span>
        </div>
        <nav aria-label="Kategoriler" className="px-3 py-2.5 xl:px-0">
          <h2 id="vitrin-kategori" className="flex items-center gap-2.5 text-[14px]">
            <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <StorefrontIcon weight="fill" className="size-3.5" />
            </span>
            <Link href={marketHref(all)} className="font-bold text-primary hover:underline">
              Pazar
            </Link>
            <span className="text-[12px] text-muted-foreground">({count(summary.active)})</span>
          </h2>
          <ul className="mt-1 space-y-0.5 pl-[2.125rem] max-xl:space-y-0">
            {LISTING_CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={marketHref(all, { kategori: c.id })} className="inline-flex min-h-8 items-center gap-1 text-[13.5px] text-primary hover:underline max-xl:min-h-10">
                  {c.label}
                  <span className="text-[12px] text-muted-foreground">({count(summary.byCategory[c.id] ?? 0)})</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <SafetyNote className="mx-3 mb-3 text-[12.5px] xl:mx-0 xl:mt-3" />
      </aside>

      <section aria-labelledby="vitrin-baslik" className="px-3 pt-3 xl:px-0 xl:pt-0">
        <div className="flex items-baseline justify-between gap-3 border-b border-border pb-1.5">
          <h2 id="vitrin-baslik" className="text-[14px] font-semibold">
            Pazar Vitrini
          </h2>
          <Link href={marketHref(all)} className="text-[13px] text-primary hover:underline">
            Tüm ilanları göster
          </Link>
        </div>
        {items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Pazar yeni açıldı, henüz ilan yok.{" "}
            <Link href="/pazar/ilan-ver" className="font-semibold text-primary underline">
              İlk ilanı siz verin
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-3 gap-x-2.5 gap-y-3 sm:grid-cols-5 xl:grid-cols-7 xl:gap-x-4">
            {items.map((l) => (
              <li key={l.id}>
                <Link href={`/pazar/ilan/${l.id}`} className="group block" title={l.title}>
                  <span className="relative block aspect-[4/3] overflow-hidden border border-border bg-card">
                    <Image src={l.photo} alt="" fill sizes="(min-width: 1280px) 112px, (min-width: 640px) 20vw, 33vw" className="object-cover" />
                  </span>
                  <span className="mt-1 block truncate text-[12px] group-hover:text-primary group-hover:underline">{l.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- Results

function Results({
  query,
  items,
  total,
  summary,
  userId,
  now,
  viewHref,
}: {
  query: MarketQuery;
  items: Card[];
  total: number;
  summary: MarketSummary;
  userId: string | null;
  now: Date;
  viewHref: (v: MarketView) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const sideFilters = [query.il, query.fmin || query.fmax, query.tarih, query.durum, query.foto].filter(Boolean).length;
  const tab = query.gorunum === "favoriler" ? "Favori İlanlarım" : query.gorunum === "ilanlarim" ? "İlanlarım" : "Tümü";

  return (
    <div className="mx-auto max-w-6xl pb-3 xl:grid xl:grid-cols-[13.5rem_minmax(0,1fr)] xl:items-start xl:gap-4 xl:px-4 xl:py-3">
      {/* ------------------------------------------------ Wide screens: the left column */}
      <aside aria-label="Kategoriler ve filtreler" className="space-y-3 max-xl:hidden">
        <CategoryTree query={query} summary={summary} />
        <MarketFilterForm query={query} id="yan" />
      </aside>

      {/* ------------------------------------------------ Results */}
      <div className="min-w-0 space-y-3 max-xl:pt-3">
        {/* Phones, in a category: where you are, and the way back to all. */}
        {query.kategori !== "tumu" && (
          <div className="flex items-center gap-2 px-3 xl:hidden">
            <SquaresFourIcon aria-hidden="true" weight="duotone" className="size-5 text-primary" />
            <span className="font-semibold">{categoryLabel(query.kategori)}</span>
            <Link href={marketHref(query, { kategori: "tumu" })} aria-label="Kategoriyi kaldır" className="ml-auto inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
              <XIcon aria-hidden="true" weight="bold" className="size-5" />
            </Link>
          </div>
        )}

        {/* Phones: sahibinden's "Filtrele | Sırala" bar; Filtrele opens a full-screen sheet. */}
        <div className="grid grid-cols-2 gap-2 px-3 xl:hidden">
          <button type="button" popoverTarget={FILTER_SHEET} className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-card font-semibold">
            <FunnelIcon aria-hidden="true" weight="duotone" className="size-5 text-primary" />
            Filtrele
            {sideFilters > 0 && <span className="rounded bg-primary px-1.5 text-[12px] font-bold leading-5 text-primary-foreground">{sideFilters}</span>}
          </button>
          <SortSelect query={query} id="sirala-tel" />
        </div>
        <div id={FILTER_SHEET} popover="auto" aria-label="Filtrele" className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-background p-0 xl:hidden">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface py-1 pl-4 pr-1">
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
          <div className="bg-card px-3 pt-2">
            <MarketFilterForm query={query} id="tel" />
          </div>
        </div>

        {/* sahibinden's box over the results: what was searched, how many found, the chosen filters. */}
        <div className="border-y border-border bg-card px-3 xl:rounded-sm xl:border-x">
          <p aria-live="polite" className="py-2.5 text-[13.5px]">
            <Found query={query} total={total} />
          </p>
          <Chosen query={query} />
        </div>

        <section aria-label="İlanlar">
          {/* The tab on the left; the layout switch and the order on the right. */}
          <div className="flex items-end justify-between gap-3 border-b border-border px-3 xl:px-0">
            <span className="-mb-px inline-flex min-h-9 items-center rounded-t-sm border border-border border-b-card border-t-2 border-t-primary bg-card px-3 text-[13px] font-bold">{tab}</span>
            {total > 0 && (
              <div className="flex items-center gap-2 pb-1.5 max-xl:hidden">
                <LayoutToggle query={query} />
                <SortSelect query={query} id="sirala" />
              </div>
            )}
          </div>

          <div className="border-b border-border bg-card xl:border-x">
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
          </div>
        </section>

        <div className="px-3 xl:px-0">
          <MarketPagination query={query} pages={pages} />
        </div>

        <SafetyNote className="mx-3 text-sm xl:mx-0 xl:text-[13px]" />
        {/* Links for the views live in the strip on wide screens; phones get them here. */}
        <p className="flex justify-center gap-4 px-3 text-[14px] sm:hidden">
          <Link href={viewHref("favoriler")} className="font-semibold text-primary">
            Favori İlanlarım
          </Link>
          <Link href={viewHref("ilanlarim")} className="font-semibold text-primary">
            İlanlarım
          </Link>
        </p>
      </div>
    </div>
  );
}

/** sahibinden's sentence: "traktör" araması için "Ürün" kategorisinde 28 sonuç bulundu. */
function Found({ query, total }: { query: MarketQuery; total: number }) {
  const n = <b className="font-bold text-[var(--create-hover)]">{count(total)}</b>;
  if (query.gorunum === "favoriler") return <>Favori ilanlarınızda {n} ilan var.</>;
  if (query.gorunum === "ilanlarim") return <>{n} ilanınız var.</>;
  const q = query.q && (
    <>
      “<b className="font-bold">{query.q}</b>” araması için{" "}
    </>
  );
  const cat = query.kategori !== "tumu" && (
    <>
      “<b className="font-bold">{categoryLabel(query.kategori)}</b>” kategorisinde{" "}
    </>
  );
  return (
    <>
      {q}
      {cat}
      {!q && !cat && <>Pazar’da </>}
      {n} sonuç bulundu.
    </>
  );
}

/** The second line of that box: each chosen filter as a chip with ×, then "Tümünü Temizle". */
function Chosen({ query }: { query: MarketQuery }) {
  const chips: { name: string; label: string; off: Partial<MarketQuery> }[] = [];
  if (query.q) chips.push({ name: "Arama Kelimesi", label: query.q, off: { q: "" } });
  if (query.durum) chips.push({ name: "Durumu", label: conditionLabel(query.durum) ?? "", off: { durum: "" } });
  if (query.il) chips.push({ name: "Adres", label: query.il, off: { il: "" } });
  if (query.fmin || query.fmax)
    chips.push({
      name: "Fiyat",
      label: query.fmin && query.fmax ? `${formatTL(query.fmin)} - ${formatTL(query.fmax)}` : query.fmin ? `min ${formatTL(query.fmin)}` : `max ${formatTL(query.fmax ?? 0)}`,
      off: { fmin: null, fmax: null },
    });
  if (query.tarih) chips.push({ name: "İlan Tarihi", label: DATE_FILTERS.find((d) => d.days === query.tarih)?.label ?? "", off: { tarih: 0 } });
  if (query.foto) chips.push({ name: "Fotoğraf", label: "Fotoğraflı ilanlar", off: { foto: false } });
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border py-2 text-[13px]">
      {chips.map((c) => (
        <span key={c.name} className="inline-flex items-center gap-1.5">
          <b className="font-bold">{c.name}</b>
          <Link
            href={marketHref(query, c.off)}
            aria-label={`${c.name}: ${c.label}, kaldır`}
            className="inline-flex min-h-7 items-center gap-1 rounded-sm bg-muted px-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            {c.label}
            <span aria-hidden="true" className="flex size-3.5 items-center justify-center rounded-[2px] bg-[var(--create-hover)] text-white">
              <XIcon weight="bold" className="size-2.5" />
            </span>
          </Link>
        </span>
      ))}
      <Link href={marketHref(query, { q: "", il: "", fmin: null, fmax: null, tarih: 0, durum: "", foto: false })} className="text-[12.5px] text-primary hover:underline">
        Tümünü Temizle
      </Link>
    </div>
  );
}

function Crumb({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center gap-1">
      <CaretRightIcon aria-hidden="true" weight="bold" className="size-2.5 text-muted-foreground" />
      {children}
    </li>
  );
}

/** The results page's category tree: Pazar, and the categories under it with their counts. */
function CategoryTree({ query, summary }: { query: MarketQuery; summary: MarketSummary }) {
  const link = "inline-flex min-h-6 items-center gap-1 text-[13px] text-primary hover:underline aria-[current=page]:font-bold aria-[current=page]:text-foreground aria-[current=page]:no-underline";
  return (
    <nav aria-label="Kategoriler" className="rounded-sm border border-border bg-card px-3 py-2.5">
      <Link href={marketHref(query, { kategori: "tumu" })} aria-current={query.kategori === "tumu" ? "page" : undefined} className={link}>
        Pazar <span className="text-[11.5px] font-normal text-muted-foreground">({count(summary.active)})</span>
      </Link>
      <ul className="pl-3">
        {LISTING_CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICON[c.id];
          return (
            <li key={c.id}>
              <Link href={marketHref(query, { kategori: c.id })} aria-current={query.kategori === c.id ? "page" : undefined} className={link}>
                <Icon aria-hidden="true" weight="duotone" className="size-3.5 shrink-0" />
                {c.label} <span className="text-[11.5px] font-normal text-muted-foreground">({count(summary.byCategory[c.id] ?? 0)})</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Wide screens: the list / gallery switch, as sahibinden's icon buttons. */
function LayoutToggle({ query }: { query: MarketQuery }) {
  const options = [
    { id: "liste" as const, label: "Liste görünümü", Icon: ListBulletsIcon },
    { id: "galeri" as const, label: "Galeri görünümü", Icon: SquaresFourIcon },
  ];
  return (
    <nav aria-label="Görünüm">
      <ul className="flex divide-x divide-input overflow-hidden rounded-sm border border-input bg-card">
        {options.map(({ id, label, Icon }) => (
          <li key={id}>
            <Link
              href={marketHref(query, { duzen: id, sayfa: query.sayfa })}
              aria-current={query.duzen === id ? "page" : undefined}
              aria-label={label}
              title={label}
              className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 aria-[current=page]:bg-muted-foreground aria-[current=page]:text-white"
            >
              <Icon aria-hidden="true" weight="bold" className="size-4" />
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
      ? "Henüz favori ilanınız yok. Beğendiğiniz ilanlarda “Favorilerime Ekle”ye dokunun, burada toplansın."
      : query.gorunum === "ilanlarim"
        ? "Henüz ilanınız yok. İlk ilanınızı birkaç dakikada verebilirsiniz."
        : filtered
          ? "Aramanıza uygun ilan bulunamadı. Bir filtreyi kaldırmayı, fiyat aralığını genişletmeyi ya da başka bir kelimeyi deneyin."
          : "Pazar yeni açıldı, henüz ilan yok. İlk ilanı siz verin!";
  return (
    <div className="rounded-sm border border-dashed border-input px-4 py-6 text-center">
      <StorefrontIcon aria-hidden="true" weight="duotone" className="mx-auto size-9 text-primary" />
      <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-muted-foreground">{text}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {filtered && query.gorunum === "tumu" && (
          <Link href="/pazar?sirala=yeni" className={buttonVariants({ variant: "outline" })}>
            Filtreleri temizle
          </Link>
        )}
        {query.gorunum === "favoriler" ? (
          <Link href="/pazar" className={buttonVariants()}>
            Pazara göz at
          </Link>
        ) : (
          <Link href={signedIn ? "/pazar/ilan-ver" : "/giris?redirect_url=%2Fpazar%2Filan-ver"} className={buttonVariants({ variant: "create" })}>
            İlan Ver
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
          <div className="h-10 flex-1 rounded-md bg-muted xl:max-w-xl" />
        </div>
        <div className="h-8 border-t border-border bg-muted/60" />
      </div>
      <div className="mx-auto max-w-6xl xl:grid xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-6 xl:px-4 xl:py-4">
        <div className="space-y-2 max-xl:hidden">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="h-5 w-3/4 rounded bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 px-3 pt-3 sm:grid-cols-5 xl:grid-cols-7 xl:px-0 xl:pt-0">
          {Array.from({ length: 21 }, (_, i) => (
            <div key={i} className="aspect-[4/3] bg-muted motion-safe:animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
