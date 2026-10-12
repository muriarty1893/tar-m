"use client";

import Image from "next/image";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  BatteryFullIcon,
  CalendarDotsIcon,
  CameraIcon,
  CaretRightIcon,
  CellSignalFullIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  CloudRainIcon,
  CloudSunIcon,
  DropIcon,
  EyeIcon,
  FirstAidKitIcon,
  HouseIcon,
  LightbulbIcon,
  LightningIcon,
  MapPinIcon,
  MapTrifoldIcon,
  ScanIcon,
  SunIcon,
  TractorIcon,
  UserIcon,
  WifiHighIcon,
  WindIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { DemoScenario } from "@/data/demo-scenarios";
import { SCREEN } from "@/lib/phone-stage";
import { SuccessGauge } from "../SuccessGauge";

export type AppPhase = "idle" | "analyzing" | "done";

type Props = {
  phase: AppPhase;
  scenario: DemoScenario | null;
  onScan: () => void;
  onReset: () => void;
};

/** Simulated mobile app (siteConfig.name), drawn at phone size (SCREEN px) for the 3D phone or the flat frame. */
export function AppScreen({ phase, scenario, onScan, onReset }: Props) {
  const camera = phase === "analyzing" && scenario;
  return (
    <div
      className="relative overflow-hidden bg-background text-[15px] leading-snug text-foreground antialiased"
      style={{ width: SCREEN.width, height: SCREEN.height, borderRadius: SCREEN.radius }}
    >
      <StatusBar dark={!!camera || phase === "done"} />
      <div aria-hidden="true" className="absolute left-1/2 top-[13px] z-30 h-[30px] w-[100px] -translate-x-1/2 rounded-full bg-black" />

      <div aria-live="polite" className="h-full">
        {camera ? (
          <CameraScreen key="camera" s={scenario} />
        ) : phase === "done" && scenario ? (
          <ResultScreen key={`done-${scenario.id}`} s={scenario} onReset={onReset} />
        ) : (
          <HomeScreen key="home" onScan={onScan} />
        )}
      </div>

      {!camera && <TabBar active={phase === "done" ? "scan" : "home"} />}
      <div aria-hidden="true" className={`absolute bottom-2 left-1/2 z-30 h-[5px] w-32 -translate-x-1/2 rounded-full ${camera ? "bg-white/80" : "bg-foreground/80"}`} />
      {/* Cover-glass sheen so the flat DOM reads as lit glass on the 3D phone. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-40 bg-[linear-gradient(115deg,rgb(255_255_255/0.16)_0%,transparent_32%,transparent_70%,rgb(255_255_255/0.06)_100%)]" />
    </div>
  );
}

function StatusBar({ dark }: { dark: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between px-8 pt-1 text-[14px] font-semibold ${dark ? "text-white" : "text-foreground"}`}
    >
      <span className="font-heading">09:41</span>
      <span className="flex items-center gap-1.5">
        <CellSignalFullIcon weight="fill" className="size-4" />
        <WifiHighIcon weight="bold" className="size-4" />
        <BatteryFullIcon weight="fill" className="size-5" />
      </span>
    </div>
  );
}

const enter = "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500";
const scroll = "h-full overflow-y-auto overscroll-contain [scrollbar-width:none]";
const scrim = "pointer-events-none absolute inset-0";

const PRICES = [
  { name: "Buğday", price: "9,85", change: 2.1, line: "0,14 8,12 16,13 24,8 32,9 40,3" },
  { name: "Fındık", price: "165,00", change: 3.1, line: "0,13 8,11 16,12 24,7 32,6 40,2" },
  { name: "Mısır", price: "8,40", change: -0.8, line: "0,4 8,6 16,5 24,9 32,8 40,12" },
  { name: "Pamuk", price: "31,20", change: 0.6, line: "0,10 8,11 16,8 24,9 32,6 40,6" },
];

function HomeScreen({ onScan }: { onScan: () => void }) {
  return (
    <div className={`${scroll} px-3.5 pb-28 pt-[52px] ${enter}`}>
      <WeatherHero />
      <PriceStrip />
      <QuickActions onScan={onScan} />
    </div>
  );
}

function WeatherHero() {
  return (
    <div className="relative h-[238px] overflow-hidden rounded-[26px] text-white shadow-lift">
      <Image src="/app/hero-field.svg" alt="" fill unoptimized sizes="320px" className="object-cover" />
      <div aria-hidden="true" className={`${scrim} bg-[linear-gradient(180deg,rgb(0_0_0/0.5)_0%,rgb(0_0_0/0.05)_42%,rgb(0_0_0/0.65)_100%)]`} />
      <div className="relative flex items-start justify-between gap-2 p-3.5">
        <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/25 ring-1 ring-white/40 backdrop-blur">
            <UserIcon weight="bold" className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-heading text-[16px] font-bold leading-tight">Ayşe Yılmaz</span>
            <span className="block truncate text-[11.5px] opacity-90">3 tarla (42 dönüm) · Durum iyi</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[11.5px] font-semibold text-primary">
          <MapPinIcon aria-hidden="true" weight="fill" className="size-3.5" />
          Konya
        </span>
      </div>
      <div className="relative px-4 pt-1">
        <p className="flex items-center gap-2.5">
          <span className="font-heading text-[44px] font-bold leading-none tracking-tight">18,5°C</span>
          <span className="flex items-center gap-1 text-[14px] font-semibold">
            <SunIcon aria-hidden="true" weight="fill" className="size-6 text-[#fde047]" />
            Güneşli
          </span>
        </p>
        <p className="mt-1.5 text-[13px] opacity-95">Tarım havası ve iklim durumu</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/30 px-3.5 py-2.5 text-[11.5px] font-medium backdrop-blur-sm">
        <span className="flex items-center gap-1">
          <DropIcon aria-hidden="true" weight="fill" className="size-4 text-sky-300" />
          Nem: %42
        </span>
        <span className="flex items-center gap-1">
          <CloudRainIcon aria-hidden="true" weight="fill" className="size-4 text-sky-200" />
          Yağış: %5
        </span>
        <span className="flex items-center gap-1">
          <WindIcon aria-hidden="true" weight="bold" className="size-4" />
          Rüzgâr: 8 km/s
        </span>
      </div>
    </div>
  );
}

function PriceStrip() {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-heading text-[16px] font-bold">
          <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
          Tarım Borsası Fiyatları
        </p>
        <span className="flex items-center text-[12px] font-semibold text-primary">
          Tümünü gör
          <CaretRightIcon aria-hidden="true" weight="bold" className="size-3.5" />
        </span>
      </div>
      <ul tabIndex={0} aria-label="Ürün fiyatları" className="-mx-3.5 mt-2 flex snap-x gap-2.5 overflow-x-auto px-3.5 pb-1 [scrollbar-width:none]">
        {PRICES.map((p) => {
          const up = p.change >= 0;
          return (
            <li key={p.name} className="w-[138px] shrink-0 snap-start rounded-[18px] border border-border bg-card p-3">
              <span className="flex items-center justify-between">
                <span className="text-[13.5px] font-bold">{p.name}</span>
                <svg viewBox="0 0 40 16" aria-hidden="true" className={`h-4 w-10 ${up ? "text-primary" : "text-destructive"}`}>
                  <polyline points={p.line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="mt-1 block">
                <span className="font-heading text-[19px] font-bold">{p.price} ₺</span>
                <span className="text-[11px] text-muted-foreground"> /kg</span>
              </span>
              <span className="mt-1.5 flex items-center gap-1.5">
                <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${up ? "bg-secondary text-primary" : "bg-destructive/10 text-destructive"}`}>
                  {up ? <ArrowUpIcon aria-hidden="true" weight="bold" className="size-3" /> : <ArrowDownIcon aria-hidden="true" weight="bold" className="size-3" />}
                  {up ? "+" : "−"}%{Math.abs(p.change).toLocaleString("tr-TR")}
                </span>
                <span className="truncate text-[10.5px] text-muted-foreground">Türkiye geneli</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ActionCard({ img, icon: Icon, title, sub, badge }: { img: string; icon: typeof EyeIcon; title: string; sub: string; badge?: string }) {
  return (
    <>
      <Image src={img} alt="" fill unoptimized sizes="160px" className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none" />
      <span aria-hidden="true" className={`${scrim} bg-[linear-gradient(0deg,rgb(0_0_0/0.72)_0%,rgb(0_0_0/0.15)_55%,transparent_100%)]`} />
      <span aria-hidden="true" className="absolute left-2.5 top-2.5 flex size-9 items-center justify-center rounded-full bg-white/95 text-primary shadow-soft">
        <Icon weight="duotone" className="size-5" />
      </span>
      {badge && <span className="absolute right-2.5 top-2.5 rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-gold-foreground">{badge}</span>}
      <span className="absolute inset-x-2.5 bottom-2.5 flex items-end justify-between gap-1 text-left text-white">
        <span className="min-w-0">
          <span className="block font-heading text-[15px] font-bold leading-tight">{title}</span>
          <span className="block truncate text-[11px] opacity-90">{sub}</span>
        </span>
        <CaretRightIcon aria-hidden="true" weight="bold" className="size-4 shrink-0" />
      </span>
    </>
  );
}

function QuickActions({ onScan }: { onScan: () => void }) {
  const card = "group relative h-[128px] overflow-hidden rounded-[20px] shadow-soft";
  return (
    <div className="mt-4">
      <p className="font-heading text-[16px] font-bold">Hızlı İşlemler</p>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onScan}
          className={`${card} cursor-pointer ring-2 ring-gold ring-offset-2 ring-offset-background transition-transform duration-150 active:scale-[0.97] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:active:scale-100`}
        >
          <ActionCard img="/app/scan-leaf.svg" icon={CameraIcon} title="Hastalık Tara" sub="Kamerayla yaprak teşhisi" badge="Dene" />
        </button>
        <div className={card}>
          <ActionCard img="/app/tractor-field.svg" icon={TractorIcon} title="Tarlalarım" sub="3 tarla ve harcamalar" />
        </div>
        <div className={card}>
          <ActionCard img="/app/field-map.svg" icon={MapTrifoldIcon} title="Tarla Haritası" sub="Uydu ile izleme" />
        </div>
        <div className={card}>
          <ActionCard img="/app/calendar.svg" icon={CalendarDotsIcon} title="Tarım Takvimi" sub="Ekim ve ilaçlama" />
        </div>
      </div>
    </div>
  );
}

function CameraScreen({ s }: { s: DemoScenario }) {
  return (
    <div className="relative h-full bg-black text-white">
      <div className="absolute inset-x-0 -top-28 bottom-0">
        <Image src={s.imageSrc} alt={s.imageAlt} fill unoptimized sizes="340px" className="object-cover opacity-90" />
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 top-14 z-10 flex items-center justify-between px-5">
        <span className="flex size-10 items-center justify-center rounded-full bg-black/40 backdrop-blur">
          <XIcon weight="bold" className="size-5" />
        </span>
        <span className="rounded-full bg-black/40 px-3 py-1.5 text-[13px] font-semibold backdrop-blur">Tarama</span>
        <span className="flex size-10 items-center justify-center rounded-full bg-black/40 backdrop-blur">
          <LightningIcon weight="fill" className="size-5" />
        </span>
      </div>

      {/* Viewfinder with corner brackets and a sweeping scan line. */}
      <div aria-hidden="true" className="absolute inset-x-8 top-32 h-[17rem]">
        {["left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl", "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-3xl", "right-0 bottom-0 border-r-4 border-b-4 rounded-br-3xl"].map((c) => (
          <span key={c} className={`absolute size-12 border-gold ${c}`} />
        ))}
        <div className="absolute inset-x-3 top-1 h-1 rounded-full bg-gold shadow-[0_0_18px_4px_var(--gold)] motion-safe:animate-[demo-scan_1.4s_ease-in-out_infinite]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-[30px] bg-card px-5 pb-9 pt-5 text-card-foreground">
        <p className="flex items-center gap-2 font-heading text-[18px] font-bold" role="status">
          <span className="size-5 rounded-full border-[3px] border-primary border-t-transparent motion-safe:animate-spin" aria-hidden="true" />
          Analiz ediliyor…
        </p>
        <div aria-hidden="true" className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full origin-left rounded-full bg-primary motion-safe:animate-[app-progress_2s_ease-out_forwards]" />
        </div>
        <ul aria-hidden="true" className="mt-3 space-y-1.5 text-[14px] text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircleIcon weight="fill" className="size-4 text-primary" /> Yaprak ve toprak dokusu
          </li>
          <li className="flex items-center gap-2">
            <CheckCircleIcon weight="fill" className="size-4 text-primary" /> Renk ve leke örüntüleri
          </li>
          <li className="flex items-center gap-2">
            <span className="size-4 rounded-full border-2 border-border" /> Öneriler hazırlanıyor
          </li>
        </ul>
      </div>
    </div>
  );
}

