/**
 * The scene behind the demo phone, one per app tab: the meadow (home, with the 3D grass), the sky
 * (weather), ploughed rows with sprouts (calendar) and a golden harvest at dusk (history). All four
 * stay mounted and cross-fade, so switching tabs never pops. CSS and inline SVG only.
 */
export type Backdrop = "meadow" | "sky" | "furrows" | "harvest";

const layer = "absolute inset-0 transition-opacity duration-700 ease-out";

export function StageBackdrop({ backdrop }: { backdrop: Backdrop }) {
  const on = (b: Backdrop) => (backdrop === b ? "opacity-100" : "opacity-0");
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0" data-active={backdrop}>
      {/* Meadow: the light stage colour; the grass itself is drawn in 3D under the phone. */}
      <div data-scene-layer="meadow" className={`${layer} ${on("meadow")}`} />

      {/* Sky: blue overhead, sun up right, clouds drifting past and a bank of cloud below the phone. */}
      <div data-scene-layer="sky" className={`scene-sky ${layer} ${on("sky")}`}>
        <span className="scene-cloud left-[6%] top-[12%] scale-110 [--drift:70s]" />
        <span className="scene-cloud left-[62%] top-[26%] scale-75 [--drift:95s] [animation-delay:-30s]" />
        <span className="scene-cloud left-[18%] top-[48%] scale-90 opacity-90 [--drift:80s] [animation-delay:-55s]" />
        <span className="scene-cloud left-[70%] top-[58%] scale-125 [--drift:110s] [animation-delay:-12s]" />
        <span className="scene-cloud-bank" />
      </div>

      {/* Calendar: a field ploughed for the season, rows of sprouts running to the horizon. */}
      <div data-scene-layer="furrows" className={`scene-furrows ${layer} ${on("furrows")}`}>
        <div className="scene-furrows__ground">
          <div className="scene-furrows__rows" />
        </div>
      </div>

      {/* History: the harvest at dusk, low sun, wheat to the hills and a few round bales. */}
      <div data-scene-layer="harvest" className={`scene-harvest ${layer} ${on("harvest")}`}>
        <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="absolute inset-x-0 top-[44%] h-[22%] w-full">
          <path d="M0 260 C160 170 300 210 430 180 S700 120 860 170 S1100 150 1200 190 V400 H0Z" fill="#c99a62" opacity="0.55" />
          <path d="M0 300 C200 240 360 270 520 245 S820 220 980 250 S1150 240 1200 255 V400 H0Z" fill="#b9853f" opacity="0.7" />
        </svg>
        <div className="scene-harvest__field" />
        <span className="scene-bale left-[9%] top-[70%] size-14" />
        <span className="scene-bale left-[20%] top-[66%] size-9" />
        <span className="scene-bale right-[11%] top-[74%] size-16" />
        <span className="scene-bale right-[24%] top-[67%] size-8" />
      </div>
    </div>
  );
}
