"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { DEFAULT_PROVINCE, findProvinces, nearestProvince, type Province } from "@/data/provinces";
import { describeWeather, farmingHint, fetchForecast, type FarmingHint, type Forecast } from "@/lib/weather";
import { formatTrDate } from "@/lib/format";
import {
  ArrowClockwiseIcon,
  ArrowRightIcon,
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSunIcon,
  DropIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  NavigationArrowIcon,
  PlantIcon,
  SnowflakeIcon,
  SprayBottleIcon,
  SunIcon,
  ThermometerIcon,
  WindIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "loading" | "ok" | "error";

const hintStyle: Record<FarmingHint["kind"], string> = {
  frost: "border-sky-500 bg-sky-500/10",
  rain: "border-blue-600 bg-blue-600/10 dark:border-blue-400",
  spray: "border-primary bg-secondary",
  normal: "border-gold bg-gold-soft",
};

const hintIcon: Record<FarmingHint["kind"], typeof SunIcon> = {
  frost: SnowflakeIcon,
  rain: CloudRainIcon,
  spray: SprayBottleIcon,
  normal: PlantIcon,
};

function ConditionIcon({ code, className }: { code: number; className: string }) {
  const p = { "aria-hidden": true, weight: "duotone" as const, className };
  if (code === 0) return <SunIcon {...p} />;
  if (code <= 2) return <CloudSunIcon {...p} />;
  if (code === 3) return <CloudIcon {...p} />;
  if (code === 45 || code === 48) return <CloudFogIcon {...p} />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return <SnowflakeIcon {...p} />;
  if (code >= 95) return <CloudLightningIcon {...p} />;
  return <CloudRainIcon {...p} />;
}

const round = (n: number) => Math.round(n);
const noopSubscribe = () => () => {};

function HintBox({ hint }: { hint: FarmingHint }) {
  const Icon = hintIcon[hint.kind];
  return (
    <p className={`flex items-start gap-3 rounded-2xl border-l-4 p-4 font-semibold ${hintStyle[hint.kind]}`}>
      <Icon aria-hidden="true" weight="duotone" className="mt-0.5 size-6 shrink-0" />
      {hint.text}
    </p>
  );
}

// Same shape as a real forecast so the loading skeleton occupies the same space (no layout shift).
const SKELETON: Forecast = {
  current: { temp: 0, wind: 0, code: 0 },
  daily: Array.from({ length: 7 }, (_, i) => ({
    date: `2026-01-${String(10 + i).padStart(2, "0")}`,
    min: 0,
    max: 0,
    rainProb: 50,
    rainMm: 0,
    windMax: 20,
  })),
};

function ForecastView({
  forecast,
  compact,
  placeholder = false,
}: {
  forecast: Forecast;
  compact: boolean;
  placeholder?: boolean;
}) {
  const today = forecast.daily[0];
  const n = (v: number) => (placeholder ? "–" : String(round(v)));
  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="blob flex size-16 items-center justify-center bg-gold-soft text-gold">
          <ConditionIcon code={forecast.current.code} className="size-9" />
        </span>
        <p className="font-heading text-5xl font-bold tracking-tight" data-testid={placeholder ? undefined : "sicaklik"}>
          {n(forecast.current.temp)}°C
        </p>
        <p className="text-lg text-muted-foreground">{placeholder ? "…" : describeWeather(forecast.current.code)}</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-base sm:grid-cols-3">
        <div className="rounded-2xl bg-secondary/60 p-3">
          <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <DropIcon aria-hidden="true" weight="duotone" className="size-4" /> Yağış ihtimali
          </dt>
          <dd className="font-heading text-lg font-bold">%{n(today.rainProb)}</dd>
        </div>
        <div className="rounded-2xl bg-secondary/60 p-3">
          <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <WindIcon aria-hidden="true" weight="duotone" className="size-4" /> Rüzgâr
          </dt>
          <dd className="font-heading text-lg font-bold">{n(forecast.current.wind)} km/s</dd>
        </div>
        <div className="col-span-2 rounded-2xl bg-secondary/60 p-3 sm:col-span-1">
          <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ThermometerIcon aria-hidden="true" weight="duotone" className="size-4" /> En düşük / en yüksek
          </dt>
          <dd className="font-heading text-lg font-bold">
            {n(today.min)}° / {n(today.max)}°
          </dd>
        </div>
      </dl>
      <HintBox hint={farmingHint(today)} />

      {compact ? (
        <Link
          href="/hava"
          className="group inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
          tabIndex={placeholder ? -1 : undefined}
        >
          7 günlük tahmin ve il seçimi
          <ArrowRightIcon aria-hidden="true" weight="bold" className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <ol className="divide-y divide-border rounded-2xl border border-border" aria-label="7 günlük tahmin">
          {forecast.daily.map((d) => {
            const hint = farmingHint(d);
            const HintIcon = hintIcon[hint.kind];
            return (
              <li key={d.date} className="grid gap-1 px-4 py-3.5 sm:grid-cols-[10rem_8rem_1fr] sm:items-center">
                <span className="font-semibold">{placeholder ? "–" : formatTrDate(d.date)}</span>
                <span className="tabular-nums">
                  {n(d.min)}° / {n(d.max)}° · %{n(d.rainProb)}
                </span>
                <span className="flex items-start gap-2 text-muted-foreground">
                  <HintIcon aria-hidden="true" weight="duotone" className="mt-1 size-4 shrink-0" />
                  {hint.text}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function ProvinceSearch({ onPick }: { onPick: (p: Province) => void }) {
  const [query, setQuery] = useState("");
  const results = query.trim() ? findProvinces(query).slice(0, 8) : [];
  return (
    <div className="relative">
      <Label htmlFor="il-ara" className="mb-2">
        İl ara
      </Label>
      <div className="relative">
        <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="il-ara"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Örn. Konya, Şanlıurfa…"
          autoComplete="off"
          className="pl-11"
        />
      </div>
      {query.trim() && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Arama sonuçları">
          {results.length === 0 && <li className="text-muted-foreground">Eşleşen il bulunamadı.</li>}
          {results.map((p) => (
            <li key={p.name}>
              <button
                type="button"
                onClick={() => {
                  onPick(p);
                  setQuery("");
                }}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WeatherWidget({ compact = false, headingLevel = 3 }: { compact?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const [province, setProvince] = useState<Province>(DEFAULT_PROVINCE);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; forecast?: Forecast } | null>(null);
  const geoAvailable = useSyncExternalStore(
    noopSubscribe,
    () => "geolocation" in navigator,
    () => false,
  );

  // Status is derived: "loading" whenever the last result belongs to another province/attempt,
  // so re-picking the shown province can never leave the widget stuck.
  const requestKey = `${province.name}#${attempt}`;
  const status: Status = result?.key !== requestKey ? "loading" : result.forecast ? "ok" : "error";
  const forecast = status === "ok" ? result!.forecast! : null;

  const pick = useCallback((p: Province) => setProvince(p), []);
  const retry = () => setAttempt((n) => n + 1);

  const locateMe = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => pick(nearestProvince(pos.coords.latitude, pos.coords.longitude)),
      () => pick(DEFAULT_PROVINCE),
      { timeout: 8000, maximumAge: 30 * 60_000 },
    );
  }, [pick]);

  // Never prompt on page load: use location silently only if already granted.
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((s) => {
        if (s.state === "granted") locateMe();
      })
      .catch(() => {});
  }, [locateMe]);

  // Only the latest province's response may land; older in-flight requests are ignored.
  useEffect(() => {
    let current = true;
    fetchForecast(province.lat, province.lon).then(
      (f) => current && setResult({ key: requestKey, forecast: f }),
      () => current && setResult({ key: requestKey }),
    );
    return () => {
      current = false;
    };
  }, [province, requestKey]);


  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading className="flex items-center gap-2 text-2xl font-bold">
          <MapPinIcon aria-hidden="true" weight="duotone" className="size-6 text-primary" />
          {province.name}
        </Heading>
        {geoAvailable && (
          <Button variant="outline" size="sm" onClick={locateMe}>
            <NavigationArrowIcon aria-hidden="true" weight="duotone" />
            Konumumu kullan
          </Button>
        )}
      </div>

      {!compact && (
        <div className="mt-4">
          <ProvinceSearch onPick={pick} />
        </div>
      )}

      {status === "loading" && (
        <div className="relative">
          {/* Invisible copy of the real layout reserves its space, so the page does not jump when data arrives. */}
          <div aria-hidden="true" className="invisible">
            <ForecastView forecast={SKELETON} compact={compact} placeholder />
          </div>
          <p role="status" className="absolute inset-x-0 top-6 flex items-center gap-2 text-muted-foreground">
            <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent motion-safe:animate-spin" aria-hidden="true" />
            Hava durumu yükleniyor…
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 space-y-3">
          <p className="font-semibold">Hava durumu şu an alınamadı</p>
          <Button onClick={retry}>
            <ArrowClockwiseIcon aria-hidden="true" weight="bold" />
            Tekrar dene
          </Button>
        </div>
      )}

      {status === "ok" && forecast && <ForecastView forecast={forecast} compact={compact} />}
      <p className="mt-5 text-sm text-muted-foreground">
        Veri:{" "}
        <a href="https://open-meteo.com/" className="underline" rel="noopener noreferrer" target="_blank">
          Open-Meteo
        </a>
        . Öneriler genel bilgi amaçlıdır.
      </p>
    </div>
  );
}
