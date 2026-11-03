import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon, CalendarBlankIcon, CheckCircleIcon, MapPinIcon, PackageIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/pazar" className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline">
        <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-5" />
        Pazar’a dön
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <Listing params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Listing({ params, searchParams }: Pick<PageProps<"/pazar/ilan/[id]">, "params" | "searchParams">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const userId = await getUserId();
  const l = await getListing(id, userId);
  const mine = Boolean(userId && l?.sellerId === userId);
  if (!l || (l.status === "removed" && !mine && !(await isAdmin(userId)))) notFound();
  const now = await requestNow();
  const condition = conditionLabel((l.condition ?? undefined) as Condition | undefined);

  const facts = [
    { Icon: MapPinIcon, label: "Konum", value: placeLabel(l.province, l.district) },
    { Icon: CalendarBlankIcon, label: "İlan tarihi", value: agoLabel(new Date(l.createdAt), now) },
    l.quantity ? { Icon: PackageIcon, label: "Miktar", value: l.quantity } : { Icon: StorefrontIcon, label: "Kategori", value: categoryLabel(l.category) },
  ];

  return (
    <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <div className="min-w-0 space-y-8">
        {(sp.yeni === "1" || sp.kaydedildi === "1") && (
          <p role="status" className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-secondary px-4 py-3 font-semibold">
            <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 shrink-0 text-primary" />
            {sp.yeni === "1" ? "İlanınız yayında. Alıcılar size buradan mesaj gönderebilir." : "Değişiklikler kaydedildi."}
          </p>
        )}
        <ListingGallery photos={l.photos} title={l.title} stockPhoto={l.stockPhoto} />

        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">{categoryLabel(l.category)}</span>
            {condition && <span className="rounded-full border border-border px-3 py-1 text-sm font-semibold">{condition}</span>}
            {l.status === "sold" && <span className="rounded-full bg-foreground px-3 py-1 text-sm font-semibold text-background">Satıldı</span>}
            {l.status === "removed" && <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">Kaldırıldı</span>}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{l.title}</h1>
          <p className="mt-2 text-3xl font-bold text-primary">
            {priceLabel(l.price, l.unit)}
            {l.negotiable && <span className="ml-3 align-middle text-base font-semibold text-gold">Pazarlık payı var</span>}
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-3">
          {facts.map(({ Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-border p-4">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon aria-hidden="true" weight="duotone" className="size-5 text-primary" />
                {label}
              </dt>
              <dd className="mt-1 font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="aciklama">
          <h2 id="aciklama" className="text-2xl font-bold tracking-tight">
            Açıklama
          </h2>
          {l.description ? (
            <p className="mt-3 whitespace-pre-line text-lg">{l.description}</p>
          ) : (
            <p className="mt-3 text-muted-foreground">Satıcı açıklama eklemedi. Merak ettiklerinizi mesajla sorabilirsiniz.</p>
          )}
        </section>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-border p-5">
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
          {!mine && l.status === "active" && (
            <div className="mt-3">
              <FavoriteButton listingId={l.id} favorite={l.favorite} variant="inline" />
            </div>
          )}
        </div>
        <SafetyNote />
        {!mine && userId && <ReportListing listingId={l.id} reported={l.reported} />}
      </aside>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div aria-hidden="true" className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-6">
        <div className="aspect-[4/3] rounded-2xl bg-muted motion-safe:animate-pulse" />
        <div className="h-10 w-3/4 rounded-xl bg-muted" />
        <div className="h-8 w-1/3 rounded-xl bg-muted" />
      </div>
      <div className="h-80 rounded-2xl bg-muted motion-safe:animate-pulse" />
    </div>
  );
}
