import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChatsCircleIcon, CheckCircleIcon, PlusIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { ListingCard } from "@/components/market/ListingCard";
import { MarketFilters } from "@/components/market/MarketFilters";
import { SafetyNote } from "@/components/market/SafetyNote";
import { buttonVariants } from "@/components/ui/button";
import { getUserId } from "@/lib/auth";
import { CATEGORIES, marketHref, parseMarketQuery, type MarketQuery, type MarketView } from "@/lib/market";
import { PAGE_SIZE, listListings } from "@/lib/market-data";
import { requestNow } from "@/lib/now";

export const metadata: Metadata = {
  title: "Pazar",
  description: "Çiftçiden çiftçiye pazar: ürün, tohum ve gübre, el aletleri, ekipman ve araç ilanları. Satıcıyla site içinden mesajlaşın, teklif verin.",
};

export default function MarketPage({ searchParams }: PageProps<"/pazar">) {
  return (
    <>
      <ToolHeader
        eyebrow="Pazar"
        title="Çiftçi Pazarı"
        intro="Ürününüzü, tohumunuzu, aletinizi ya da aracınızı ilan edin; alıcıyla site içinden mesajlaşın. Ödeme ve teslim yüz yüze yapılır."
        actions={
          <>
            <Link href="/pazar/ilan-ver" className={buttonVariants({ size: "lg" })}>
              <PlusIcon aria-hidden="true" weight="bold" />
              İlan ver
            </Link>
            <Link href="/mesajlar" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <ChatsCircleIcon aria-hidden="true" weight="duotone" />
              Mesajlar
            </Link>
          </>
        }
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
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

async function Market({ searchParams }: { searchParams: PageProps<"/pazar">["searchParams"] }) {
  const sp = await searchParams;
  const query = parseMarketQuery(sp);
  const userId = await getUserId();
  const { items, total } = await listListings(query, userId);
  const now = await requestNow();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const removed = sp.kaldirildi === "1";

  return (
    <div className="space-y-6">
      {removed && (
        <p role="status" className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-secondary px-4 py-3 font-semibold">
          <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 text-primary" />
          İlanınız kaldırıldı.
        </p>
      )}

      {userId && (
        <nav aria-label="İlan görünümü" className="flex flex-wrap gap-2">
          {VIEWS.map((v) => (
            <Link
              key={v.id}
              href={marketHref(query, { gorunum: v.id })}
              aria-current={query.gorunum === v.id ? "page" : undefined}
              className="inline-flex min-h-11 items-center rounded-full border-2 border-border px-4 font-semibold transition-colors hover:border-primary/50 aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
            >
              {v.label}
            </Link>
          ))}
        </nav>
      )}

      <MarketFilters query={query} />

      <nav aria-label="Kategoriler">
        <ul className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link
                href={marketHref(query, { kategori: c.id })}
                aria-current={query.kategori === c.id ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded-full bg-secondary px-4 font-semibold text-secondary-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_8%)] aria-[current=page]:bg-foreground aria-[current=page]:text-background"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <SafetyNote />

      <p className="text-muted-foreground" aria-live="polite">
        {total === 0 ? "İlan bulunamadı." : `${total.toLocaleString("tr-TR")} ilan`}
        {pages > 1 && ` · Sayfa ${query.sayfa} / ${pages}`}
      </p>

      {items.length === 0 ? (
        <EmptyState query={query} signedIn={Boolean(userId)} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {items.map((l) => (
            <li key={l.id}>
              <ListingCard listing={l} now={now} mine={l.sellerId === userId} />
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Sayfalar" className="flex items-center justify-between gap-3 pt-4">
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
    <div className="rounded-2xl border border-dashed border-input px-6 py-12 text-center">
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
          <Link href={signedIn ? "/pazar/ilan-ver" : "/giris?redirect_url=%2Fpazar%2Filan-ver"} className={buttonVariants()}>
            İlan ver
          </Link>
        )}
      </div>
    </div>
  );
}

function MarketSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-6">
      <div className="h-12 rounded-2xl bg-muted motion-safe:animate-pulse" />
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <span key={c.id} className="h-11 w-24 rounded-full bg-muted" />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="overflow-hidden rounded-2xl border border-border">
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
