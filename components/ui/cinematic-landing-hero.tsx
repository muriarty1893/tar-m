"use client";

// Adapted from a 21st.dev "cinematic landing hero". Changes: plays once on load
// instead of a 7000px pinned scroll and then rests; uses our real phone render
// instead of a CSS mockup; our copy, colours and CTAs; one <h1>; Phosphor
// icons instead of emoji; content stays visible without JS or with reduced motion; no
// pointer effects (the phone doesn't tilt and no light follows the mouse).

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import type { gsap as Gsap } from "gsap";
import { cn } from "cn";

export type CinematicBadge = { icon: ReactNode; title: string; detail: string };

// GSAP loads after first paint, so it never delays the hero's first frame.
let gsapPromise: Promise<typeof Gsap> | undefined;
const loadGsap = () => (gsapPromise ??= import("gsap").then((m) => m.gsap));

export interface CinematicHeroProps {
  /** Large wordmark on the card (one word per line). */
  brandName: string;
  brandNote?: string;
  /** The page's <h1>, in two lines that reveal one after the other. */
  tagline1: string;
  tagline2: string;
  eyebrow?: ReactNode;
  cardHeading: string;
  cardDescription: ReactNode;
  /** CTA buttons and other actions inside the card. */
  actions?: ReactNode;
  footnote?: ReactNode;
  phone: { src: string; alt: string; width: number; height: number };
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
  phone,
  background,
  badges,
  className,
}: CinematicHeroProps) {
  const root = useRef<HTMLElement>(null);

  // One-time intro, then rest. Runs only if the <head> script armed it (motion allowed, not timed out).
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("cine")) return;
    html.dataset.cineRun = "1";
    const vh = window.innerHeight;
    let ctx: ReturnType<typeof Gsap.context> | undefined;
    let cancelled = false;

    loadGsap().then((gsap) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap
          .timeline({ delay: 0.1 })
          .fromTo(
            "[data-cine='line1']",
            { autoAlpha: 0, y: 60, scale: 0.88, filter: "blur(18px)", rotationX: -20 },
            { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, duration: 1.3, ease: "expo.out" },
          )
          .fromTo(
            "[data-cine='line2']",
            { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" },
            { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "power4.inOut" },
            "-=0.8",
          )
          .addLabel("card", "-=0.2")
          .to("[data-cine-backdrop]", { scale: 1.06, duration: 1.6, ease: "power2.inOut" }, "card")
          .fromTo(
            "[data-cine='card']",
            { autoAlpha: 1, y: vh + 200 },
            { y: 0, duration: 0.95, ease: "power3.out" },
            "card",
          )
          .fromTo(
            "[data-cine='phone']",
            { autoAlpha: 0, y: 260, z: -500, rotationX: 50, rotationY: -30, scale: 0.6 },
            { autoAlpha: 1, y: 0, z: 0, rotationX: 0, rotationY: 0, scale: 1, duration: 1.3, ease: "expo.out" },
            "-=0.45",
          )
          .fromTo(
            "[data-cine='left']",
            { autoAlpha: 0, x: -50 },
            { autoAlpha: 1, x: 0, duration: 0.9, ease: "power4.out" },
            "-=1.1",
          )
          .fromTo(
            "[data-cine='right']",
            { autoAlpha: 0, x: 50, scale: 0.85 },
            { autoAlpha: 1, x: 0, scale: 1, duration: 0.9, ease: "expo.out" },
            "<",
          )
          .fromTo(
            "[data-cine='badge']",
            { autoAlpha: 0, y: 80, scale: 0.7, rotationZ: -10 },
            { autoAlpha: 1, y: 0, scale: 1, rotationZ: 0, duration: 0.8, ease: "back.out(1.5)", stagger: 0.12 },
            "-=0.8",
          );
      }, root);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
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
        <h1 className="mt-4 text-[1.9rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl" style={{ perspective: "800px" }}>
          <span data-cine="line1" className="text-3d-matte block">
            {tagline1}
          </span>{" "}
          <span data-cine="line2" className="text-silver-matte block pb-2">
            {tagline2}
          </span>
        </h1>
      </div>

      {/* Foreground: the card with the phone (its look comes from the design's --hero-* tokens). */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-[3svh]" style={{ perspective: "1500px" }}>
        <div
          data-cine="card"
          className="cine-card pointer-events-auto relative h-[66%] w-[94vw] max-w-[88rem] overflow-hidden rounded-[var(--hero-radius)] md:w-[90vw] lg:h-[66%]"
        >
          <div className="relative mx-auto flex h-full max-w-7xl flex-col items-center justify-evenly gap-4 px-5 py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,0.8fr)] lg:gap-10 lg:px-12 lg:py-0">
            {/* Left (desktop) / bottom (mobile): the pitch and actions. */}
            <div data-cine="left" className="order-3 w-full text-center lg:order-1 lg:text-left">
              <h2 className="hero-fg text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{cardHeading}</h2>
              <p className="mx-auto mt-3 hidden max-w-md text-base leading-relaxed hero-muted md:block lg:mx-0 lg:text-lg">{cardDescription}</p>
              {actions && <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">{actions}</div>}
              {footnote && <div className="hero-muted mt-5 hidden text-sm lg:block">{footnote}</div>}
            </div>

            {/* Centre: the phone render with floating glass badges. */}
            <div data-cine="phone" className="relative order-2 flex min-h-0 w-full flex-1 items-center justify-center lg:h-full lg:w-auto lg:flex-none" style={{ perspective: "1000px" }}>
              <div className="relative h-full max-h-[34rem] py-1 [transform-style:preserve-3d] lg:h-[88%]">
                <Image
                  src={phone.src}
                  alt={phone.alt}
                  width={phone.width}
                  height={phone.height}
                  sizes="(min-width: 1024px) 280px, 180px"
                  className="h-full w-auto object-contain drop-shadow-[var(--hero-phone-shadow)]"
                />
                {badges?.map(
                  (b, i) =>
                    b && (
                      <div
                        key={b.title}
                        data-cine="badge"
                        aria-hidden="true"
                        className={cn(
                          "cine-badge absolute hidden items-center gap-3 rounded-2xl p-3.5 text-left [transform:translateZ(60px)] lg:flex",
                          i === 0 ? "right-[calc(100%-1.75rem)] top-0" : "bottom-[10%] left-[calc(100%-1.75rem)]",
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
            </div>

            {/* Right (desktop): the wordmark. */}
            <div data-cine="right" aria-hidden="true" className="order-1 hidden justify-end lg:order-3 lg:flex">
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
