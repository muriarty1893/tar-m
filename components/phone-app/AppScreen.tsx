"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowsClockwiseIcon,
  ChatCircleDotsIcon,
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
  PaperPlaneRightIcon,
  PlantIcon,
  ScanIcon,
  SnowflakeIcon,
  SunIcon,
  TractorIcon,
  UserIcon,
  WifiHighIcon,
  WindIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { demoScenarios, type DemoScenario } from "@/data/demo-scenarios";
import { ANALYSIS_MS, SCREEN } from "@/lib/phone-stage";
import { AnalyzingImage } from "@/components/ui/analyzing-image";
import { SuccessGauge } from "../SuccessGauge";
import { TapHint } from "./TapHint";

// React Bits SpringCheck (motion) loads with the first result, alongside the gauge's number ticker.
const SpringCheck = dynamic(() => import("@/components/ui/spring-check").then((m) => m.SpringCheck), {
  ssr: false,
  loading: () => <span className="block min-h-11" />,
});

export type AppPhase = "idle" | "camera" | "analyzing" | "done";
export type AppTab = "home" | "weather" | "history";
/** Demo coach marks, in order: start a scan, take the photo, open the chat, pick a question. */
export type GuideStep = "scan" | "shoot" | "ask" | "question";

type Props = {
  phase: AppPhase;
  scenario: DemoScenario | null;
  /** Screen shown while no scan is running or open. */
  tab: AppTab;
  onScan: () => void;
  onReset: () => void;
  onTab: (tab: AppTab) => void;
  /** Open a past scan's result straight away (history list). */
  onOpen: (s: DemoScenario) => void;
  /** Shutter on the live camera: take the photo and start the analysis. */
  onShutter: () => void;
  /** The "Soru sor" chat about the current result. */
  asking: boolean;
  onAsk: (open: boolean) => void;
  /** The step to point at with the tap hand, if any. */
  hint?: GuideStep | null;
  /** A question was sent in the chat. */
  onQuestion?: () => void;
};

