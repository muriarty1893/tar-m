"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { DEFAULT_PROVINCE, findProvinces, nearestProvince, type Province } from "@/data/provinces";
import { describeWeather, farmingHint, fetchForecast, type FarmingHint, type Forecast } from "@/lib/weather";
import { formatTrDate } from "@/lib/format";

type Status = "loading" | "ok" | "error";

const hintStyle: Record<FarmingHint["kind"], string> = {
  frost: "border-sky-500 bg-sky-500/10",
  rain: "border-blue-600 bg-blue-600/10",
  spray: "border-primary bg-primary/10",
  normal: "border-accent bg-accent-soft",
};

const hintIcon: Record<FarmingHint["kind"], string> = {
  frost: "❄️",
  rain: "🌧️",
  spray: "✅",
  normal: "🌾",
};

const round = (n: number) => Math.round(n);
const noopSubscribe = () => () => {};

function HintBox({ hint }: { hint: FarmingHint }) {
  return (
    <p className={`rounded-xl border-l-4 p-3 font-semibold ${hintStyle[hint.kind]}`}>
      <span aria-hidden="true">{hintIcon[hint.kind]} </span>
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
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <p className="text-5xl font-extrabold" data-testid={placeholder ? undefined : "sicaklik"}>
          {n(forecast.current.temp)}°C
        </p>
        <p className="text-lg text-muted">{placeholder ? "…" : describeWeather(forecast.current.code)}</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-base sm:grid-cols-3">
        <div>
          <dt className="text-muted">Yağış ihtimali</dt>
          <dd className="font-bold">%{n(today.rainProb)}</dd>
        </div>
        <div>
          <dt className="text-muted">Rüzgâr</dt>
          <dd className="font-bold">{n(forecast.current.wind)} km/s</dd>
        </div>
        <div>
          <dt className="text-muted">En düşük / en yüksek</dt>
          <dd className="font-bold">
            {n(today.min)}° / {n(today.max)}°
          </dd>
        </div>
      </dl>
      <HintBox hint={farmingHint(today)} />

      {compact ? (
        <Link href="/hava" className="inline-block font-bold text-primary underline" tabIndex={placeholder ? -1 : undefined}>
          7 günlük tahmin ve il seçimi →
        </Link>
      ) : (
        <ol className="divide-y divide-line" aria-label="7 günlük tahmin">
          {forecast.daily.map((d) => {
            const hint = farmingHint(d);
            return (
              <li key={d.date} className="grid gap-1 py-3 sm:grid-cols-[10rem_8rem_1fr] sm:items-center">
                <span className="font-semibold">{placeholder ? "–" : formatTrDate(d.date)}</span>
                <span>
                  {n(d.min)}° / {n(d.max)}° · %{n(d.rainProb)}
                </span>
                <span className="text-muted">
                  <span aria-hidden="true">{hintIcon[hint.kind]} </span>
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
      <label htmlFor="il-ara" className="mb-1 block font-semibold">
        İl ara
      </label>
      <input
        id="il-ara"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Örn. Konya, Şanlıurfa…"
        autoComplete="off"
        className="min-h-12 w-full rounded-xl border border-line bg-card px-4 text-lg"
      />
      {query.trim() && (
        <ul className="mt-2 flex flex-wrap gap-2" aria-label="Arama sonuçları">
          {results.length === 0 && <li className="text-muted">Eşleşen il bulunamadı.</li>}
          {results.map((p) => (
            <li key={p.name}>
              <button
                type="button"
                onClick={() => {
                  onPick(p);
                  setQuery("");
                }}
                className="min-h-11 rounded-full border border-line bg-card px-4 hover:border-primary"
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
    <div className="rounded-3xl border border-line bg-card p-5 shadow-sm sm:p-6" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading className="text-2xl font-extrabold">{province.name}</Heading>
        {geoAvailable && (
          <button type="button" onClick={locateMe} className="min-h-11 rounded-full border border-line px-4 text-base hover:border-primary">
            📍 Konumumu kullan
          </button>
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
          <p role="status" className="absolute inset-x-0 top-6 flex items-center gap-2 text-muted">
            <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent motion-safe:animate-spin" aria-hidden="true" />
            Hava durumu yükleniyor…
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 space-y-3">
          <p className="font-semibold">Hava durumu şu an alınamadı</p>
          <button
            type="button"
            onClick={retry}
            className="min-h-11 rounded-full bg-primary px-5 font-bold text-on-primary"
          >
            Tekrar dene
          </button>
        </div>
      )}

      {status === "ok" && forecast && <ForecastView forecast={forecast} compact={compact} />}
      <p className="mt-4 text-sm text-muted">
        Veri:{" "}
        <a href="https://open-meteo.com/" className="underline" rel="noopener noreferrer" target="_blank">
          Open-Meteo
        </a>
        . Öneriler genel bilgi amaçlıdır.
      </p>
    </div>
  );
}
