import { Fragment } from "react";
import Image from "next/image";
import { AdStrip } from "@/components/ads/AdStrip";
import Link from "next/link";
import type { ListingCard } from "@/lib/market-data";
import { formatTL } from "@/lib/market";

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Istanbul",
  });
const year = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", {
    year: "numeric",
    timeZone: "Europe/Istanbul",
  });

const th =
  "border-l-2 border-card px-2 py-2 text-center font-bold first:border-l-0";
const td = "border-l-2 border-card px-2 py-1 align-middle first:border-l-0";

/**
 * Wide screens: the results as sahibinden.com lists them. A grey header with centred titles, then
 * rows of photo, İlan Başlığı, Fiyat, İlan Tarihi and İl / İlçe, white lines between the columns and
 * every other row grey. The whole row opens the listing; the title is the one link.
 */
export function ListingTable({
  items,
  userId,
  adAfter = -1,
}: {
  items: ListingCard[];
  userId: string | null;
  adAfter?: number;
}) {
  return (
    <table className="w-full border-collapse text-[13px]">
      <caption className="sr-only">İlanlar</caption>
      <thead>
        <tr className="bg-muted text-[13px]">
          <th scope="col" className={`${th} w-[8.5rem]`}>
            <span className="sr-only">Fotoğraf</span>
          </th>
          <th scope="col" className={th}>
            İlan Başlığı
          </th>
          <th scope="col" className={`${th} w-32 text-primary`}>
            Fiyat
          </th>
          <th scope="col" className={`${th} w-24 text-primary`}>
            İlan Tarihi
          </th>
          <th scope="col" className={`${th} w-28 text-primary`}>
            İl / İlçe
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((l, i) => {
          const mine = l.sellerId === userId;
          return (
            <Fragment key={l.id}>
              <tr
                className={`group relative hover:bg-secondary ${i % 2 ? "bg-muted/60" : "bg-card"}`}
              >
                <td className={td}>
                  <span className="relative mx-auto block h-[5.75rem] w-[7.75rem] overflow-hidden bg-muted">
                    <Image
                      src={l.photo}
                      alt=""
                      fill
                      sizes="124px"
                      className="object-cover"
                    />
                    {l.status === "sold" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[11px] font-bold tracking-[0.12em] text-white">
                        SATILDI
                      </span>
                    )}
                  </span>
                </td>
                <td className={`${td} pl-3`}>
                  {/* The link covers the row (::after), so a click anywhere opens the listing. */}
                  <Link
                    href={`/pazar/ilan/${l.id}`}
                    className="text-primary after:absolute after:inset-0 after:content-[''] group-hover:underline focus-visible:outline-offset-2"
                  >
                    {l.title}
                  </Link>
                  {(mine || l.stockPhoto) && (
                    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted-foreground">
                      {mine && (
                        <span className="rounded-sm bg-secondary px-1 font-bold text-primary">
                          Sizin ilanınız
                        </span>
                      )}
                      {l.stockPhoto && <span>Temsilî görsel</span>}
                    </span>
                  )}
                </td>
                <td className={`${td} whitespace-nowrap text-center`}>
                  <span className="font-semibold text-[var(--create-hover)]">
                    {formatTL(l.price)}
                  </span>
                  {l.unit && (
                    <span className="block text-[11.5px] text-muted-foreground">
                      / {l.unit}
                    </span>
                  )}
                </td>
                <td className={`${td} text-center leading-tight`}>
                  {day(l.createdAt)}
                  <br />
                  {year(l.createdAt)}
                </td>
                <td className={`${td} text-center leading-tight`}>
                  {l.province}
                  {l.district && (
                    <>
                      <br />
                      {l.district}
                    </>
                  )}
                </td>
              </tr>
              {i === adAfter && <AdStrip as="tr" colSpan={5} />}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