/** Simulated mobile app (siteConfig.name), drawn at phone size (SCREEN px) for the 3D phone or the flat frame. */
export function AppScreen({ phase, scenario, tab, onScan, onReset, onTab, onOpen, onShutter, asking, onAsk, hint = null, onQuestion }: Props) {
  const camera = (phase === "camera" || phase === "analyzing") && scenario;
  const result = phase === "done" && scenario;
  const chat = result && asking;
  const clip = `inset(0 round ${SCREEN.radius}px)`;
  return (
    <div
      data-testid="uygulama-ekrani"
      className="relative cursor-default select-none overflow-hidden bg-background text-[15px] leading-snug text-foreground antialiased"
      // clip-path (not just border-radius) so blurred layers can't bleed past the display's rounded corners.
      style={{ width: SCREEN.width, height: SCREEN.height, borderRadius: SCREEN.radius, clipPath: clip }}
    >
      <StatusBar dark={!!camera || (!!result && !chat)} />
      <div aria-hidden="true" className="absolute left-1/2 top-[13px] z-30 h-[30px] w-[100px] -translate-x-1/2 rounded-full bg-black" />

      <div aria-live="polite" className="h-full">
        {camera ? (
          <CameraScreen key="camera" s={scenario} live={phase === "camera"} onShutter={onShutter} hint={hint === "shoot"} />
        ) : chat ? (
          <AskScreen key={`ask-${scenario.id}`} s={scenario} onBack={() => onAsk(false)} hint={hint === "question"} onQuestion={onQuestion} />
        ) : result ? (
          <ResultScreen key={`done-${scenario.id}`} s={scenario} onReset={onReset} onAsk={() => onAsk(true)} hint={hint === "ask"} />
        ) : tab === "weather" ? (
          <WeatherScreen key="weather" />
        ) : tab === "history" ? (
          <HistoryScreen key="history" onOpen={onOpen} />
        ) : (
          <HomeScreen key="home" onScan={onScan} hint={hint === "scan"} />
        )}
      </div>

      {!camera && !chat && <TabBar active={result ? "scan" : tab} onHome={onReset} onScan={onScan} onTab={onTab} />}
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

function HomeScreen({ onScan, hint }: { onScan: () => void; hint: boolean }) {
  return (
    <div className={`${scroll} px-3.5 pb-28 pt-[52px] ${enter}`}>
      <WeatherHero />
      <PriceStrip />
      <QuickActions onScan={onScan} hint={hint} />
    </div>
  );
}

function WeatherHero() {
  return (
    <div className="relative h-[238px] overflow-hidden rounded-[26px] text-white shadow-lift">
      <Image src="/app/hero-field.webp" alt="" fill sizes="320px" className="object-cover" />
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
      <Image src={img} alt="" fill sizes="160px" className="object-cover" />
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

function QuickActions({ onScan, hint }: { onScan: () => void; hint: boolean }) {
  const card = "group relative h-[128px] overflow-hidden rounded-[20px] shadow-soft";
  return (
    <div className="mt-4">
      <p className="font-heading text-[16px] font-bold">Hızlı İşlemler</p>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        <div className="relative">
          <button
            type="button"
            onClick={onScan}
            className={`${card} w-full cursor-pointer ring-2 ring-gold ring-offset-2 ring-offset-background transition-transform duration-150 active:scale-[0.97] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:active:scale-100`}
          >
            <ActionCard img="/app/scan-leaf.webp" icon={CameraIcon} title="Hastalık Tara" sub="Kamerayla yaprak teşhisi" badge="Dene" />
          </button>
          {hint && <TapHint label="Taramayı başlatın" className="left-1/2 top-[48%]" />}
        </div>
        <div className={card}>
          <ActionCard img="/app/tractor-field.webp" icon={TractorIcon} title="Tarlalarım" sub="3 tarla ve harcamalar" />
        </div>
        <div className={card}>
          <ActionCard img="/app/field-map.webp" icon={MapTrifoldIcon} title="Tarla Haritası" sub="Uydu ile izleme" />
        </div>
        <div className={card}>
          <ActionCard img="/app/seedlings.webp" icon={CalendarDotsIcon} title="Tarım Takvimi" sub="Ekim ve ilaçlama" />
        </div>
      </div>
    </div>
  );
}

function CameraScreen({ s, live, onShutter, hint }: { s: DemoScenario; live: boolean; onShutter: () => void; hint: boolean }) {
  return (
    <div className="relative h-full bg-black text-white">
      {/* Viewfinder: the same field as the stage behind the phone, zoomed in. Live it drifts like a
          handheld camera; once the shutter is pressed the frame freezes. */}
      <div className={`absolute inset-0 ${live ? "motion-safe:animate-[handheld_7s_ease-in-out_infinite_alternate]" : ""}`}>
        <div className="absolute inset-0 scale-[1.35]">
          <Image src={s.imageSrc} alt={s.imageAlt} fill sizes="480px" className="object-cover" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 top-14 z-10 flex items-center justify-between px-5">
        <span className="flex size-10 items-center justify-center rounded-full bg-black/40 backdrop-blur">
          <XIcon weight="bold" className="size-5" />
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[13px] font-semibold backdrop-blur">
          <span className="size-2 rounded-full bg-red-500 motion-safe:animate-pulse" />
          {live ? "CANLI · Kamera" : "CANLI · Tarama"}
        </span>
        <span className="flex size-10 items-center justify-center rounded-full bg-black/40 backdrop-blur">
          <LightningIcon weight="fill" className="size-5" />
        </span>
      </div>

      {/* Framing brackets; the scan line sweeps only while analysing. */}
      <div aria-hidden="true" className="absolute inset-x-8 top-32 h-[17rem]">
        {["left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl", "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-3xl", "right-0 bottom-0 border-r-4 border-b-4 rounded-br-3xl"].map((c) => (
          <span key={c} className={`absolute size-12 ${live ? "border-white/90" : "border-gold"} ${c}`} />
        ))}
        {!live && <div className="absolute inset-x-3 top-1 h-1 rounded-full bg-gold shadow-[0_0_18px_4px_var(--gold)] motion-safe:animate-[demo-scan_1.4s_ease-in-out_infinite]" />}
      </div>

      {live ? (
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-6 pb-10 pt-12">
          <p className="rounded-full bg-black/50 px-3.5 py-1.5 text-[13px] font-semibold backdrop-blur">Hastalıklı bölgeyi çerçeveye alın</p>
          <div className="flex w-full items-center justify-between">
            <span aria-hidden="true" className="relative size-12 overflow-hidden rounded-xl ring-2 ring-white/70">
              <Image src={s.imageSrc} alt="" fill sizes="48px" className="object-cover" />
            </span>
            <span className="relative">
              <button
                type="button"
                onClick={onShutter}
                aria-label="Fotoğraf çek"
                className="flex size-[78px] cursor-pointer items-center justify-center rounded-full border-4 border-white transition-transform duration-150 active:scale-90 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-gold motion-reduce:active:scale-100"
              >
                <span className="size-[60px] rounded-full bg-white shadow-[0_0_0_2px_rgb(0_0_0/0.15)]" />
              </button>
              {hint && <TapHint label="Fotoğrafı çekin" className="left-1/2 top-1/2" />}
            </span>
            <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-black/40 backdrop-blur">
              <ArrowsClockwiseIcon weight="bold" className="size-6" />
            </span>
          </div>
          <p aria-hidden="true" className="text-[12px] font-bold tracking-[0.2em] text-gold">FOTOĞRAF</p>
        </div>
      ) : (
        <>
          {/* Shutter flash. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-white opacity-0 motion-safe:animate-[shutter-flash_0.45s_ease-out]" />
          <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-[30px] bg-card px-5 pb-9 pt-5 text-card-foreground">
            {/* Waiting for the AI: the image-analysis loader loops for as long as the answer takes. */}
            <div className="flex items-center gap-3.5">
              <AnalyzingImage className="size-14 text-primary [--loading-ui-analyzing-image-background:var(--card)]" />
              <div>
                <p className="font-heading text-[18px] font-bold">Analiz ediliyor…</p>
                <p className="text-[13px] text-muted-foreground">Yapay zekâ fotoğrafı inceliyor</p>
              </div>
            </div>
            <div aria-hidden="true" className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full origin-left rounded-full bg-primary motion-safe:animate-[app-progress_ease-out_forwards]"
                style={{ animationDuration: `${ANALYSIS_MS}ms` }}
              />
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
        </>
      )}
    </div>
  );
}

type Message = { from: "me" | "ai"; text: string };
const GENERIC_ANSWER =
  "Bu bir demo: gerçek uygulamada yapay zekâ sorunuzu fotoğrafınıza, ürününüze ve bölgenizin hava durumuna göre yanıtlayacak. Şimdilik önerilen sorulardan birini deneyebilirsiniz.";

/** "Soru sor": a scripted chat about the scan, with suggested questions and a free-text box. */
function AskScreen({ s, onBack, hint, onQuestion }: { s: DemoScenario; onBack: () => void; hint: boolean; onQuestion?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { from: "ai", text: `Merhaba! "${s.diagnosis}" sonucu hakkında merak ettiklerinizi sorabilirsiniz.` },
  ]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [messages, typing]);

  const asked = new Set(messages.filter((m) => m.from === "me").map((m) => m.text));
  const suggestions = s.questions.filter((q) => !asked.has(q.q));

  const ask = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { from: "me", text: q }]);
    onQuestion?.();
    setDraft("");
    setTyping(true);
    const answer = s.questions.find((x) => x.q === q)?.a ?? GENERIC_ANSWER;
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, { from: "ai", text: answer }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className={`flex h-full flex-col bg-background ${enter}`}>
      <div className="flex items-center gap-3 border-b border-border px-4 pb-3 pt-14">
        <button
          type="button"
          onClick={onBack}
          aria-label="Sonuca dön"
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-card shadow-soft transition-colors duration-150 hover:bg-secondary focus-visible:outline-3 focus-visible:outline-primary"
        >
          <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-5" />
        </button>
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <PlantIcon weight="duotone" className="size-6" />
        </span>
        <span className="min-w-0">
          <span className="block font-heading text-[16px] font-bold">Ziraat asistanı</span>
          <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
            Çevrimiçi · {s.title}
          </span>
        </span>
      </div>

      <div ref={list} role="log" aria-label="Sohbet" className={`${scroll} flex-1 space-y-2.5 px-4 py-4`}>
        {messages.map((m, i) => (
          <p
            key={i}
            className={`max-w-[82%] rounded-[20px] px-3.5 py-2.5 text-[14px] leading-snug ${
              m.from === "me" ? "ml-auto rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card"
            }`}
          >
            <span className="sr-only">{m.from === "me" ? "Siz: " : "Asistan: "}</span>
            {m.text}
          </p>
        ))}
        {typing && (
          <p className="flex w-fit items-center gap-1 rounded-[20px] rounded-bl-md border border-border bg-card px-3.5 py-3" aria-label="Asistan yazıyor">
            {[0, 1, 2].map((d) => (
              <span key={d} className="size-2 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce" style={{ animationDelay: `${d * 120}ms` }} />
            ))}
          </p>
        )}
      </div>

      <div className="relative space-y-2.5 border-t border-border bg-card px-3 pb-7 pt-3">
        {hint && suggestions.length > 0 && <TapHint label="Bir soru seçin" className="left-[64px] top-[32px]" />}
        {suggestions.length > 0 && (
          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 [scrollbar-width:none]">
            {suggestions.map((q) => (
              <button
                key={q.q}
                type="button"
                onClick={() => ask(q.q)}
                className="shrink-0 cursor-pointer rounded-full border border-primary/40 bg-secondary px-3 py-2 text-[13px] font-semibold text-primary transition-colors duration-150 hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary"
              >
                {q.q}
              </button>
            ))}
          </div>
        )}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
          }}
        >
          <label htmlFor="soru-yaz" className="sr-only">
            Sorunuzu yazın
          </label>
          <input
            id="soru-yaz"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Sorunuzu yazın…"
            autoComplete="off"
            className="min-h-11 min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-[14px] outline-none focus-visible:border-primary"
          />
          <button
            type="submit"
            aria-label="Gönder"
            disabled={!draft.trim() || typing}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <PaperPlaneRightIcon aria-hidden="true" weight="fill" className="size-5" />
          </button>
        </form>
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

