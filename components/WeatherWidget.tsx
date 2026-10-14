"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { DEFAULT_PROVINCE, findProvinces, nearestProvince, type Province } from "@/data/provinces";
import {
  describeWeather,
  farmingHint,
  fetchForecast,
  rangeBar,
  weatherKind,
  type DailyForecast,
  type FarmingHint,
  type Forecast,
  type WeatherKind,
} from "@/lib/weather";
import { formatTrDay, formatTrShortDate } from "@/lib/format";
import {
  ArrowClockwiseIcon,
  ArrowRightIcon,
  CloudRainIcon,
  DropIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  NavigationArrowIcon,
  PlantIcon,
  SnowflakeIcon,
  SprayBottleIcon,
  SunHorizonIcon,
  WindIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  WindIcon as WindyIcon,
  type WeatherIconProps,
} from "@/components/ui/animated-weather-icons";

type Status = "loading" | "ok" | "error";

const KIND_ICON: Record<WeatherKind, (p: WeatherIconProps) => ReactNode> = {
  sun: SunIcon,
  moon: MoonIcon,
  partly: PartlyCloudyIcon,
  cloud: CloudIcon,
  fog: FogIcon,
  rain: RainIcon,
  "heavy-rain": HeavyRainIcon,
  snow: SnowIcon,
  thunder: ThunderIcon,
  wind: WindyIcon,
};

function ConditionIcon({ kind, ...props }: WeatherIconProps & { kind: WeatherKind }) {
  const Icon = KIND_ICON[kind];
  return <Icon {...props} />;
}

/** Without a daily code (older cached responses), guess from the rain chance. */
const dayKind = (d: DailyForecast): WeatherKind => (d.code !== undefined ? weatherKind(d.code) : d.rainProb >= 60 ? "rain" : "partly");

// Text tones are ≥ 4.5:1 on their own tinted backgrounds, light and dark.
const HINT: Record<FarmingHint["kind"], { Icon: typeof PlantIcon; tone: string; tint: string; plan: string }> = {
  frost: { Icon: SnowflakeIcon, tone: "text-sky-800 dark:text-sky-300", tint: "bg-sky-500/10 ring-sky-500/30", plan: "Don riski" },
  rain: { Icon: CloudRainIcon, tone: "text-blue-800 dark:text-blue-300", tint: "bg-blue-500/10 ring-blue-500/30", plan: "Yoğun yağış" },
  spray: { Icon: SprayBottleIcon, tone: "text-primary", tint: "bg-secondary/70 ring-primary/25", plan: "İlaçlamaya uygun" },
  normal: { Icon: PlantIcon, tone: "text-amber-800 dark:text-gold", tint: "bg-gold-soft ring-gold/25", plan: "Normal koşullar" },
};

const round = (n: number) => Math.round(n);
const noopSubscribe = () => () => {};

// Same shape as a real forecast so the loading skeleton occupies the same space (no layout shift).
const SKELETON: Forecast = {
  current: { temp: 0, wind: 0, code: 3, isDay: true },
  daily: Array.from({ length: 7 }, (_, i) => ({
    date: `2026-01-${String(10 + i).padStart(2, "0")}`,
    min: 0,
    max: 0,
    rainProb: 50,
    rainMm: 0,
    windMax: 20,
    code: 3,
  })),
};

// The bar colour follows the absolute temperature (blue when cold, orange when hot), from -10 to 40 °C.
const SCALE = { lo: -10, span: 50 };
const TEMP_GRADIENT = "linear-gradient(90deg,#60a5fa 0%,#38bdf8 20%,#4ade80 45%,#facc15 65%,#fb923c 82%,#ef4444 100%)";

function paint(min: number, max: number) {
  const span = Math.max(max - min, 0.5);
  const size = (SCALE.span / span) * 100;
  const pos = SCALE.span === span ? 0 : ((min - SCALE.lo) / (SCALE.span - span)) * 100;
  return { backgroundImage: TEMP_GRADIENT, backgroundSize: `${size}% 100%`, backgroundPosition: `${pos}% 0` };
}

type ViewProps = { forecast: Forecast; placeholder: boolean };

function numberText(placeholder: boolean) {
  return (v: number) => (placeholder ? "–" : String(round(v)));
}

