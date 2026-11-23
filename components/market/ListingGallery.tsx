"use client";

import Image from "next/image";
import { useState } from "react";
import { CaretLeftIcon, CaretRightIcon, MagnifyingGlassPlusIcon } from "@phosphor-icons/react/dist/ssr";

const arrow =
  "absolute top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/65 focus-visible:outline-white";

/**
 * The listing's photos as on sahibinden.com: a framed box with the ilan no in the corner, the large
 * photo shown whole (‹ › to step through), a "Büyük Fotoğraf" bar that opens it full size, the
 * thumbnails in rows of five, and "1/5 Fotoğraf".
 */
export function ListingGallery({ photos, title, stockPhoto, listingNo }: { photos: string[]; title: string; stockPhoto: boolean; listingNo?: string }) {
  const [index, setIndex] = useState(0);
  const current = photos[index] ?? photos[0];
  const many = photos.length > 1;
  const go = (step: number) => setIndex((i) => (i + step + photos.length) % photos.length);
  return (
    <div className="border-y border-border bg-card lg:border-x">
      <div
        className="relative aspect-[4/3] overflow-hidden bg-card"
        onKeyDown={(e) => {
          if (!many) return;
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        <Image
          src={current}
          alt={stockPhoto ? "" : `${title}, fotoğraf ${index + 1} / ${photos.length}`}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1280px) 520px, (min-width: 1024px) 60vw, 100vw"
          className={stockPhoto ? "object-cover" : "object-contain"}
        />
        {listingNo && <span className="absolute left-2 top-2 rounded-sm bg-card/85 px-1.5 text-[11.5px] text-muted-foreground">#{listingNo}</span>}
        {many && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Önceki fotoğraf" className={`${arrow} left-2`}>
              <CaretLeftIcon aria-hidden="true" weight="bold" className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Sonraki fotoğraf" className={`${arrow} right-2`}>
              <CaretRightIcon aria-hidden="true" weight="bold" className="size-5" />
            </button>
          </>
        )}
        {stockPhoto && (
          <span className="absolute bottom-2 left-2 rounded-sm bg-black/65 px-2 py-0.5 text-[12.5px] font-medium text-white">Temsilî görsel: satıcı fotoğraf eklemedi</span>
        )}
      </div>

      <div className="flex border-y border-border bg-muted/50 text-[13px]">
        <a
          href={current}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-9 flex-1 items-center justify-center gap-1.5 font-bold text-primary hover:underline"
        >
          <MagnifyingGlassPlusIcon aria-hidden="true" weight="bold" className="size-4" />
          Büyük Fotoğraf
        </a>
      </div>

      {many && (
        <ul className="grid grid-cols-5 gap-1.5 p-2" aria-label="Fotoğraflar">
          {photos.map((p, i) => (
            <li key={p}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Fotoğraf ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden border-2 border-transparent bg-muted aria-[current=true]:border-primary"
              >
                <Image src={p} alt="" fill sizes="100px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p aria-live="polite" className="px-2 pb-2 pt-1 text-[12.5px] tabular-nums">
        {index + 1}/{photos.length} Fotoğraf
      </p>
    </div>
  );
}
