import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon, CalendarBlankIcon, CaretRightIcon, ChatsCircleIcon, CheckCircleIcon, MapPinIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/market/Avatar";
import { ContactSeller } from "@/components/market/ContactSeller";
import { FavoriteButton } from "@/components/market/FavoriteButton";
import { ListingGallery } from "@/components/market/ListingGallery";
import { OwnerActions } from "@/components/market/OwnerActions";
import { ReportListing } from "@/components/market/ReportListing";
import { SafetyNote } from "@/components/market/SafetyNote";
import { getUserId, isAdmin, signInHref } from "@/lib/auth";
import { categoryLabel, conditionLabel, formatPrice, placeLabel, priceLabel, type Condition } from "@/lib/market";
import { getListing } from "@/lib/market-data";
import { agoLabel, monthYear } from "@/lib/tr-time";
import { requestNow } from "@/lib/now";

export async function generateMetadata({ params }: PageProps<"/pazar/ilan/[id]">): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id, null);
  if (!listing || listing.status === "removed") return { title: "İlan bulunamadı" };
  return {
    title: listing.title,
    description: `${priceLabel(listing.price, listing.unit)} · ${placeLabel(listing.province, listing.district)}. ${listing.description.slice(0, 140)}`,
    openGraph: listing.stockPhoto ? undefined : { images: [listing.photos[0]] },
  };
}

export default function ListingPage({ params, searchParams }: PageProps<"/pazar/ilan/[id]">) {
  return (
    <div className="mx-auto max-w-6xl pb-6 xl:px-4 xl:py-4">
      <Link href="/pazar" className="mx-3 inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline xl:hidden">
        <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-5" />
        Pazar’a dön
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <Listing params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const longDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });
const boxTitle = "flex min-h-10 items-center gap-2 border-b border-border px-3 text-[14px] font-bold";

/**
 * A listing, laid out like sahibinden.com's in the site's colours: the title across the top; then
 * the photos, the price with the "İlan bilgileri" table, and the seller side by side (two columns
 * from 1024 px, three from 1280 px); the description below under an "İlan detayları" tab.
 */