function Block({ icon: Icon, label, children }: { icon: typeof EyeIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-[20px] bg-card p-3.5">
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon weight="duotone" className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        {children}
      </div>
    </div>
  );
}

function ResultScreen({ s, onReset }: { s: DemoScenario; onReset: () => void }) {
  return (
    <div className={`${scroll} pb-28 ${enter}`} data-testid="demo-cevap">
      <div className="relative h-[270px] overflow-hidden text-white">
        {/* Shifted up so the sample image's corner tag sits off-screen, behind the status bar crop. */}
        <div className="absolute inset-x-0 -top-12 bottom-0">
          <Image src={s.imageSrc} alt={s.imageAlt} fill unoptimized sizes="340px" className="object-cover" />
        </div>
        <div aria-hidden="true" className={`${scrim} bg-[linear-gradient(180deg,rgb(0_0_0/0.45)_0%,transparent_35%,rgb(0_0_0/0.78)_100%)]`} />
        <div className="absolute inset-x-3.5 top-[52px] flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            aria-label="Yeni tarama"
            className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/95 text-foreground shadow-soft transition-colors duration-150 hover:bg-white focus-visible:outline-3 focus-visible:outline-white"
          >
            <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-5" />
          </button>
          <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12.5px] font-semibold text-primary">
            <CheckCircleIcon aria-hidden="true" weight="fill" className="size-4" />
            Analiz tamamlandı
          </span>
        </div>
        <div className="absolute inset-x-4 bottom-4">
          <p className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] opacity-90">
            <FirstAidKitIcon aria-hidden="true" weight="fill" className="size-4" />
            Teşhis
          </p>
          <p className="mt-1 font-heading text-[19px] font-bold leading-snug">{s.diagnosis}</p>
        </div>
      </div>

      <div className="-mt-3 space-y-2.5 rounded-t-[24px] bg-background px-3.5 pt-3.5 relative">
        <SuccessGauge value={s.successRate} />
        <Block icon={EyeIcon} label="Ne görüyorum">
          <p className="text-[14px]">{s.seen}</p>
        </Block>
        <Block icon={LightbulbIcon} label="Öneriler">
          <ul className="mt-1 space-y-1.5 text-[14px]">
            {s.suggestions.map((t) => (
              <li key={t} className="flex gap-2">
                <CheckCircleIcon aria-hidden="true" weight="fill" className="mt-0.5 size-4 shrink-0 text-primary" />
                {t}
              </li>
            ))}
          </ul>
        </Block>
      </div>
    </div>
  );
}

function TabBar({ active }: { active: "home" | "scan" }) {
  const items = [
    { id: "home", label: "Ana sayfa", Icon: HouseIcon },
    { id: "scan", label: "Taramalar", Icon: ScanIcon },
    { id: "weather", label: "Hava", Icon: CloudSunIcon },
    { id: "history", label: "Geçmiş", Icon: ClockCounterClockwiseIcon },
  ] as const;
  // Decorative: the simulated app's navigation is not interactive on the website.
  return (
    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-20 flex h-[84px] items-start justify-around border-t border-border bg-card/95 px-3 pt-2.5 backdrop-blur">
      {items.map(({ id, label, Icon }) => (
        <span key={id} className={`flex w-16 flex-col items-center gap-1 text-[11px] font-semibold ${active === id ? "text-primary" : "text-muted-foreground"}`}>
          <span className={`flex h-7 w-12 items-center justify-center rounded-full ${active === id ? "bg-secondary" : ""}`}>
            <Icon weight={active === id ? "fill" : "regular"} className="size-5" />
          </span>
          {label}
        </span>
      ))}
    </div>
  );
}
