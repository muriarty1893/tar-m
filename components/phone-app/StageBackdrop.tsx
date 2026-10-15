"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * The scene behind the demo phone, one per app tab: the meadow (home: the stage colour, with the
 * grass drawn in 3D under the phone), and real photographs for the weather (sky), calendar
 * (ploughed field) and history (straw bales after the harvest) tabs. A photo loads the first time
 * its tab opens and then stays mounted, so switching tabs cross-fades instead of popping.
 * Credits: data/photo-credits.ts (shown on /kaynaklar).
 */
export type Backdrop = "meadow" | "sky" | "furrows" | "harvest";

const PHOTOS: Record<Exclude<Backdrop, "meadow">, { src: string; position: string }> = {
  sky: { src: "/demo/sahne-gokyuzu.webp", position: "50% 40%" },
  furrows: { src: "/demo/sahne-surulmus-tarla.webp", position: "50% 70%" },
  harvest: { src: "/demo/sahne-balyalar.webp", position: "50% 60%" },
};

export function StageBackdrop({ backdrop }: { backdrop: Backdrop }) {
  const [opened, setOpened] = useState<Backdrop[]>([backdrop]);
  if (!opened.includes(backdrop)) setOpened([...opened, backdrop]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0" data-active={backdrop}>
      <div data-scene-layer="meadow" className={`absolute inset-0 transition-opacity duration-700 ease-out ${backdrop === "meadow" ? "opacity-100" : "opacity-0"}`} />
      {(Object.keys(PHOTOS) as (keyof typeof PHOTOS)[]).map(
        (key) =>
          opened.includes(key) && (
            <div
              key={key}
              data-scene-layer={key}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${backdrop === key ? "opacity-100" : "opacity-0"}`}
            >
              <Image
                src={PHOTOS[key].src}
                alt=""
                fill
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover"
                style={{ objectPosition: PHOTOS[key].position }}
              />
              {/* A soft vignette keeps the phone the brightest thing on stage. */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgb(0_0_0/0)_40%,rgb(0_0_0/0.28)_100%)]" />
            </div>
          ),
      )}
    </div>
  );
}
