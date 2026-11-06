"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudSunIcon,
  MoonIcon,
  SunIcon,
  WindIcon,
} from "@phosphor-icons/react/dist/ssr";
import { DEFAULT_PROVINCE, type Province } from "@/data/provinces";
import { readSavedProvince } from "@/lib/saved-province";
import { describeWeather, farmingHint, fetchForecast, weatherKind, type FarmingHint, type Forecast, type WeatherKind } from "@/lib/weather";

const SKY: Record<WeatherKind, { Icon: typeof SunIcon; color: string }> = {
  sun: { Icon: SunIcon, color: "#b45309" },
  moon: { Icon: MoonIcon, color: "#4b5563" },
  partly: { Icon: CloudSunIcon, color: "#4b5563" },
  cloud: { Icon: CloudIcon, color: "#4b5563" },
  fog: { Icon: CloudFogIcon, color: "#4b5563" },
  rain: { Icon: CloudRainIcon, color: "#1d4ed8" },
  "heavy-rain": { Icon: CloudRainIcon, color: "#1d4ed8" },
  snow: { Icon: CloudSnowIcon, color: "#0369a1" },
  thunder: { Icon: CloudLightningIcon, color: "#6d28d9" },
  wind: { Icon: WindIcon, color: "#4b5563" },
};

/** The day's advice as a small chip. */
const HINT: Record<FarmingHint["kind"], { label: string; bg: string; fg: string }> = {
  frost: { label: "Don riski", bg: "#e0f2fe", fg: "#075985" },
  rain: { label: "Yoğun yağış", bg: "#dbeafe", fg: "#1e40af" },
  spray: { label: "İlaçlamaya uygun", bg: "#dcfce7", fg: "#15803d" },
  normal: { label: "Koşullar normal", bg: "#fef3c7", fg: "#92400e" },
};

/** "2026-11-07" → "Cmt". */
const weekday = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("tr-TR", { weekday: "short", timeZone: "UTC" });

const noop = () => () => {};

/**
 * The home page's weather box (Borsa): a cloud logo, the place, today's temperature, sky, chance of
 * rain and farming advice, then the next three days. The place is the one last picked on /hava (else
 * Ankara). The whole box opens the 7-day forecast.
 */
export function BorsaWeather() {
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
  const today = f?.daily[0];
  const hint = today ? HINT[farmingHint(today).kind] : null;
  const label = f
    ? `Hava durumu, ${province.name}: ${Math.round(f.current.temp)} derece, ${describeWeather(f.current.code)}, yüzde ${today?.rainProb ?? 0} yağış. ${hint?.label}. 7 günlük tahmini aç`
    : `Hava durumu, ${province.name}. 7 günlük tahmini aç`;

  return (
    <Link href="/hava" aria-label={label} className="flex h-full flex-col rounded-md border border-[#dfe3e8] bg-white transition-colors hover:border-[#c4cad3] hover:bg-[#fafbfc]">
      <span aria-hidden="true" className="flex items-center gap-1.5 border-b border-[#dfe3e8] px-2.5 py-1.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#dbeafe]">
          <CloudSunIcon weight="fill" className="size-4 text-[#1d4ed8]" />
        </span>
        <span className="min-w-0 truncate text-[12.5px] font-bold">Hava · {province.name}</span>
      </span>
      <span aria-hidden="true" className="block px-2.5 pt-1.5">
        <span className="block font-borsa-mono text-[26px] font-semibold leading-tight">{f ? `${Math.round(f.current.temp)}°` : failed ? "–" : "…"}</span>
        <span className="block truncate text-[11.5px] text-[#4b5563]">
          {f ? `${describeWeather(f.current.code)} · %${today?.rainProb ?? 0} yağış` : failed ? "Hava alınamadı" : "Yükleniyor"}
        </span>
        {hint && (
          <span className="mt-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: hint.bg, color: hint.fg }}>
            {hint.label}
          </span>
        )}
      </span>
      <span aria-hidden="true" className="mt-auto block border-t border-[#dfe3e8] px-2.5 py-1">
        {f
          ? f.daily.slice(1, 4).map((d) => {
              const { Icon, color } = SKY[weatherKind(d.code ?? 2)];
              return (
                <span key={d.date} className="flex h-6 items-center gap-1.5 text-[11.5px]">
                  <span className="w-8 font-semibold capitalize text-[#4b5563]">{weekday(d.date)}</span>
                  <Icon weight="duotone" className="size-4" style={{ color }} />
                  <span className="ml-auto font-borsa-mono font-semibold">
                    {Math.round(d.max)}°<span className="font-normal text-[#4b5563]">/{Math.round(d.min)}°</span>
                  </span>
                </span>
              );
            })
          : [0, 1, 2].map((i) => <span key={i} className="my-1.5 block h-3 rounded bg-[#eef0f3]" />)}
      </span>
    </Link>
  );
}