function NowPanel({ forecast, placeholder }: ViewProps) {
  const n = numberText(placeholder);
  const today = forecast.daily[0];
  const { current } = forecast;
  const kind = weatherKind(current.code, { isDay: current.isDay, wind: current.wind });
  const stats = [
    { Icon: DropIcon, label: "Yağış", value: `%${n(today.rainProb)}` },
    { Icon: WindIcon, label: "Rüzgâr", value: `${n(current.wind)} km/s` },
    { Icon: SunHorizonIcon, label: "Gün doğumu", value: placeholder ? "–" : (today.sunrise ?? "–") },
  ];
  return (
    <div data-sky={kind} className="wx-sky relative isolate flex flex-col overflow-hidden rounded-[1.75rem] p-5 ring-1 ring-inset ring-foreground/5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">Şu an</p>
          <p className="mt-1 font-heading text-7xl font-bold leading-none tracking-tighter tabular-nums sm:text-8xl" data-testid={placeholder ? undefined : "sicaklik"}>
            {n(current.temp)}
            <span className="align-super text-3xl font-semibold tracking-normal text-muted-foreground sm:text-4xl">°C</span>
          </p>
          <p className="mt-3 text-xl font-semibold">{placeholder ? "…" : describeWeather(current.code)}</p>
          <p className="flex flex-wrap gap-x-3 text-base text-muted-foreground tabular-nums">
            <span>En düşük {n(today.min)}°</span>
            <span>En yüksek {n(today.max)}°</span>
          </p>
        </div>
        <ConditionIcon kind={kind} size="auto" animate={!placeholder} className="-mr-2 -mt-1 size-20 drop-shadow-[0_10px_24px_rgb(0_0_0/0.08)] sm:size-26" />
      </div>
      <dl className="mt-auto grid grid-cols-3 gap-2 pt-6">
        {stats.map(({ Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-card/70 px-3 py-2.5 ring-1 ring-inset ring-foreground/5 backdrop-blur-sm">
            <dt className="flex flex-col gap-1 text-[0.8rem] font-medium leading-tight text-muted-foreground sm:flex-row sm:items-center sm:gap-1.5">
              <Icon aria-hidden="true" weight="duotone" className="size-4 shrink-0" />
              {label}
            </dt>
            <dd className="mt-0.5 font-heading text-lg font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function TodayAdvice({ hint }: { hint: FarmingHint }) {
  const { Icon, tone, tint } = HINT[hint.kind];
  return (
    <div className={`rounded-[1.75rem] p-5 ring-1 ring-inset sm:p-6 ${tint}`}>
      <p className={`flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] ${tone}`}>
        <Icon aria-hidden="true" weight="duotone" className="size-5" />
        Bugün tarlada
      </p>
      <p className="mt-2 font-heading text-xl font-bold leading-snug sm:text-2xl">{hint.text}</p>
    </div>
  );
}

function NextDays({ forecast, placeholder }: ViewProps) {
  const n = numberText(placeholder);
  return (
    <ul className="grid grid-cols-3 gap-2.5" aria-label="Önümüzdeki günler">
      {forecast.daily.slice(1, 4).map((d, i) => (
        <li key={d.date} className="flex flex-col items-center rounded-[1.4rem] border border-border bg-background px-2 py-3.5 text-center">
          <span className="font-semibold">{placeholder ? "–" : formatTrDay(d.date, i + 1)}</span>
          <ConditionIcon kind={dayKind(d)} size={48} animate={false} className="my-1.5" />
          <span className="font-heading text-lg font-bold tabular-nums">
            {n(d.max)}° <span className="font-semibold text-muted-foreground">{n(d.min)}°</span>
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground tabular-nums">
            <DropIcon aria-hidden="true" weight="duotone" className="size-3.5" />%{n(d.rainProb)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Which days of the week suit spraying, and which bring frost or heavy rain. */
function WeekPlan({ forecast, placeholder }: ViewProps) {
  const days = forecast.daily.map((d, i) => ({ label: placeholder ? "–" : formatTrDay(d.date, i), kind: farmingHint(d).kind }));
  return (
    <div className="flex-1 rounded-[1.75rem] border border-border p-5 sm:p-6">
      <p className="font-heading text-lg font-bold">Bu hafta tarlada</p>
      <ul className="mt-3 space-y-3">
        {(["spray", "frost", "rain"] as const).map((kind) => {
          const { Icon, tone, tint, plan } = HINT[kind];
          const list = days.filter((d) => d.kind === kind).map((d) => d.label);
          return (
            <li key={kind} className="flex items-start gap-3">
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${tint} ${tone}`}>
                <Icon aria-hidden="true" weight="duotone" className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{plan}</span>
                <span className="block text-muted-foreground">{list.length ? list.join(", ") : "Bu hafta beklenmiyor"}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function WeekList({ forecast, placeholder }: ViewProps) {
  const n = numberText(placeholder);
  const lo = Math.min(...forecast.daily.map((d) => d.min));
  const hi = Math.max(...forecast.daily.map((d) => d.max));
  const nowAt = rangeBar(forecast.current.temp, forecast.current.temp, lo, hi).left;
  return (
    <div className="mt-6">
      <p className="mb-3 px-1 font-heading text-lg font-bold">7 günlük tahmin</p>
      <ol className="divide-y divide-border overflow-hidden rounded-[1.75rem] border border-border" aria-label="7 günlük tahmin">
        {forecast.daily.map((d, i) => {
          const hint = farmingHint(d);
          const { Icon: HintIcon, tone } = HINT[hint.kind];
          const bar = rangeBar(d.min, d.max, lo, hi);
          const rain = (
            <span className="flex items-center gap-1 font-semibold text-blue-800 tabular-nums dark:text-blue-300">
              <DropIcon aria-hidden="true" weight="duotone" className="size-4" />%{n(d.rainProb)}
            </span>
          );
          return (
            <li
              key={d.date}
              className="grid grid-cols-[5.6rem_2.25rem_minmax(0,1fr)] items-center gap-x-2.5 gap-y-1.5 px-4 sm:gap-x-3 py-3.5 sm:grid-cols-[6rem_2.75rem_3.75rem_minmax(0,1fr)_minmax(0,16rem)] sm:px-5"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">{placeholder ? "–" : formatTrDay(d.date, i)}</span>
                <span className="block text-sm text-muted-foreground">{placeholder ? "–" : formatTrShortDate(d.date)}</span>
              </span>
              <ConditionIcon kind={dayKind(d)} size="auto" animate={false} className="size-9 sm:size-10" />
              <span className="hidden text-sm sm:block">{rain}</span>
              <span className="flex items-center gap-2.5 tabular-nums">
                <span className="w-8 shrink-0 text-right text-muted-foreground">{n(d.min)}°</span>
                <span className="relative h-2 flex-1 rounded-full bg-muted">
                  <span className="absolute inset-y-0 rounded-full" style={{ left: `${bar.left}%`, width: `${bar.width}%`, ...paint(d.min, d.max) }} />
                  {i === 0 && !placeholder && (
                    <span aria-hidden="true" className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card ring-2 ring-foreground/70" style={{ left: `${nowAt}%` }} />
                  )}
                </span>
                <span className="w-8 shrink-0 font-semibold">{n(d.max)}°</span>
              </span>
              <span className={`col-span-full flex flex-wrap items-start gap-x-3 gap-y-1 text-sm sm:col-span-1 ${tone}`}>
                <span className="sm:hidden">{rain}</span>
                <span className="flex min-w-0 items-start gap-1.5 font-medium">
                  <HintIcon aria-hidden="true" weight="duotone" className="mt-0.5 size-4 shrink-0" />
                  {hint.text}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ForecastView({ forecast, compact, placeholder = false }: { forecast: Forecast; compact: boolean; placeholder?: boolean }) {
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <NowPanel forecast={forecast} placeholder={placeholder} />
        <div className="flex flex-col gap-4">
          <TodayAdvice hint={farmingHint(forecast.daily[0])} />
          {compact ? (
            <>
              <NextDays forecast={forecast} placeholder={placeholder} />
              <Link
                href="/hava"
                className="group inline-flex min-h-11 items-center gap-2 self-start font-semibold text-primary underline-offset-4 hover:underline"
              >
                7 günlük tahmin ve il seçimi
                <ArrowRightIcon aria-hidden="true" weight="bold" className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          ) : (
            <WeekPlan forecast={forecast} placeholder={placeholder} />
          )}
        </div>
      </div>
      {!compact && <WeekList forecast={forecast} placeholder={placeholder} />}
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
    <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-1 pt-5 sm:px-7 sm:pt-6">
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
        <div className="px-5 pt-3 sm:px-7">
          <ProvinceSearch onPick={pick} />
        </div>
      )}

      <div className="p-3 sm:p-5">
        {status === "loading" && (
          <div className="relative">
            {/* The real layout, greyed and inert, reserves the space so nothing jumps when data arrives. */}
            <div aria-hidden="true" inert className="opacity-55 motion-safe:animate-pulse">
              <ForecastView forecast={SKELETON} compact={compact} placeholder />
            </div>
            <p role="status" className="absolute left-1/2 top-10 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full bg-card px-4 py-2 font-semibold shadow-soft ring-1 ring-border">
              <span className="size-4 rounded-full border-2 border-primary border-t-transparent motion-safe:animate-spin" aria-hidden="true" />
              Hava durumu yükleniyor…
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3 rounded-[1.75rem] bg-surface px-5 py-10 text-center">
            <CloudIcon size={72} animate={false} />
            <p className="font-heading text-xl font-bold">Hava durumu şu an alınamadı</p>
            <p className="max-w-sm text-muted-foreground">Bağlantınızı kontrol edip yeniden deneyin.</p>
            <Button onClick={retry} className="mt-1">
              <ArrowClockwiseIcon aria-hidden="true" weight="bold" />
              Tekrar dene
            </Button>
          </div>
        )}

        {status === "ok" && forecast && <ForecastView forecast={forecast} compact={compact} />}
      </div>
      <p className="px-5 pb-5 text-sm text-muted-foreground sm:px-7">
        Veri:{" "}
        <a href="https://open-meteo.com/" className="underline" rel="noopener noreferrer" target="_blank">
          Open-Meteo
        </a>
        . Öneriler genel bilgi amaçlıdır.
      </p>
    </div>
  );
}
