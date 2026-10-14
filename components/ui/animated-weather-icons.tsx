// Adapted from a 21st.dev "Animated Weather Icons" set. Same artwork and timing,
// but the motion is CSS keyframes (app/globals.css, "wx-") instead of
// framer-motion, so the weather section adds no animation library to the page.
// Changes: icons are decorative (aria-hidden; the condition is always written
// next to them); `animate={false}` rests them on their static drawing; reduced
// motion keeps them still.

import type { CSSProperties, ReactNode } from "react";
import { cn } from "cn";

export interface WeatherIconProps {
  /** Pixel size, or "auto" to size it with className (e.g. responsive `size-*` utilities). */
  size?: number | "auto";
  className?: string;
  /** Loop the micro-animation; off, the icon rests on its static drawing. */
  animate?: boolean;
}

type Vars = CSSProperties & Record<`--wx-${string}`, string>;

function Svg({ size = 48, className, animate = true, style, children }: WeatherIconProps & { style?: Vars; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("wx-icon shrink-0", animate && "wx-live", className)}
      style={size === "auto" ? style : { width: size, height: size, ...style }}
    >
      {children}
    </svg>
  );
}

const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

/* ─── SUN ─── */
export function SunIcon(props: WeatherIconProps) {
  return (
    <Svg {...props}>
      <g className="wx-spin" style={{ "--wx-t": "12s" } as Vars}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line key={deg} className="wx-twinkle" style={delay(deg / 360)} x1="24" y1="6" x2="24" y2="10" stroke="#FBBF24" strokeWidth={2} strokeLinecap="round" transform={`rotate(${deg} 24 24)`} />
        ))}
      </g>
      <circle className="wx-pulse" cx="24" cy="24" r="8" fill="#FBBF24" opacity={0.2} style={{ transformOrigin: "24px 24px" }} />
      <circle cx="24" cy="24" r="8" stroke="#FBBF24" strokeWidth={2} />
    </Svg>
  );
}

/* ─── MOON ─── */
export function MoonIcon(props: WeatherIconProps) {
  const stars = [
    { cx: 34, cy: 10, d: 0 },
    { cx: 38, cy: 18, d: 0.5 },
    { cx: 30, cy: 6, d: 1 },
    { cx: 40, cy: 12, d: 1.5 },
  ];
  return (
    <Svg {...props}>
      <path d="M28 8a14 14 0 100 28 10 10 0 01 0-28z" fill="#A78BFA" opacity={0.15} />
      <path d="M28 8a14 14 0 100 28 10 10 0 01 0-28z" stroke="#A78BFA" strokeWidth={2} strokeLinecap="round" />
      {stars.map((s) => (
        <circle key={s.cx + s.cy} className="wx-star" cx={s.cx} cy={s.cy} r="1" fill="#A78BFA" opacity={0.7} style={{ ...delay(s.d), transformOrigin: `${s.cx}px ${s.cy}px` }} />
      ))}
    </Svg>
  );
}

const CLOUD = "M36 30H14a8 8 0 01-.5-16A10 10 0 0134 16a7 7 0 012 14z";
// The original rain/storm clouds had a top arc too tight for its radius, so browsers enlarged it
// and it poked above the 48×48 box (cut off). Redrawn with arcs that fit, same footprint below.
const RAIN_CLOUD = "M35 22H15a6 6 0 010-12A7 7 0 0129 11.5a6 6 0 016 10.5z";
const STORM_CLOUD = "M35 20H15a6 6 0 010-12A7 7 0 0129 9.5a6 6 0 016 10.5z";

/* ─── CLOUD ─── */
export function CloudIcon(props: WeatherIconProps) {
  return (
    <Svg {...props}>
      <g className="wx-drift" style={{ "--wx-t": "6s", "--wx-x": "2px" } as Vars}>
        <path d={CLOUD} fill="#94A3B8" opacity={0.12} />
        <path d={CLOUD} stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </Svg>
  );
}

/* ─── RAIN ─── */
export function RainIcon(props: WeatherIconProps) {
  const drops = [
    { x: 16, d: 0 },
    { x: 22, d: 0.3 },
    { x: 28, d: 0.6 },
    { x: 34, d: 0.15 },
  ];
  return (
    <Svg {...props} style={{ "--wx-t": "0.8s", "--wx-y": "12px", "--wx-o": "0.8" }}>
      <path d={RAIN_CLOUD} fill="#60A5FA" opacity={0.1} />
      <path d={RAIN_CLOUD} stroke="#60A5FA" strokeWidth={2} strokeLinecap="round" />
      {drops.map((drop) => (
        <line key={drop.x} className="wx-fall" style={delay(drop.d)} x1={drop.x} y1={26} x2={drop.x} y2={30} stroke="#60A5FA" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
      ))}
    </Svg>
  );
}

/* ─── HEAVY RAIN ─── */
export function HeavyRainIcon(props: WeatherIconProps) {
  const drops = [
    { x: 14, d: 0 },
    { x: 19, d: 0.15 },
    { x: 24, d: 0.3 },
    { x: 29, d: 0.1 },
    { x: 34, d: 0.4 },
    { x: 37, d: 0.25 },
  ];
  return (
    <Svg {...props} style={{ "--wx-t": "0.6s", "--wx-y": "16px", "--wx-o": "1" }}>
      <path d={STORM_CLOUD} fill="#3B82F6" opacity={0.1} />
      <path d={STORM_CLOUD} stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" />
      {drops.map((drop) => (
        <line key={drop.x} className="wx-fall" style={delay(drop.d)} x1={drop.x} y1={24} x2={drop.x - 2} y2={30} stroke="#3B82F6" strokeWidth={1.5} strokeLinecap="round" />
      ))}
    </Svg>
  );
}

