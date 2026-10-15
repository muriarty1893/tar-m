"use client";

// Adapted from a 21st.dev "cinematic landing hero". Changes: no scripted intro; instead a short
// video (the phone flying in over a wheat field) plays once on load and rests on its last frame;
// our copy, colours and CTAs; one <h1>; Phosphor icons instead of emoji; everything visible
// without JS or with reduced motion (they get the video's last frame as a still); no pointer effects.

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import { cn } from "cn";
import { CINE_DONE } from "@/lib/cine";

export type CinematicBadge = { icon: ReactNode; title: string; detail: string };

/** If the video hasn't finished by then (slow network, stalled), the last frame is shown instead. */
const GIVE_UP_MS = 10_000;

export interface CinematicHeroProps {
  /** Large wordmark on the card (one word per line). */
  brandName: string;
  brandNote?: string;
  /** The page's <h1>, in two lines. */
  tagline1: string;
  tagline2: string;
  eyebrow?: ReactNode;
  cardHeading: string;
  cardDescription: ReactNode;
  /** CTA buttons and other actions inside the card. */
  actions?: ReactNode;
  footnote?: ReactNode;
  /** The card's background, played once on load (wide; on phones it fills the card's top). `poster` is its
   *  first frame; `end`, its last, stands in for reduced motion and no JS. */
  video: { mp4: string; webm: string; poster: string; end: string; alt: string };
  background: { src: string; alt?: string };
  badges?: [CinematicBadge, CinematicBadge?];
  className?: string;
}

export function CinematicHero({
  brandName,
  brandNote,
  tagline1,
  tagline2,
  eyebrow,
  cardHeading,
  cardDescription,
  actions,
  footnote,
  video,
  background,
  badges,
  className,
}: CinematicHeroProps) {
  const root = useRef<HTMLElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Play the video once. Runs only if the <head> script armed the hero (motion allowed, not timed
  // out); html[data-cine-done] and CINE_DONE mark the end, so the welcome question waits for it.
  useEffect(() => {
    const html = document.documentElement;
    const v = videoRef.current;
    if (!v || !html.classList.contains("cine")) return;
    html.dataset.cineRun = "1";
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(guard);
      html.dataset.cineDone = "1";
      window.dispatchEvent(new Event(CINE_DONE));
    };
    // Autoplay blocked (e.g. iOS Low Power Mode), a load error or a stall: show the last frame.
    const fail = () => {
      v.pause();
      html.classList.remove("cine");
      done();
    };
    const guard = window.setTimeout(fail, GIVE_UP_MS);
    v.addEventListener("ended", done);
    v.addEventListener("error", fail);
    v.play().catch(fail);
    return () => {
      window.clearTimeout(guard);
      v.removeEventListener("ended", done);
      v.removeEventListener("error", fail);
    };
  }, []);

  return (
    <section
      ref={root}
      className={cn("relative isolate flex h-[calc(100svh-4.5rem)] min-h-[40rem] items-center justify-center overflow-hidden", className)}
      style={{ perspective: "1500px" }}
    >
      {/* Backdrop: field running to the horizon, washed to white at the top, and the headline. */}
      <div data-cine-backdrop className="absolute inset-0 -z-10">
        <Image src={background.src} alt={background.alt ?? ""} fill preload sizes="100vw" className="object-cover object-bottom" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,var(--background)_38%,color-mix(in_srgb,var(--background)_55%,transparent)_62%,transparent_100%)]" />
      </div>
      <div aria-hidden="true" className="cine-grain pointer-events-none absolute inset-0 z-50 opacity-[0.05]" />

      <div className="absolute inset-x-0 top-[4%] z-10 flex flex-col items-center px-4 text-center">
        {eyebrow && <div className="hidden sm:block">{eyebrow}</div>}
        <h1 className="mt-4 text-[2.6rem] font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl" style={{ perspective: "800px" }}>
          <span data-cine="line1" className="text-3d-matte block">
            {tagline1}
          </span>{" "}
          <span data-cine="line2" className="text-silver-matte block pb-2">
            {tagline2}
          </span>
        </h1>
      </div>

      {/* Foreground: the card, its background the video of the phone flying in over a wheat field. */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-[3svh]">
        <div
          data-cine="card"
          data-photo=""
          className="cine-card pointer-events-auto relative h-[66%] w-[94vw] max-w-[88rem] overflow-hidden rounded-[var(--hero-radius)] md:w-[90vw] lg:h-[66%]"
        >
          {/* Desktop: the whole card. Phones and tablets: the card's top, fading into the text's dark ground. */}
          <div data-cine="phone" className="hero-media absolute inset-x-0 top-0 h-[60%] lg:inset-0 lg:h-full">
            <Image src={video.poster} alt="" fill preload sizes="(min-width: 768px) 90vw, 94vw" className="object-cover" />
            <video ref={videoRef} aria-label={video.alt} muted playsInline preload="auto" className="absolute inset-0 size-full object-cover">
              <source src={video.webm} type="video/webm" />
              <source src={video.mp4} type="video/mp4" />
            </video>
            {/* The last frame, on top unless the video is going to play (html.cine). */}
            <Image data-hero-endframe src={video.end} alt="" fill sizes="(min-width: 768px) 90vw, 94vw" className="hero-endframe object-cover" />
          </div>
          {/* Scrim: darkest behind the text (the bottom on phones, the left on desktops), clear over the phone. */}
          <div aria-hidden="true" className="cine-card-scrim absolute inset-0" />

          <div className="relative mx-auto flex h-full max-w-7xl flex-col items-center justify-end px-5 pb-6 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-12 lg:py-0">
            {/* Left (desktop) / bottom (mobile): the pitch and actions. */}
            <div data-cine="left" className="w-full text-center lg:text-left">
              <h2 className="hero-fg text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{cardHeading}</h2>
              <p className="mx-auto mt-3 hidden max-w-md text-base leading-relaxed hero-muted md:block lg:mx-0 lg:text-lg">{cardDescription}</p>
              {actions && <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">{actions}</div>}
              {footnote && <div className="hero-muted mt-5 hidden text-sm lg:block">{footnote}</div>}
            </div>

            {/* Centre (desktop): room for the phone in the video, with floating glass badges. */}
            <div aria-hidden="true" className="relative hidden h-full lg:block">
                {badges?.map(
                  (b, i) =>
                    b && (
                      <div
                        key={b.title}
                        data-cine="badge"
                        aria-hidden="true"
                        className={cn(
                          "cine-badge absolute hidden items-center gap-3 rounded-2xl p-3.5 text-left lg:flex",
                          i === 0 ? "left-[calc(100%-2.5rem)] top-[8%]" : "bottom-[16%] left-[calc(100%-2.5rem)]",
                        )}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center hero-chip rounded-full lg:size-10">
                          {b.icon}
                        </span>
                        <span className="whitespace-nowrap">
                          <span className="block text-xs font-bold lg:text-sm">{b.title}</span>
                          <span className="hero-muted block text-[11px] lg:text-xs">{b.detail}</span>
                        </span>
                      </div>
                    ),
                )}
            </div>

            {/* Right (desktop): the wordmark. */}
            <div data-cine="right" aria-hidden="true" className="hidden justify-end lg:flex">
              <div className="text-right">
                <p className="text-card-silver font-heading text-[4.5rem] font-bold uppercase leading-[0.9] tracking-tighter xl:text-[5.75rem]">
                  {brandName.split(" ").map((w) => (
                    <span key={w} className="block">
                      {w}
                    </span>
                  ))}
                </p>
                {brandNote && <p className="mt-4 hero-muted text-sm font-semibold">{brandNote}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
