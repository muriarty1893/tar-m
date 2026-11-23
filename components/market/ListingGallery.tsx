"use client";

import Image from "next/image";
import { useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";

const arrow =
  "absolute top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65 focus-visible:outline-white";

/**
 * The listing's photos as on sahibinden.com: the large one with ‹ › arrows and "2 / 5", and the
 * thumbnails under it to jump to one.
 */
export function ListingGallery({ photos, title, stockPhoto }: { photos: string[]; title: string; stockPhoto: boolean }) {
  const [index, setIndex] = useState(0);
  const current = photos[index] ?? photos[0];
  const many = photos.length > 1;
  const go = (step: number) => setIndex((i) => (i + step + photos.length) % photos.length);
  return (
    <div>
      {/* Edge to edge on phones; a framed photo from 1024 px. */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-muted lg:rounded-md lg:border lg:border-border"
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
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
        />
        {many && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Önceki fotoğraf" className={`${arrow} left-2`}>
              <CaretLeftIcon aria-hidden="true" weight="bold" className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Sonraki fotoğraf" className={`${arrow} right-2`}>
              <CaretRightIcon aria-hidden="true" weight="bold" className="size-5" />
            </button>
            <span aria-live="polite" className="absolute bottom-2 right-2 rounded bg-black/65 px-2 py-0.5 text-[13px] font-semibold text-white tabular-nums">
              {index + 1} / {photos.length}
            </span>
          </>
        )}
        {stockPhoto && (
          <span className="absolute bottom-2 left-2 rounded bg-black/65 px-2.5 py-1 text-[13px] font-medium text-white">Temsilî görsel: satıcı fotoğraf eklemedi</span>
        )}
      </div>
      {many && (
        <ul className="mt-2 flex gap-1.5 overflow-x-auto px-3 pb-1 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0" aria-label="Fotoğraflar">
          {photos.map((p, i) => (
            <li key={p} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Fotoğraf ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className="relative block aspect-[4/3] w-16 cursor-pointer overflow-hidden rounded-sm border-2 border-transparent bg-muted opacity-80 transition-opacity hover:opacity-100 aria-[current=true]:border-primary aria-[current=true]:opacity-100 lg:w-full"
              >
                <Image src={p} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
