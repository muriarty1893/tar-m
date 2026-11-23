import Image from "next/image";
import Link from "next/link";
import type { ListingCard } from "@/lib/market-data";
import { categoryLabel, conditionLabel, formatPrice, type Condition } from "@/lib/market";

const day = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", timeZone: "Europe/Istanbul" });
const year = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { year: "numeric", timeZone: "Europe/Istanbul" });

const th = "py-1.5 pl-3 font-bold";
const td = "py-1.5 pl-3 align-middle";

/**
 * Wide screens: the results as sahibinden.com lists them, a dense table of small photo, title, the
 * listing's attributes (Kategori, Durumu), price, date and place, with light stripes. The whole row
 * opens the listing; the title is the one link (one stop for the keyboard and screen readers).
 */
export function ListingTable({ items, userId }: { items: ListingCard[]; userId: string | null }) {
  return (
    <table className="w-full border-collapse text-[13px]">
      <caption className="sr-only">İlanlar</caption>
      <thead>
        <tr className="border-b border-border bg-muted/70 text-[12px] text-muted-foreground">
          <th scope="col" className={`${th} w-[7.5rem] text-left`}>
            <span className="sr-only">Fotoğraf</span>
          </th>
          <th scope="col" className={`${th} text-left`}>
            İlan başlığı
          </th>
          <th scope="col" className={`${th} w-28 text-left`}>
            Kategori
          </th>
          <th scope="col" className={`${th} w-20 text-left`}>
            Durumu
          </th>
          <th scope="col" className={`${th} w-32 pr-3 text-right`}>
            Fiyat
          </th>
          <th scope="col" className={`${th} w-24 text-left`}>
            İlan tarihi
          </th>
          <th scope="col" className={`${th} w-28 pr-3 text-left`}>
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
              <td className={td}>
                <span className="relative block h-[4.125rem] w-[5.5rem] overflow-hidden rounded-sm bg-muted">
                  <Image src={l.photo} alt="" fill sizes="88px" className="object-cover" />
                  {l.status === "sold" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[10.5px] font-bold tracking-[0.12em] text-white">SATILDI</span>
                  )}
                </span>
              </td>
              <td className={`${td} pr-2`}>
                {/* The link covers the row (::after), so a click anywhere opens the listing. */}
                <Link
                  href={`/pazar/ilan/${l.id}`}
                  className="line-clamp-2 font-semibold text-primary after:absolute after:inset-0 after:content-[''] group-hover:underline focus-visible:outline-offset-2"
                >
                  {l.title}
                </Link>
                {(mine || l.stockPhoto) && (
                  <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted-foreground">
                    {mine && <span className="rounded-sm bg-secondary px-1 font-bold text-primary">Sizin ilanınız</span>}
                    {l.stockPhoto && <span>Temsilî görsel</span>}
                  </span>
                )}
              </td>
              <td className={td}>{categoryLabel(l.category)}</td>
              <td className={td}>{condition ?? <span className="text-muted-foreground">–</span>}</td>
              <td className={`${td} whitespace-nowrap pr-3 text-right`}>
                <span className="font-borsa-mono text-[13.5px] font-semibold">{formatPrice(l.price)}</span>
                {l.unit && <span className="block text-[11.5px] text-muted-foreground">/ {l.unit}</span>}
              </td>
              <td className={`${td} leading-tight`}>
                <span className="block">{day(l.createdAt)}</span>
                <span className="block text-muted-foreground">{year(l.createdAt)}</span>
              </td>
              <td className={`${td} pr-3 leading-tight`}>
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
