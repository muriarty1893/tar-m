import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon, CalendarBlankIcon, ChartLineUpIcon, ChatsCircleIcon, CloudSunIcon, PlantIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { Section } from "./Section";
import { ListingCard } from "./market/ListingCard";
import { buttonVariants } from "./ui/button";
import { latestListings } from "@/lib/market-data";

const tools = [
  { href: "/pazar", Icon: StorefrontIcon, title: "Pazar", text: "Ürün, tohum, alet ve araç ilanları; ilan vermek ücretsiz." },
  { href: "/mesajlar", Icon: ChatsCircleIcon, title: "Mesajlar ve teklifler", text: "Satıcıyla site içinden yazışın, teklif verin, pazarlık edin." },
  { href: "/fiyatlar", Icon: ChartLineUpIcon, title: "Borsa fiyatları", text: "Ürünlerin kilogram fiyatı ve haftalık değişimi." },
  { href: "/hava", Icon: CloudSunIcon, title: "Hava durumu", text: "81 il için 7 günlük tahmin, don ve ilaçlama uyarıları." },
  { href: "/takvim", Icon: CalendarBlankIcon, title: "Tarım takvimi", text: "Tarla işlerinizi planlayın, yaptıklarınızı işaretleyin." },
  { href: "/tarlalarim", Icon: PlantIcon, title: "Tarlalarım", text: "Tarlalarınız, sezon masraflarınız ve dönüm başı maliyet." },
];

/** "Pazarda yeni": the newest listings (cached for minutes; a new listing refreshes it). */
async function NewListings() {
  const listings = await latestListings(4);
  if (!listings.length) {
    return (
      <p className="rounded-2xl border border-dashed border-input px-6 py-8 text-center text-lg">
        Pazar yeni açıldı.{" "}
        <Link href="/pazar/ilan-ver" className="font-semibold text-primary underline underline-offset-4">
          İlk ilanı siz verin
        </Link>
        .
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {listings.map((l) => (
        <li key={l.id}>
          {/* Cached, so no "3 saat önce": that would go stale. */}
          <ListingCard listing={l} showFavorite={false} />
        </li>
      ))}
    </ul>
  );
}

/** The home page's tools that work on the website today, then the market's newest listings. */
export function HomeTools() {
  return (
    <Section
      id="araclar"
      eyebrow="Şimdi kullanın"
      title="Sitede bugün açık olanlar"
      intro="Uygulamayı beklemeden kullanmaya başlayın. Hava durumu ve fiyatlar için hesap gerekmez; Pazar, takvim ve tarlalar için ücretsiz bir hesap yeter."
      // No top rule: the hero's field photo fades out across this section's top padding.
      className="border-t-0!"
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(({ href, Icon, title, text }) => (
          <li key={href}>
            <Link href={href} className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary">
              <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary group-hover:bg-card">
                <Icon weight="duotone" className="size-7" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-lg font-bold">
                  {title}
                  <ArrowRightIcon aria-hidden="true" weight="bold" className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-1 block text-muted-foreground">{text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-14 flex flex-wrap items-end justify-between gap-4">
        <h3 className="text-2xl font-bold tracking-tight">Pazarda yeni</h3>
        <Link href="/pazar" className={buttonVariants({ variant: "outline" })}>
          Tüm ilanlar
        </Link>
      </div>
      <div className="mt-6">
        <Suspense fallback={<div aria-hidden="true" className="h-64 rounded-2xl bg-muted" />}>
          <NewListings />
        </Suspense>
      </div>
    </Section>
  );
}