function ResultScreen({ s, onReset, onAsk, hint }: { s: DemoScenario; onReset: () => void; onAsk: () => void; hint: boolean }) {
  return (
    <div className="relative h-full">
    <div className={`${scroll} pb-28 ${enter}`} data-testid="demo-cevap">
      <div className="relative h-[270px] overflow-hidden text-white">
        <Image src={s.imageSrc} alt={s.imageAlt} fill sizes="340px" className="object-cover" />
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
          <p className="text-[12.5px] text-muted-foreground">Yaptıklarınızı işaretleyin.</p>
          <ul className="mt-1 space-y-1">
            {s.suggestions.map((t) => (
              <li key={t}>
                <SpringCheck
                  label={t}
                  color="var(--foreground)"
                  fillColor="var(--primary)"
                  checkColor="var(--primary-foreground)"
                  boxSize={22}
                  boxRadius={7}
                  fontSize={14}
                  doneOpacity={0.5}
                  className="w-full items-start py-1 [&_.spring-check\_\_press]:mt-[-2px]"
                />
              </li>
            ))}
          </ul>
        </Block>
        <button
          type="button"
          onClick={onAsk}
          className="flex w-full cursor-pointer items-center gap-3 rounded-[20px] border-2 border-primary/30 bg-secondary p-3.5 text-left transition-colors duration-150 hover:bg-primary/15 focus-visible:outline-3 focus-visible:outline-primary"
        >
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ChatCircleDotsIcon weight="fill" className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-heading text-[15px] font-bold text-primary">Bu teşhis hakkında soru sorun</span>
            <span className="block text-[12.5px] text-muted-foreground">Ziraat asistanı yanıtlasın</span>
          </span>
          <CaretRightIcon aria-hidden="true" weight="bold" className="size-4 text-primary" />
        </button>
      </div>
    </div>
      {/* Always-visible shortcut to the chat, above the tab bar. */}
      <button
        type="button"
        onClick={onAsk}
        aria-label="Soru sor"
        className="absolute bottom-[100px] right-4 z-10 flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 font-semibold text-primary-foreground shadow-lift transition-transform duration-150 active:scale-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:active:scale-100"
      >
        <ChatCircleDotsIcon aria-hidden="true" weight="fill" className="size-5" />
        Soru sor
      </button>
      {hint && <TapHint flip label="Soru sorun" className="bottom-[122px] right-[72px]" />}
    </div>
  );
}

