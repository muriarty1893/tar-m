import Image from "next/image";
import Link from "next/link";
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr";
import type { ListingCard } from "@/lib/market-data";
import { categoryLabel, formatTL } from "@/lib/market";
import { agoLabel } from "@/lib/tr-time";

/**
 * A listing as a row, the way sahibinden.com lists them on a phone: the photo on the left; the title,
 * the place, then the date and (bottom right) the price in the site's blue. Hairlines between rows.
 */
export function ListingRow({ listing: l, now, mine = false }: { listing: ListingCard; now?: Date; mine?: boolean }) {
  const place = l.district ? `${l.district}, ${l.province}` : l.province;
  return (
    <li>
      <Link href={`/pazar/ilan/${l.id}`} className="flex gap-3 px-3 py-3 transition-colors hover:bg-secondary focus-visible:outline-offset-[-3px] sm:px-4">
        <span className="relative h-[5.25rem] w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-32">
          <Image src={l.photo} alt="" fill sizes="(min-width: 640px) 144px, 126px" className="object-cover" />
          {l.stockPhoto && <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 text-center text-[0.625rem] font-medium leading-4 text-white">Temsilî görsel</span>}
          {l.status === "sold" && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold tracking-[0.12em] text-white">SATILDI</span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="line-clamp-2 text-[15px] font-semibold leading-snug">{l.title}</span>
          <span className="mt-0.5 flex min-w-0 items-center gap-1 text-[13px] text-muted-foreground">
            <MapPinIcon aria-hidden="true" weight="fill" className="size-3.5 shrink-0" />
            <span className="truncate">{place}</span>
          </span>
          <span className="mt-auto flex items-end justify-between gap-2 pt-1">
            <span className="text-[12.5px] text-muted-foreground">{now ? agoLabel(new Date(l.createdAt), now) : ""}</span>
            <span className="shrink-0 text-right font-borsa-mono text-[15px] font-semibold text-primary">
              {formatTL(l.price)}
              {l.unit && <span className="font-sans text-[12.5px] font-medium text-muted-foreground"> / {l.unit}</span>}
            </span>
          </span>
          <span className="sr-only">
            Kategori: {categoryLabel(l.category)}
            {mine ? ". Sizin ilanınız" : ""}
          </span>
        </span>
        {mine && l.status === "active" && <span className="self-start rounded bg-secondary px-1.5 text-xs font-bold leading-5 text-primary">Sizin</span>}
      </Link>
    </li>
  );
}
