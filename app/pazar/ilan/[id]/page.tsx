import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CaretRightIcon, ChatsCircleIcon, CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/market/Avatar";
import { ContactSeller } from "@/components/market/ContactSeller";
import { FavoriteButton } from "@/components/market/FavoriteButton";
import { ListingGallery } from "@/components/market/ListingGallery";
import { ListingTitleActions } from "@/components/market/ListingTitleActions";
import { OwnerActions } from "@/components/market/OwnerActions";
import { ReportListing } from "@/components/market/ReportListing";
import { getUserId, isAdmin, signInHref } from "@/lib/auth";
import { categoryLabel, conditionLabel, formatTL, listingNo, placeLabel, priceLabel, type Condition } from "@/lib/market";
import { getListing } from "@/lib/market-data";
import { monthYear } from "@/lib/tr-time";
import { siteUrl } from "@/lib/site-url";
import { siteConfig } from "@/config/site";

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
    <Suspense fallback={<DetailSkeleton />}>
      <Listing params={params} searchParams={searchParams} />
    </Suspense>
  );
}

const longDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

/**
 * A listing, copied from sahibinden.com's layout in the site's colours: the category path in a grey
 * strip; the title with "Favorilerime Ekle", Yazdır and shares; then the photos, the price with the
 * place and the dotted facts list, and the seller box side by side; under them the "İlan Detayları"
 * tab with the "Açıklama" box and the safety text.
 */
