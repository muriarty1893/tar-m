"use client";

import Image from "next/image";
import { useState } from "react";

/** The listing's photos: the large one, and thumbnails to switch between them. */
export function ListingGallery({ photos, title, stockPhoto }: { photos: string[]; title: string; stockPhoto: boolean }) {
  const [index, setIndex] = useState(0);
  const current = photos[index] ?? photos[0];
  return (
    <div>
      {/* Edge to edge on phones, as on sahibinden; a rounded card from 1024 px. */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted lg:rounded-lg lg:border lg:border-border">
        <Image
          src={current}
          alt={stockPhoto ? "" : `${title}, fotoğraf ${index + 1} / ${photos.length}`}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 640px, 100vw"
          className="object-cover"
        />
        {photos.length > 1 && (
          <span className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-0.5 text-sm font-semibold text-white tabular-nums">
            {index + 1} / {photos.length}
          </span>
        )}
        {stockPhoto && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-1 text-sm font-medium text-white">
            Temsilî görsel: satıcı fotoğraf eklemedi
          </span>
        )}
      </div>
      {photos.length > 1 && (
        <ul className="mt-2 flex gap-2 overflow-x-auto px-3 pb-1 lg:mt-3 lg:px-0" aria-label="Fotoğraflar">
          {photos.map((p, i) => (
            <li key={p} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Fotoğraf ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className="relative block size-16 cursor-pointer overflow-hidden rounded-lg border border-transparent bg-muted aria-[current=true]:border-primary lg:size-20 lg:rounded-xl"
              >
                <Image src={p} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