async function Listing({ params, searchParams }: Pick<PageProps<"/pazar/ilan/[id]">, "params" | "searchParams">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const userId = await getUserId();
  const [l, admin] = await Promise.all([getListing(id, userId), isAdmin(userId)]);
  const mine = Boolean(userId && l?.sellerId === userId);
  if (!l || (l.status === "removed" && !mine && !admin)) notFound();
  const now = await requestNow();
  const condition = conditionLabel((l.condition ?? undefined) as Condition | undefined);
  const contactable = !mine && l.status === "active";
  const categoryHref = `/pazar?kategori=${l.category}`;

  // sahibinden's "İlan bilgileri": label on the left, value on the right, a hairline between.
  const facts: [string, string][] = [
    ["İlan no", l.id.slice(0, 8).toUpperCase()],
    ["İlan tarihi", longDate(l.createdAt)],
    ["Kategori", categoryLabel(l.category)],
    ...(condition ? [["Durumu", condition] as [string, string]] : []),
    ...(l.quantity ? [["Miktar", l.quantity] as [string, string]] : []),
    ["Pazarlık", l.negotiable ? "Var" : "Yok"],
  ];

  return (
    <>
      {(sp.yeni === "1" || sp.kaydedildi === "1") && (
        <p role="status" className="mx-3 mb-3 flex items-center gap-2 rounded-md border border-primary/30 bg-secondary px-4 py-3 font-semibold xl:mx-0">
          <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 shrink-0 text-primary" />
          {sp.yeni === "1" ? "İlanınız yayında. Alıcılar size buradan mesaj gönderebilir." : "Değişiklikler kaydedildi."}
        </p>
      )}

      <nav aria-label="Konum" className="mb-2 text-[13px] text-muted-foreground max-xl:hidden">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-primary hover:underline">
              Ana sayfa
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <CaretRightIcon aria-hidden="true" weight="bold" className="size-3" />
            <Link href="/pazar" className="hover:text-primary hover:underline">
              Pazar
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <CaretRightIcon aria-hidden="true" weight="bold" className="size-3" />
            <Link href={categoryHref} className="hover:text-primary hover:underline">
              {categoryLabel(l.category)}
            </Link>
          </li>
        </ol>
      </nav>

      <article aria-labelledby="ilan-baslik" className="border-y border-border bg-card xl:rounded-md xl:border-x">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-3 py-2.5">
          <h1 id="ilan-baslik" className="min-w-0 flex-1 text-[18px] font-bold leading-snug tracking-tight xl:text-[20px]">
            {l.title}
          </h1>
          {l.status === "sold" && <span className="rounded bg-foreground px-2 py-0.5 text-[13px] font-semibold text-background">Satıldı</span>}
          {l.status === "removed" && <span className="rounded bg-destructive/10 px-2 py-0.5 text-[13px] font-semibold text-destructive">Kaldırıldı</span>}
          {/* sahibinden's title bar: "Favorilerime ekle" on the right. */}
          {contactable && <FavoriteButton listingId={l.id} favorite={l.favorite} variant="text" />}
        </header>

        <div className="grid gap-4 pb-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:p-3 xl:grid-cols-[minmax(0,1fr)_16.5rem_18.5rem]">
          <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1 xl:row-span-1">
            <ListingGallery photos={l.photos} title={l.title} stockPhoto={l.stockPhoto} />
          </div>

          {/* The price, the place and the facts. */}
          <section aria-label="İlan bilgileri" className="min-w-0 px-3 lg:col-start-2 lg:row-start-1 lg:px-0">
            <p className="font-borsa-mono text-[24px] font-semibold leading-tight text-primary">
              {formatPrice(l.price)}
              {l.unit && <span className="font-sans text-[15px] font-medium text-muted-foreground"> / {l.unit}</span>}
            </p>
            {l.negotiable && <p className="mt-0.5 text-[13px] font-semibold text-gold">Pazarlık payı var</p>}
            <p className="mt-1.5 flex items-center gap-1 text-[14px]">
              <MapPinIcon aria-hidden="true" weight="fill" className="size-4 shrink-0 text-muted-foreground" />
              <Link href={`/pazar?il=${encodeURIComponent(l.province)}`} className="font-semibold text-primary hover:underline">
                {l.province}
              </Link>
              {l.district && <span className="text-muted-foreground">/ {l.district}</span>}
            </p>
            <dl className="mt-3 border-t border-border text-[14px]">
              {facts.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-3 border-b border-border py-2">
                  <dt className="font-semibold">{label}</dt>
                  <dd className={`text-right ${label === "İlan no" ? "font-borsa-mono font-semibold text-create" : ""}`}>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 flex items-center gap-1 text-[13px] text-muted-foreground">
              <CalendarBlankIcon aria-hidden="true" weight="duotone" className="size-4" />
              {agoLabel(new Date(l.createdAt), now)} yayınlandı
            </p>
          </section>

          {/* The seller, and how to reach them. */}
          <aside aria-labelledby="satici-baslik" className="space-y-3 px-3 lg:col-start-2 lg:row-start-2 lg:px-0 xl:col-start-3 xl:row-start-1">
            <section id="iletisim" className="scroll-mt-20 overflow-hidden rounded-md border border-border">
              <h2 id="satici-baslik" className={`${boxTitle} bg-muted/50`}>
                Satıcı
              </h2>
              <div className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar id={l.seller.id} name={l.seller.name} photo={l.seller.photo} size={44} />
                  <div className="min-w-0">
                    <p className="truncate font-bold">{l.seller.name}</p>
                    <p className="text-[13px] text-muted-foreground">
                      Üyelik: {monthYear(new Date(l.seller.memberSince))} · {l.seller.activeListings} ilan
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] text-muted-foreground">Telefon numaraları paylaşılmaz. Görüşmeyi buradan, site içi mesajla başlatın.</p>
                <div className="mt-3">
                  {mine ? (
                    <OwnerActions listingId={l.id} status={l.status} />
                  ) : (
                    <ContactSeller
                      listingId={l.id}
                      price={l.price}
                      unit={l.unit}
                      negotiable={l.negotiable}
                      sold={l.status !== "active"}
                      signInHref={userId ? null : signInHref(`/pazar/ilan/${l.id}`)}
                      conversationId={l.conversationId}
                    />
                  )}
                </div>
              </div>
            </section>
            {admin && !mine && (
              <div className="rounded-md border border-gold/30 p-3">
                <OwnerActions listingId={l.id} status={l.status} admin />
              </div>
            )}
            <SafetyNote className="text-[12.5px]" />
          </aside>
        </div>
      </article>

      {/* sahibinden's tabs under the listing; here one: the description. */}
      <section aria-labelledby="aciklama" className="mt-3 border-y border-border bg-card xl:rounded-md xl:border-x">
        <div className="border-b border-border bg-muted/40 px-2 pt-1.5">
          <h2
            id="aciklama"
            className="-mb-px inline-flex min-h-9 items-center rounded-t-md border border-border border-b-card bg-card px-4 text-[13.5px] font-bold"
          >
            İlan detayları
          </h2>
        </div>
        <div className="px-3 py-3 xl:px-4 xl:py-4">
          {l.description ? (
            <p className="max-w-[75ch] whitespace-pre-line text-base leading-relaxed">{l.description}</p>
          ) : (
            <p className="text-muted-foreground">Satıcı açıklama eklemedi. Merak ettiklerinizi mesajla sorabilirsiniz.</p>
          )}
        </div>
      </section>
      {!mine && userId && (
        <div className="mt-3 px-3 xl:px-0">
          <ReportListing listingId={l.id} reported={l.reported} />
        </div>
      )}

      {/* Phones: sahibinden's bar at the bottom, above the tab bar, so the seller is one tap away. */}
      {contactable && (
        <div className="hide-while-typing fixed inset-x-0 bottom-[var(--bottom-nav)] z-30 flex gap-2 border-t border-border bg-background/95 px-3 py-2 backdrop-blur-md lg:hidden">
          <a href={l.conversationId ? `/mesajlar/${l.conversationId}` : "#iletisim"} className={buttonVariants({ size: "lg", className: "flex-1" })}>
            <ChatsCircleIcon aria-hidden="true" weight="duotone" />
            {l.conversationId ? "Sohbete devam et" : "Satıcıya mesaj gönder"}
          </a>
        </div>
      )}
      {contactable && <div aria-hidden="true" className="h-16 lg:hidden" />}
    </>
  );
}

function DetailSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-md border border-border bg-card">
      <div className="h-12 border-b border-border" />
      <div className="grid gap-4 p-3 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_16.5rem_18.5rem]">
        <div className="aspect-[4/3] rounded-md bg-muted motion-safe:animate-pulse" />
        <div className="space-y-3">
          <div className="h-8 w-2/3 rounded bg-muted" />
          <div className="h-48 rounded bg-muted" />
        </div>
        <div className="h-64 rounded-md bg-muted max-xl:hidden" />
      </div>
    </div>
  );
}