async function Listing({ params, searchParams }: Pick<PageProps<"/pazar/ilan/[id]">, "params" | "searchParams">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const userId = await getUserId();
  const [l, admin] = await Promise.all([getListing(id, userId), isAdmin(userId)]);
  const mine = Boolean(userId && l?.sellerId === userId);
  if (!l || (l.status === "removed" && !mine && !admin)) notFound();
  const condition = conditionLabel((l.condition ?? undefined) as Condition | undefined);
  const contactable = !mine && l.status === "active";
  const no = listingNo(l.id);

  const facts: [string, string][] = [
    ["İlan No", no],
    ["İlan Tarihi", longDate(l.createdAt)],
    ["Kategori", categoryLabel(l.category)],
    ...(condition ? [["Durumu", condition] as [string, string]] : []),
    ...(l.quantity ? [["Miktar", l.quantity] as [string, string]] : []),
    ...(l.unit ? [["Birim", l.unit] as [string, string]] : []),
    ["Pazarlık", l.negotiable ? "Var" : "Yok"],
  ];

  return (
    <>
      {/* The grey strip: the category path on the left, your lists on the right. */}
      <div className="border-b border-border bg-muted/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-1.5 text-[12.5px] xl:px-4">
          <nav aria-label="Konum">
            <ol className="flex flex-wrap items-center gap-1 text-primary">
              <li>
                <Link href="/pazar" className="hover:underline">
                  Pazar
                </Link>
              </li>
              <li className="flex items-center gap-1">
                <CaretRightIcon aria-hidden="true" weight="bold" className="size-2.5 text-muted-foreground" />
                <Link href={`/pazar?kategori=${l.category}`} className="hover:underline">
                  {categoryLabel(l.category)}
                </Link>
              </li>
              <li className="flex items-center gap-1">
                <CaretRightIcon aria-hidden="true" weight="bold" className="size-2.5 text-muted-foreground" />
                <Link href={`/pazar?kategori=${l.category}&il=${encodeURIComponent(l.province)}`} className="hover:underline">
                  {l.province}
                </Link>
              </li>
            </ol>
          </nav>
          <ul className="flex items-center divide-x divide-border text-primary max-sm:hidden">
            <li className="pr-2">
              <Link href="/pazar?gorunum=favoriler" className="hover:underline">
                Favori İlanlarım
              </Link>
            </li>
            <li className="px-2">
              <Link href="/pazar?gorunum=ilanlarim" className="hover:underline">
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

      <div className="mx-auto max-w-6xl pb-6 xl:px-4">
        {(sp.yeni === "1" || sp.kaydedildi === "1") && (
          <p role="status" className="mx-3 mt-3 flex items-center gap-2 rounded-sm border border-primary/30 bg-secondary px-4 py-3 font-semibold xl:mx-0">
            <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 shrink-0 text-primary" />
            {sp.yeni === "1" ? "Tebrikler! İlanınız yayında. Alıcılar size buradan mesaj gönderebilir." : "Değişiklikler kaydedildi."}
          </p>
        )}

        {/* The title row. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-3 py-3 xl:px-0">
          <h1 className="min-w-0 flex-1 text-[19px] font-bold leading-snug xl:text-[20px]">{l.title}</h1>
          {l.status === "sold" && <span className="rounded-sm bg-foreground px-2 py-0.5 text-[13px] font-semibold text-background">Satıldı</span>}
          {l.status === "removed" && <span className="rounded-sm bg-destructive/10 px-2 py-0.5 text-[13px] font-semibold text-destructive">Kaldırıldı</span>}
          <div className="flex items-center gap-1">
            {contactable && <FavoriteButton listingId={l.id} favorite={l.favorite} variant="text" />}
            <ListingTitleActions url={`${siteUrl}/pazar/ilan/${l.id}`} title={l.title} />
          </div>
        </div>

        <div className="grid gap-4 pt-3 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start xl:grid-cols-[minmax(0,32.5rem)_minmax(0,1fr)_18.5rem] xl:gap-5">
          {/* Photos. */}
          <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1 xl:row-span-1">
            <ListingGallery photos={l.photos} title={l.title} stockPhoto={l.stockPhoto} listingNo={no} />
          </div>

          {/* The price, the place and the facts. */}
          <section aria-label="İlan bilgileri" className="min-w-0 px-3 lg:col-start-2 lg:row-start-1 lg:px-0">
            <p className="text-[19px] font-bold leading-tight text-primary">
              {formatTL(l.price)}
              {l.unit && <span className="text-[14px] font-semibold"> / {l.unit}</span>}
            </p>
            {l.negotiable && <p className="mt-0.5 text-[12.5px] font-semibold text-gold">Pazarlık payı var</p>}
            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[13.5px] font-semibold text-primary">
              <Link href={`/pazar?il=${encodeURIComponent(l.province)}`} className="hover:underline">
                {l.province}
              </Link>
              {l.district && (
                <>
                  <span aria-hidden="true">/</span>
                  <span>{l.district}</span>
                </>
              )}
            </p>
            <dl className="mt-2.5 border-t border-dotted border-input text-[13px]">
              {facts.map(([label, value]) => (
                <div key={label} className="flex gap-3 border-b border-dotted border-input py-[5px]">
                  <dt className="w-32 shrink-0 font-bold">{label}</dt>
                  <dd className={label === "İlan No" ? "text-create" : ""}>{value}</dd>
                </div>
              ))}
            </dl>
            {!mine && userId && (
              <div className="mt-1 flex justify-center">
                <ReportListing listingId={l.id} reported={l.reported} />
              </div>
            )}
          </section>

          {/* The seller, and how to reach them. */}
          <aside aria-label="Satıcı" className="space-y-3 px-3 lg:col-start-2 lg:row-start-2 lg:px-0 xl:col-start-3 xl:row-start-1">
            <section id="iletisim" className="scroll-mt-20 rounded-sm border border-border bg-card shadow-soft">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Avatar id={l.seller.id} name={l.seller.name} photo={l.seller.photo} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold">{l.seller.name}</p>
                  <p className="text-[12.5px] text-muted-foreground">
                    Hesap açma tarihi: {monthYear(new Date(l.seller.memberSince))} · {l.seller.activeListings} ilan
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="mb-3 rounded-sm border border-border px-3 py-2 text-[12.5px] text-muted-foreground">
                  Telefon numaraları paylaşılmaz. Satıcıya site içinden mesaj gönderin.
                </p>
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
            </section>
            {admin && !mine && (
              <div className="rounded-sm border border-gold/30 bg-card p-3">
                <OwnerActions listingId={l.id} status={l.status} admin />
              </div>
            )}
          </aside>
        </div>

        {/* sahibinden's tabs under the listing; here one: İlan Detayları. */}
        <div className="mt-6 px-3 xl:px-0">
          <div className="flex gap-1.5 border-b-2 border-primary">
            <h2 className="inline-flex min-h-10 items-center rounded-t-sm bg-primary px-4 text-[14px] font-semibold text-primary-foreground">İlan Detayları</h2>
          </div>
          <section aria-labelledby="aciklama" className="mt-1.5 rounded-sm border border-border bg-card">
            <h3 id="aciklama" className="border-b border-border bg-gradient-to-b from-card to-muted px-3 py-2 text-[14px] font-bold">
              Açıklama
            </h3>
            <div className="px-4 py-4">
              {l.description ? (
                <p className="max-w-[80ch] whitespace-pre-line text-[15px] leading-relaxed">{l.description}</p>
              ) : (
                <p className="text-muted-foreground">Satıcı açıklama eklemedi. Merak ettiklerinizi mesajla sorabilirsiniz.</p>
              )}
            </div>
          </section>
          <section aria-label="Güvenli alışveriş" className="mt-2.5 rounded-sm border border-border bg-card px-4 py-3 text-[12.5px]">
            <p className="font-bold">{siteConfig.name} Pazar, tüm kullanıcılar için güvenli bir alışveriş ortamı sağlamayı amaçlar.</p>
            <p className="mt-2">
              Kendi güvenliğiniz ve diğer kullanıcıların sağlıklı alışveriş yapabilmesi için ürünü görmeden ve teslim almadan ön ödeme, avans ya da kapora göndermeyin;
              buluşmayı gündüz ve kalabalık bir yerde yapın. İlandaki bir bilginin ya da görselin gerçeği yansıtmadığını düşünüyorsanız lütfen{" "}
              <Link href="/pazar/kurallar" className="text-primary hover:underline">
                bize haber verin
              </Link>
              .
            </p>
          </section>
        </div>
      </div>

      {/* Phones: a bar at the bottom, above the tab bar, so the seller is one tap away. */}
      {contactable && (
        <div className="hide-while-typing fixed inset-x-0 bottom-[var(--bottom-nav)] z-30 flex gap-2 border-t border-border bg-background/95 px-3 py-2 backdrop-blur-md lg:hidden">
          <a href={l.conversationId ? `/mesajlar/${l.conversationId}` : "#iletisim"} className={buttonVariants({ size: "lg", className: "flex-1" })}>
            <ChatsCircleIcon aria-hidden="true" weight="duotone" />
            {l.conversationId ? "Sohbete devam et" : "Mesaj gönder"}
          </a>
        </div>
      )}
      {contactable && <div aria-hidden="true" className="h-16 lg:hidden" />}
    </>
  );
}

function DetailSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="h-8 border-b border-border bg-muted/60" />
      <div className="mx-auto max-w-6xl px-3 xl:px-4">
        <div className="my-3 h-7 w-2/3 rounded bg-muted" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,32.5rem)_minmax(0,1fr)_18.5rem]">
          <div className="aspect-[4/3] bg-muted motion-safe:animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-1/3 rounded bg-muted" />
            <div className="h-56 rounded bg-muted" />
          </div>
          <div className="h-64 rounded-sm bg-muted max-xl:hidden" />
        </div>
      </div>
    </div>
  );
}
