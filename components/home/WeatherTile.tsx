"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { DEFAULT_PROVINCE, type Province } from "@/data/provinces";
import { describeWeather, farmingHint, fetchForecast, weatherKind, type FarmingHint, type Forecast, type WeatherKind } from "@/lib/weather";
import { readSavedProvince } from "@/lib/saved-province";
import {
  CloudIcon,
  FogIcon,
  HeavyRainIcon,
  MoonIcon,
  PartlyCloudyIcon,
  RainIcon,
  SnowIcon,
  SunIcon,
  ThunderIcon,
  WindIcon,
  type WeatherIconProps,
} from "@/components/ui/animated-weather-icons";

const KIND_ICON: Record<WeatherKind, (p: WeatherIconProps) => React.ReactNode> = {
  sun: SunIcon,
  moon: MoonIcon,
  partly: PartlyCloudyIcon,
  cloud: CloudIcon,
  fog: FogIcon,
  rain: RainIcon,
  "heavy-rain": HeavyRainIcon,
  snow: SnowIcon,
  thunder: ThunderIcon,
  wind: WindIcon,
};

/** The day's advice in two words, for a one-line tile. */
const SHORT: Record<FarmingHint["kind"], { label: string; tone: string }> = {
  frost: { label: "Don riski", tone: "text-sky-800" },
  rain: { label: "Yoğun yağış", tone: "text-blue-800" },
  spray: { label: "İlaçlamaya uygun", tone: "text-primary" },
  normal: { label: "Koşullar normal", tone: "text-amber-800" },
};

const noop = () => () => {};

/**
 * Today's weather in one compact tile: place, temperature, sky and the day's farming advice, opening
 * the 7-day forecast. The place is the one last picked on /hava (else Ankara). `wide` lays it out in
 * one row for the calendar page.
 */
export function WeatherTile({ wide = false }: { wide?: boolean }) {
  const saved = useSyncExternalStore(noop, readSavedProvince, () => null);
  const province: Province = saved ?? DEFAULT_PROVINCE;
  const [result, setResult] = useState<{ place: string; forecast?: Forecast } | null>(null);

  useEffect(() => {
    let live = true;
    fetchForecast(province.lat, province.lon).then(
      (f) => live && setResult({ place: province.name, forecast: f }),
      () => live && setResult({ place: province.name }),
    );
    return () => {
      live = false;
    };
  }, [province]);

  const ready = result?.place === province.name;
  const f = ready ? result?.forecast : undefined;
  const failed = ready && !f;
  const kind = f ? weatherKind(f.current.code, { isDay: f.current.isDay, wind: f.current.wind }) : "partly";
  const Icon = KIND_ICON[kind];
  const hint = f ? SHORT[farmingHint(f.daily[0]).kind] : null;

  return (
    <Link
      href="/hava"
      aria-label={f ? `Hava durumu, ${province.name}: ${Math.round(f.current.temp)} derece, ${describeWeather(f.current.code)}. ${hint?.label}. 7 günlük tahmini aç` : `Hava durumu, ${province.name}`}
      className="group flex h-full min-w-0 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-secondary"
    >
      <span aria-hidden="true" className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <Icon size="auto" animate={false} className="size-6 shrink-0" />
          <span className="min-w-0 truncate text-sm font-semibold text-muted-foreground">{province.name}</span>
          <span className="ml-auto shrink-0 font-heading text-lg font-bold tabular-nums leading-none">{f ? `${Math.round(f.current.temp)}°` : failed ? "–" : "…"}</span>
        </span>
        <span className={`mt-0.5 block truncate text-sm font-semibold leading-snug ${hint ? hint.tone : "text-muted-foreground"}`}>
          {f ? (wide ? `${describeWeather(f.current.code)} · ${hint?.label}` : hint?.label) : failed ? "Alınamadı" : "Yükleniyor"}
        </span>
      </span>
      {wide && <CaretRightIcon aria-hidden="true" weight="bold" className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />}
    </Link>
  );
}
