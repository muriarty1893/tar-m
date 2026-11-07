"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * A post's photos as on X: one wide, two side by side, three (one tall and two), four in a square.
 * A tap opens it large, with the others a swipe (or an arrow key) away.
 */
export function PhotoGrid({ photos, label }: { photos: string[]; label: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(0);
  if (!photos.length) return null;
  const n = Math.min(photos.length, 4);
  const show = (i: number) => {
    setOpen(i);
    dialog.current?.showModal();
  };
  const step = (by: number) => setOpen((i) => (i + by + n) % n);
  const layout = n === 1 ? "grid-cols-1" : n === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2";

  return (
    <>
      <div className={`grid aspect-[16/10] max-h-[28rem] w-full gap-1 overflow-hidden rounded-lg border border-border ${layout}`}>
        {photos.slice(0, 4).map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => show(i)}
            aria-label={`${label}: ${n} fotoğraftan ${i + 1}. Büyüt`}
            className={`relative cursor-zoom-in overflow-hidden bg-muted focus-visible:outline-offset-[-3px] ${n === 3 && i === 0 ? "row-span-2" : ""}`}
          >
            <Image src={src} alt="" fill sizes="(min-width: 768px) 360px, 50vw" className="object-cover transition-transform duration-200 hover:scale-[1.02]" />
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        aria-label={`${label}: fotoğraf ${open + 1} / ${n}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-h-[92vh] w-[min(64rem,94vw)] rounded-lg bg-black p-0 text-white backdrop:bg-black/80"
      >
        <div className="relative flex h-[85vh] items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- full size, any shape: next/image needs a box */}
          <img src={photos[open]} alt="" className="max-h-full max-w-full object-contain" />
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Kapat" className="absolute right-3 top-3 flex size-12 cursor-pointer items-center justify-center rounded-full bg-black/60 hover:bg-black/80">
            <XIcon aria-hidden="true" weight="bold" className="size-6" />
          </button>
          {n > 1 && (
            <>
              <button type="button" onClick={() => step(-1)} aria-label="Önceki fotoğraf" className="absolute left-3 flex size-12 cursor-pointer items-center justify-center rounded-full bg-black/60 hover:bg-black/80">
                <CaretLeftIcon aria-hidden="true" weight="bold" className="size-6" />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Sonraki fotoğraf" className="absolute right-3 flex size-12 cursor-pointer items-center justify-center rounded-full bg-black/60 hover:bg-black/80">
                <CaretRightIcon aria-hidden="true" weight="bold" className="size-6" />
              </button>
              <p className="absolute bottom-3 rounded-full bg-black/60 px-3 py-1 text-sm">
                {open + 1} / {n}
              </p>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
