import type { ReactNode } from "react";
import Image from "next/image";
import { pageHeroPhoto, type PhotoCredit } from "@/data/photo-credits";

/**
 * Header band for subpages: the title and intro set large over a real photograph of an Anatolian
 * wheat field (Suşehri, Sivas), with a neutral scrim for legibility and the photo's credit in the
 * band. Pages whose title is itself a picture (the about page's masked heading) pass `photo={null}`
 * and get a plain band. No decorative shapes.
 */
export function PageHero({
  title,
  heading,
  intro,
  photo = pageHeroPhoto,
  children,
}: {
  title: string;
  /** Replaces the default <h1> (it must still render an h1 with `title`). */
  heading?: ReactNode;
  intro?: ReactNode;
  photo?: PhotoCredit | null;
  children?: ReactNode;
}) {
  const onPhoto = !!photo;
  return (
    <section
      data-testid="page-hero"
      className={onPhoto ? "relative isolate overflow-hidden bg-[#1c2a17] text-white" : "relative bg-surface"}
    >
      {photo && (
        <>
          <Image data-hero-photo src={photo.src} alt="" fill preload sizes="100vw" className="-z-10 object-cover object-[50%_62%]" />
          {/* Neutral scrim, strongest behind the text (bottom left). */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(8_16_10/0.82)_0%,rgb(8_16_10/0.6)_42%,rgb(8_16_10/0.18)_100%),linear-gradient(0deg,rgb(8_16_10/0.55)_0%,transparent_55%)]"
          />
        </>
      )}
      <div className={`relative mx-auto flex max-w-4xl flex-col justify-end px-4 ${onPhoto ? "min-h-[12rem] pb-8 pt-12 sm:min-h-[28rem] sm:pb-14 sm:pt-24" : "pb-8 pt-8 sm:pb-14 sm:pt-20"}`}>
        {heading ?? <h1 className="text-3xl font-bold leading-[0.98] tracking-tight sm:text-7xl">{title}</h1>}
        {intro && <p className={`mt-2 max-w-2xl text-base sm:mt-5 sm:text-xl ${onPhoto ? "text-white/90 [&_a]:text-white" : "text-muted-foreground"}`}>{intro}</p>}
        {children}
      </div>
      {photo && (
        <p className="absolute bottom-2 right-4 text-xs text-white/80 sm:bottom-3">
          Fotoğraf:{" "}
          <a href={photo.sourceUrl} rel="noopener" className="underline underline-offset-2 hover:text-white">
            {photo.author}
          </a>
          ,{" "}
          <a href={photo.licenseUrl} rel="noopener license" className="underline underline-offset-2 hover:text-white">
            {photo.license}
          </a>
        </p>
      )}
    </section>
  );
}