function TabBar({
  active,
  onHome,
  onScan,
  onTab,
}: {
  active: AppTab | "scan";
  onHome: () => void;
  onScan: () => void;
  onTab: (tab: AppTab) => void;
}) {
  const items = [
    { id: "home", label: "Ana sayfa", Icon: HouseIcon, go: onHome },
    { id: "scan", label: "Taramalar", Icon: ScanIcon, go: onScan },
    { id: "weather", label: "Hava", Icon: CloudSunIcon, go: () => onTab("weather") },
    { id: "history", label: "Geçmiş", Icon: ClockCounterClockwiseIcon, go: () => onTab("history") },
  ] as const;
  return (
    <nav aria-label="Uygulama menüsü" className="absolute inset-x-0 bottom-0 z-20 flex h-[86px] items-start justify-around border-t border-border bg-card px-5 pt-1.5">
      {items.map(({ id, label, Icon, go }) => {
        const on = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={go}
            aria-current={on ? "page" : undefined}
            className={`flex min-h-12 w-16 cursor-pointer flex-col items-center gap-1 rounded-2xl pt-1 text-[11px] font-semibold transition-colors duration-150 active:bg-secondary focus-visible:outline-2 focus-visible:outline-primary ${on ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-150 ${on ? "bg-secondary" : ""}`}>
              <Icon aria-hidden="true" weight={on ? "fill" : "regular"} className="size-5" />
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}

const FORECAST = [
  { day: "Bugün", Icon: SunIcon, max: 19, min: 7, rain: 5, tip: "İlaçlama için uygun" },
  { day: "Salı", Icon: CloudSunIcon, max: 17, min: 6, rain: 20, tip: "Sulama yapılabilir" },
  { day: "Çarşamba", Icon: CloudRainIcon, max: 13, min: 5, rain: 85, tip: "İlaçlamayı erteleyin" },
  { day: "Perşembe", Icon: CloudSunIcon, max: 15, min: 3, rain: 30, tip: "Toprak işlemeye uygun" },
  { day: "Cuma", Icon: SnowflakeIcon, max: 9, min: -1, rain: 10, tip: "Don riski: fideleri örtün" },
];

function ScreenTitle({ children }: { children: ReactNode }) {
  return <p className="mb-3 font-heading text-[22px] font-bold">{children}</p>;
}

function WeatherScreen() {
  return (
    <div className={`${scroll} px-3.5 pb-28 pt-[56px] ${enter}`}>
      <ScreenTitle>Hava durumu</ScreenTitle>
      <WeatherHero />
      <p className="mb-2 mt-4 font-heading text-[16px] font-bold">5 günlük tarım tahmini</p>
      <ul className="space-y-2">
        {FORECAST.map(({ day, Icon, max, min, rain, tip }) => (
          <li key={day} className="flex items-center gap-3 rounded-[18px] border border-border bg-card px-3 py-2.5">
            <Icon aria-hidden="true" weight="duotone" className={`size-7 shrink-0 ${rain > 60 ? "text-sky-600" : min < 0 ? "text-sky-500" : "text-gold"}`} />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold">{day}</span>
              <span className="block truncate text-[12px] text-muted-foreground">{tip}</span>
            </span>
            <span className="text-right text-[12px] text-muted-foreground">
              <span className="block font-heading text-[15px] font-bold text-foreground">
                {max}° / {min}°
              </span>
              Yağış %{rain}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const HISTORY_DATES = ["Bugün, 08:12", "Dün, 17:40", "3 gün önce", "1 hafta önce"];

function HistoryScreen({ onOpen }: { onOpen: (s: DemoScenario) => void }) {
  return (
    <div className={`${scroll} px-3.5 pb-28 pt-[56px] ${enter}`}>
      <ScreenTitle>Geçmiş taramalar</ScreenTitle>
      <ul className="space-y-2.5">
        {demoScenarios.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onOpen(s)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-[20px] border border-border bg-card p-2.5 text-left transition-colors duration-150 hover:bg-secondary/60 active:bg-secondary focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="relative size-16 shrink-0 overflow-hidden rounded-[14px]">
                <Image src={s.imageSrc} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-bold">{s.title}</span>
                <span className="block truncate text-[12px] text-muted-foreground">{s.diagnosis}</span>
                <span className="block text-[11px] text-muted-foreground">{HISTORY_DATES[i]}</span>
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[12.5px] font-bold ${s.successRate >= 75 ? "bg-secondary text-primary" : s.successRate >= 60 ? "bg-gold-soft text-gold-foreground" : "bg-destructive/10 text-destructive"}`}>
                %{s.successRate}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