/* ─── SNOW ─── */
export function SnowIcon(props: WeatherIconProps) {
  const flakes = [
    { x: 16, d: 0 },
    { x: 22, d: 0.5 },
    { x: 28, d: 0.2 },
    { x: 34, d: 0.7 },
    { x: 19, d: 1.0 },
    { x: 31, d: 0.4 },
  ];
  return (
    <Svg {...props}>
      <path d={RAIN_CLOUD} fill="#7DD3FC" opacity={0.18} />
      <path d={RAIN_CLOUD} stroke="#7DD3FC" strokeWidth={2} strokeLinecap="round" />
      {flakes.map((f, i) => (
        <circle
          key={i}
          className={i % 2 === 0 ? "wx-flake-r" : "wx-flake-l"}
          style={delay(f.d)}
          cx={f.x}
          cy={i < 4 ? 28 : 34}
          r={1.5}
          fill="#7DD3FC"
          opacity={0.8}
        />
      ))}
    </Svg>
  );
}

/* ─── THUNDER ─── */
export function ThunderIcon(props: WeatherIconProps) {
  const bolt = "M26 20l-3 8h6l-3 10";
  return (
    <Svg {...props}>
      <path d={STORM_CLOUD} fill="#F59E0B" opacity={0.08} />
      <path d={STORM_CLOUD} stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
      <path className="wx-flash" d={bolt} stroke="#F59E0B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path className="wx-flash-glow" d={bolt} fill="#F59E0B" opacity={0} />
    </Svg>
  );
}

/* ─── WIND ─── */
export function WindIcon(props: WeatherIconProps) {
  return (
    <Svg {...props}>
      <path className="wx-draw" pathLength={1} style={{ animationDuration: "1.5s" }} d="M6 18h26a4 4 0 000-8" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
      <path className="wx-draw" pathLength={1} style={{ animationDuration: "2s", ...delay(0.3) }} d="M6 24h32a3 3 0 010 6" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
      <path className="wx-draw" pathLength={1} style={{ animationDuration: "1.8s", ...delay(0.6) }} d="M10 30h18" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

/* ─── FOG ─── */
export function FogIcon(props: WeatherIconProps) {
  const lines = [
    { y: 16, w: 28, d: 0 },
    { y: 22, w: 32, d: 0.5 },
    { y: 28, w: 24, d: 1.0 },
    { y: 34, w: 30, d: 1.5 },
  ];
  return (
    <Svg {...props}>
      {lines.map((l) => (
        <line key={l.y} className="wx-haze" style={delay(l.d)} x1={24 - l.w / 2} y1={l.y} x2={24 + l.w / 2} y2={l.y} stroke="#94A3B8" strokeWidth={2.5} strokeLinecap="round" opacity={0.45} />
      ))}
    </Svg>
  );
}

/* ─── PARTLY CLOUDY ─── */
export function PartlyCloudyIcon(props: WeatherIconProps) {
  const cloud = "M38 34H18a7 7 0 01-.5-14A9 9 0 0136 22a6 6 0 012 12z";
  return (
    <Svg {...props}>
      <g className="wx-spin" style={{ "--wx-t": "20s", transformOrigin: "16px 16px" } as Vars}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <line key={deg} x1="16" y1="6" x2="16" y2="9" stroke="#FBBF24" strokeWidth={1.5} strokeLinecap="round" transform={`rotate(${deg} 16 16)`} />
        ))}
      </g>
      <circle cx="16" cy="16" r="6" stroke="#FBBF24" strokeWidth={1.5} fill="#FBBF24" fillOpacity={0.15} />
      <g className="wx-drift" style={{ "--wx-t": "5s", "--wx-x": "1.5px" } as Vars}>
        <path d={cloud} fill="#94A3B8" opacity={0.12} />
        <path d={cloud} stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
      </g>
    </Svg>
  );
}

/* ─── SUNRISE ─── */
export function SunriseIcon(props: WeatherIconProps) {
  return (
    <Svg {...props}>
      <line x1="6" y1="34" x2="42" y2="34" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
      <g className="wx-rise">
        <path d="M12 34a12 12 0 0124 0" fill="#FBBF24" opacity={0.15} />
        <path d="M12 34a12 12 0 0124 0" stroke="#FBBF24" strokeWidth={2} strokeLinecap="round" />
        {[0, 30, 60, 90, 120, 150, 180].map((deg) => (
          <line key={deg} x1="24" y1="14" x2="24" y2="17" stroke="#FBBF24" strokeWidth={1.5} strokeLinecap="round" transform={`rotate(${deg - 90} 24 34)`} />
        ))}
      </g>
      <g className="wx-bob">
        <path d="M24 42V36" stroke="#FBBF24" strokeWidth={2} strokeLinecap="round" />
        <path d="M20 38l4-4 4 4" stroke="#FBBF24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </Svg>
  );
}

/* ─── RAINBOW ─── */
export function RainbowIcon(props: WeatherIconProps) {
  const arcs = [
    { r: 16, color: "#EF4444", d: 0 },
    { r: 13, color: "#F59E0B", d: 0.1 },
    { r: 10, color: "#22C55E", d: 0.2 },
    { r: 7, color: "#3B82F6", d: 0.3 },
  ];
  return (
    <Svg {...props}>
      {arcs.map((arc) => (
        <path
          key={arc.r}
          className="wx-arc"
          pathLength={1}
          style={delay(arc.d)}
          d={`M${24 - arc.r} 34a${arc.r} ${arc.r} 0 01${arc.r * 2} 0`}
          stroke={arc.color}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.7}
        />
      ))}
    </Svg>
  );
}
