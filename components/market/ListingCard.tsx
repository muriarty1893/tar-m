import Image from "next/image";
import Link from "next/link";
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr";
import type { ListingCard as Card } from "@/lib/market-data";
import { categoryLabel, formatPrice, placeLabel } from "@/lib/market";
import { agoLabel } from "@/lib/tr-time";
import { FavoriteButton } from "./FavoriteButton";

/** A listing in the grid: photo (with the heart), price, title, and place · time (when `now` is known). */
export function ListingCard({ listing: l, now, mine = false, showFavorite = true }: { listing: Card; now?: Date; mine?: boolean; showFavorite?: boolean }) {
  const when = now ? agoLabel(new Date(l.createdAt), now) : "";
  const place = l.district || l.province;
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-lift">
      <Link href={`/pazar/ilan/${l.id}`} className="block focus-visible:outline-offset-[-3px]">
        <div className="relative aspect-[4/3] bg-muted">
          <Image src={l.photo} alt="" fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw" className="object-cover" />
          {l.stockPhoto && <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">Temsilî görsel</span>}
          {l.status === "sold" && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold tracking-[0.15em] text-white">SATILDI</span>
          )}
          {mine && l.status === "active" && <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">Sizin ilanınız</span>}
        </div>
        <div className="p-3">
          <p className="truncate text-lg font-bold">
            {formatPrice(l.price)}
            {l.unit && <span className="text-sm font-medium text-muted-foreground"> / {l.unit}</span>}
          </p>
          <h3 className="line-clamp-2 min-h-[2lh] font-medium leading-snug">{l.title}</h3>
          <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPinIcon aria-hidden="true" weight="fill" className="size-4 shrink-0" />
            <span className="truncate">
              {when ? `${place} · ${when}` : placeLabel(l.province, l.district)}
            </span>
          </p>
          <p className="sr-only">Kategori: {categoryLabel(l.category)}</p>
        </div>
      </Link>
      {showFavorite && !mine && <FavoriteButton listingId={l.id} favorite={l.favorite} />}
    </article>
  );
}
