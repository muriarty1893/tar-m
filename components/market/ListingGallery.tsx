"use client";

import Image from "next/image";
import { useState } from "react";

/** The listing's photos: the large one, and thumbnails to switch between them. */
export function ListingGallery({ photos, title, stockPhoto }: { photos: string[]; title: string; stockPhoto: boolean }) {
  const [index, setIndex] = useState(0);
  const current = photos[index] ?? photos[0];
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
        <Image
          src={current}
          alt={stockPhoto ? "" : `${title}, fotoğraf ${index + 1} / ${photos.length}`}
          fill
          priority
          sizes="(min-width: 1024px) 640px, 100vw"
          className="object-cover"
        />
        {stockPhoto && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-1 text-sm font-medium text-white">
            Temsilî görsel: satıcı fotoğraf eklemedi
          </span>
        )}
      </div>
      {photos.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Fotoğraflar">
          {photos.map((p, i) => (
            <li key={p} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Fotoğraf ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className="relative block size-20 cursor-pointer overflow-hidden rounded-xl border-2 border-transparent bg-muted aria-[current=true]:border-primary"
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
