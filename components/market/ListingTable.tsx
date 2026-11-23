import Image from "next/image";
import Link from "next/link";
import type { ListingCard } from "@/lib/market-data";
import { categoryLabel, conditionLabel, formatPrice, type Condition } from "@/lib/market";

const day = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", timeZone: "Europe/Istanbul" });
const year = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { year: "numeric", timeZone: "Europe/Istanbul" });

/**
 * Wide screens: the results as sahibinden.com lists them, a dense table with a small photo, the
 * title, the price, the date and the place, light stripes between rows. The whole row opens the
 * listing; the title is the link (one stop for the keyboard and screen readers).
 */
export function ListingTable({ items, userId }: { items: ListingCard[]; userId: string | null }) {
  return (
    <table className="w-full border-collapse text-[13.5px]">
      <caption className="sr-only">İlanlar</caption>
      <thead>
        <tr className="border-b border-border bg-muted/60 text-left text-[12.5px] text-muted-foreground">
          <th scope="col" className="w-[8.5rem] py-2 pl-3 font-semibold">
            <span className="sr-only">Fotoğraf</span>
          </th>
          <th scope="col" className="py-2 pl-3 font-semibold">
            İlan başlığı
          </th>
          <th scope="col" className="w-36 py-2 pr-4 text-right font-semibold">
            Fiyat
          </th>
          <th scope="col" className="w-28 py-2 pl-3 font-semibold">
            İlan tarihi
          </th>
          <th scope="col" className="w-36 py-2 pl-3 pr-3 font-semibold">
            İl / İlçe
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((l) => {
          const mine = l.sellerId === userId;
          const condition = conditionLabel((l.condition ?? undefined) as Condition | undefined);
          return (
            <tr key={l.id} className="group relative border-b border-border last:border-b-0 even:bg-muted/35 hover:bg-secondary">
              <td className="py-1.5 pl-3 align-middle">
                <span className="relative block h-[4.5rem] w-24 overflow-hidden rounded bg-muted">
                  <Image src={l.photo} alt="" fill sizes="96px" className="object-cover" />
                  {l.status === "sold" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[11px] font-bold tracking-[0.12em] text-white">SATILDI</span>
                  )}
                </span>
              </td>
              <td className="py-1.5 pl-3 align-middle">
                {/* The link covers the row (::after), so a click anywhere opens the listing. */}
                <Link
                  href={`/pazar/ilan/${l.id}`}
                  className="line-clamp-2 font-semibold text-primary after:absolute after:inset-0 after:content-[''] group-hover:underline focus-visible:outline-offset-2"
                >
                  {l.title}
                </Link>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12.5px] text-muted-foreground">
                  {categoryLabel(l.category)}
                  {condition && <span>· {condition}</span>}
                  {l.stockPhoto && <span>· Temsilî görsel</span>}
                  {mine && <span className="rounded bg-secondary px-1.5 text-[11.5px] font-bold leading-[1.125rem] text-primary">Sizin ilanınız</span>}
                </span>
              </td>
              <td className="whitespace-nowrap py-1.5 pr-4 text-right align-middle">
                <span className="font-borsa-mono text-[14px] font-semibold">{formatPrice(l.price)}</span>
                {l.unit && <span className="block text-[12px] text-muted-foreground">/ {l.unit}</span>}
              </td>
              <td className="py-1.5 pl-3 align-middle leading-tight">
                <span className="block">{day(l.createdAt)}</span>
                <span className="block text-muted-foreground">{year(l.createdAt)}</span>
              </td>
              <td className="py-1.5 pl-3 pr-3 align-middle leading-tight">
                <span className="block">{l.province}</span>
                {l.district && <span className="block text-muted-foreground">{l.district}</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
