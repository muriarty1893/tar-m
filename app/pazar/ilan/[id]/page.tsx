import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon, CalendarBlankIcon, ChatsCircleIcon, CheckCircleIcon, MapPinIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/market/Avatar";
import { ContactSeller } from "@/components/market/ContactSeller";
import { FavoriteButton } from "@/components/market/FavoriteButton";
import { ListingGallery } from "@/components/market/ListingGallery";
import { OwnerActions } from "@/components/market/OwnerActions";
import { ReportListing } from "@/components/market/ReportListing";
import { SafetyNote } from "@/components/market/SafetyNote";
import { getUserId, isAdmin, signInHref } from "@/lib/auth";
import { categoryLabel, conditionLabel, placeLabel, priceLabel, type Condition } from "@/lib/market";
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
    <div className="mx-auto max-w-6xl pb-6 lg:px-4 lg:py-8">
      <Link href="/pazar" className="mx-3 inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline lg:mx-0">
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

async function Listing({ params, searchParams }: Pick<PageProps<"/pazar/ilan/[id]">, "params" | "searchParams">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const userId = await getUserId();
  const [l, admin] = await Promise.all([getListing(id, userId), isAdmin(userId)]);
  const mine = Boolean(userId && l?.sellerId === userId);
  if (!l || (l.status === "removed" && !mine && !admin)) notFound();
  const now = await requestNow();
  const condition = conditionLabel((l.condition ?? undefined) as Condition | undefined);
  const contactable = !mine && l.status === "active";

  // sahibinden's "İlan bilgileri": label on the left, value on the right, a hairline between.
  const facts: [string, string][] = [
    ["İlan no", l.id.slice(0, 8).toUpperCase()],
    ["İlan tarihi", longDate(l.createdAt)],
    ["Kategori", categoryLabel(l.category)],
    ...(condition ? [["Durumu", condition] as [string, string]] : []),
    ...(l.quantity ? [["Miktar", l.quantity] as [string, string]] : []),
    ["Pazarlık", l.negotiable ? "Var" : "Yok"],
    ["Konum", placeLabel(l.province, l.district)],
  ];

  return (
    <>
      <div className="grid gap-5 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-5 lg:space-y-8">
          {(sp.yeni === "1" || sp.kaydedildi === "1") && (
            <p role="status" className="mx-3 flex items-center gap-2 rounded-xl border border-primary/30 bg-secondary px-4 py-3 font-semibold lg:mx-0">
              <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 shrink-0 text-primary" />
              {sp.yeni === "1" ? "İlanınız yayında. Alıcılar size buradan mesaj gönderebilir." : "Değişiklikler kaydedildi."}
            </p>
          )}
          <ListingGallery photos={l.photos} title={l.title} stockPhoto={l.stockPhoto} />

          <div className="px-3 lg:px-0">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-secondary px-2.5 py-0.5 text-sm font-semibold">{categoryLabel(l.category)}</span>
              {condition && <span className="rounded-md border border-border px-2.5 py-0.5 text-sm font-semibold">{condition}</span>}
              {l.status === "sold" && <span className="rounded-md bg-foreground px-2.5 py-0.5 text-sm font-semibold text-background">Satıldı</span>}
              {l.status === "removed" && <span className="rounded-md bg-destructive/10 px-2.5 py-0.5 text-sm font-semibold text-destructive">Kaldırıldı</span>}
            </div>
            <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-4xl">{l.title}</h1>
            <p className="mt-2 text-2xl font-bold text-primary tabular-nums sm:text-3xl">
              {priceLabel(l.price, l.unit)}
              {l.negotiable && <span className="ml-3 align-middle text-base font-semibold text-gold">Pazarlık payı var</span>}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPinIcon aria-hidden="true" weight="fill" className="size-4" />
                {placeLabel(l.province, l.district)}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarBlankIcon aria-hidden="true" weight="duotone" className="size-4" />
                {agoLabel(new Date(l.createdAt), now)}
              </span>
            </p>
          </div>

          <section aria-labelledby="ilan-bilgileri" className="overflow-hidden border-y border-border bg-card lg:rounded-xl lg:border-x">
            <h2 id="ilan-bilgileri" className="bg-muted px-4 py-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              İlan bilgileri
            </h2>
            <dl className="divide-y divide-border">
              {facts.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="aciklama" className="px-3 lg:px-0">
            <h2 id="aciklama" className="text-xl font-bold tracking-tight sm:text-2xl">
              Açıklama
            </h2>
            {l.description ? (
              <p className="mt-2 whitespace-pre-line text-lg">{l.description}</p>
            ) : (
              <p className="mt-2 text-muted-foreground">Satıcı açıklama eklemedi. Merak ettiklerinizi mesajla sorabilirsiniz.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4 px-3 lg:sticky lg:top-24 lg:space-y-5 lg:px-0">
          <div id="iletisim" className="scroll-mt-20 rounded-xl border border-border p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <Avatar id={l.seller.id} name={l.seller.name} size={52} />
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">{l.seller.name}</p>
                <p className="text-muted-foreground">
                  Üyelik: {monthYear(new Date(l.seller.memberSince))} · {l.seller.activeListings} ilan
                </p>
              </div>
            </div>
            <p className="mt-4 text-muted-foreground">Telefon numaraları paylaşılmaz. Görüşmeyi buradan, site içi mesajla başlatın.</p>
            <div className="mt-5">
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
            {contactable && (
              <div className="mt-3">
                <FavoriteButton listingId={l.id} favorite={l.favorite} variant="inline" />
              </div>
            )}
          </div>
          {admin && !mine && (
            <div className="rounded-xl border border-gold/30 p-4 sm:p-5">
              <OwnerActions listingId={l.id} status={l.status} admin />
            </div>
          )}
          <SafetyNote />
          {!mine && userId && <ReportListing listingId={l.id} reported={l.reported} />}
        </aside>
      </div>

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
    <div aria-hidden="true" className="mt-4 grid gap-8 px-3 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-0">
      <div className="space-y-6">
        <div className="aspect-[4/3] rounded-2xl bg-muted motion-safe:animate-pulse" />
        <div className="h-10 w-3/4 rounded-xl bg-muted" />
        <div className="h-8 w-1/3 rounded-xl bg-muted" />
      </div>
      <div className="h-80 rounded-2xl bg-muted motion-safe:animate-pulse" />
    </div>
  );
}
