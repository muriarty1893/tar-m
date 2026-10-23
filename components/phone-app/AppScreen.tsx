"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowSquareOutIcon,
  ArrowsClockwiseIcon,
  BatteryFullIcon,
  BellIcon,
  CalendarBlankIcon,
  CalendarDotsIcon,
  CaretDownIcon,
  CaretRightIcon,
  CellSignalFullIcon,
  ChartLineUpIcon,
  ChatCircleDotsIcon,
  CheckCircleIcon,
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
  MegaphoneIcon,
  PaperPlaneRightIcon,
  PlantIcon,
  ScanIcon,
  SnowflakeIcon,
  SprayBottleIcon,
  StorefrontIcon,
  SunIcon,
  TractorIcon,
  WifiHighIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { demoScenarios, type DemoScenario } from "@/data/demo-scenarios";
import { ANALYSIS_MS, SCREEN } from "@/lib/phone-stage";
import { AnalyzingImage } from "@/components/ui/analyzing-image";
import { SuccessGauge } from "../SuccessGauge";
import { TapHint } from "./TapHint";
import { CalendarScreen } from "./CalendarScreen";
import { FieldScreen, FieldsScreen, MapScreen, PricesScreen } from "./FieldScreens";
import { ListingScreen, MarketScreen, NewListingScreen } from "./MarketScreens";
import { ChatScreen } from "./MessageScreens";
import type { MarketSection, Nav, Page } from "./nav";
import { ChangePill, ListingCard, Sparkline, enter, focusRing, scroll } from "./parts";
import { useDemoMarket, type DemoMarket } from "./use-demo-market";
import { LISTINGS, filterListings } from "@/data/demo-market";
import { PRICES } from "@/data/demo-prices";
import { demoNow } from "@/lib/demo-clock";

// React Bits SpringCheck (motion) loads with the first result, alongside the gauge's number ticker.
const SpringCheck = dynamic(() => import("@/components/ui/spring-check").then((m) => m.SpringCheck), {
  ssr: false,
  loading: () => <span className="block min-h-11" />,
});

export type AppPhase = "idle" | "camera" | "analyzing" | "done";
export type AppTab = "home" | "market" | "weather" | "calendar";
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
  /** Open a past scan's result straight away (the history list under the calendar). */
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
  const market = useDemoMarket();
  // Screens opened over the tab (a listing, a chat, the fields…), like the app's stack. A scan or a tab
  // change from outside the phone (the field picker, the tour) closes them.
  const [stack, setStack] = useState<Page[]>([]);
  const [marketSection, setMarketSection] = useState<MarketSection>("ilanlar");
  const [shown, setShown] = useState({ phase, tab });
  if (shown.phase !== phase || shown.tab !== tab) {
    setShown({ phase, tab });
    setStack([]);
  }
  const page = stack[stack.length - 1];
  const nav: Nav = {
    push: (p) => setStack((st) => [...st, p]),
    replace: (p) => setStack((st) => [...st.slice(0, -1), p]),
    back: () => setStack((st) => st.slice(0, -1)),
    tab: (t) => {
      setStack([]);
      if (t === "market") setMarketSection("ilanlar");
      onTab(t);
    },
    messages: () => {
      setStack([]);
      setMarketSection("mesajlar");
      onTab("market");
    },
  };
  return (
    <div
      data-testid="uygulama-ekrani"
      className="demo-app relative cursor-default select-none overflow-hidden bg-background text-[15px] leading-snug text-foreground antialiased"
      // clip-path (not just border-radius) so blurred layers can't bleed past the display's rounded corners.
      style={{ width: SCREEN.width, height: SCREEN.height, borderRadius: SCREEN.radius, clipPath: clip }}
    >
      <StatusBar dark={!!camera || (!!result && !chat) || (!camera && !result && (page?.name === "listing" || page?.name === "field"))} />
      <div aria-hidden="true" className="absolute left-1/2 top-[13px] z-30 h-[30px] w-[100px] -translate-x-1/2 rounded-full bg-black" />

      <div aria-live="polite" className="h-full">
        {camera ? (
          <CameraScreen key="camera" s={scenario} live={phase === "camera"} onShutter={onShutter} onClose={onReset} hint={hint === "shoot"} />
        ) : chat ? (
          <AskScreen key={`ask-${scenario.id}`} s={scenario} onBack={() => onAsk(false)} hint={hint === "question"} onQuestion={onQuestion} />
        ) : result ? (
          <ResultScreen key={`done-${scenario.id}`} s={scenario} onReset={onReset} onAsk={() => onAsk(true)} hint={hint === "ask"} />
        ) : page ? (
          <PageScreen key={stack.length} page={page} market={market} nav={nav} onScan={onScan} />
        ) : tab === "market" ? (
          <MarketScreen key="market" market={market} nav={nav} section={marketSection} onSection={setMarketSection} />
        ) : tab === "weather" ? (
          <WeatherScreen key="weather" />
        ) : tab === "calendar" ? (
          <div key="calendar" className={`${scroll} px-3.5 pb-28 pt-[56px] ${enter}`}>
            <CalendarScreen className="" />
            <ScanHistory onOpen={onOpen} />
          </div>
        ) : (
          <HomeScreen key="home" onScan={onScan} market={market} nav={nav} hint={hint === "scan"} />
        )}
      </div>

      {!camera && !chat && !page && <TabBar active={result ? "scan" : tab} onHome={onReset} onScan={onScan} onTab={onTab} />}
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

/** The screen on top of the stack. */
function PageScreen({ page, market, nav, onScan }: { page: Page; market: DemoMarket; nav: Nav; onScan: () => void }) {
  switch (page.name) {
    case "listing":
      return <ListingScreen id={page.id} fresh={page.fresh} market={market} nav={nav} />;
    case "new-listing":
      return <NewListingScreen market={market} nav={nav} />;
    case "chat":
      return <ChatScreen id={page.id} market={market} nav={nav} />;
    case "fields":
      return <FieldsScreen nav={nav} />;
    case "field":
      return <FieldScreen id={page.id} nav={nav} onScan={onScan} />;
    case "map":
      return <MapScreen nav={nav} />;
    case "prices":
      return <PricesScreen nav={nav} />;
  }
}

const scrim = "pointer-events-none absolute inset-0";

function HomeScreen({ onScan, market, nav, hint }: { onScan: () => void; market: DemoMarket; nav: Nav; hint: boolean }) {
  return (
    <div className={`flex h-full flex-col ${enter}`}>
      <AppHeader unread={market.unreadChats} onInbox={nav.messages} />
      <div className={`${scroll} min-h-0 flex-1 space-y-3 px-3.5 pb-28 pt-3.5`}>
        <SponsorBanner />
        <AdvertiseBox />
        <QuickMenu onScan={onScan} nav={nav} hint={hint} />
        <WeatherHero onForecast={() => nav.tab("weather")} />
        <WeekOutlook />
        <PriceStrip onSeeAll={() => nav.push({ name: "prices" })} />
        <MarketStrip market={market} nav={nav} />
      </div>
    </div>
  );
}

/** The app's top bar: badge logo, name with "Dijital Tarım", the bell and the (demo) profile chip. */
function AppHeader({ unread, onInbox }: { unread: number; onInbox: () => void }) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-card px-3.5 pb-2.5 pt-[50px]">
      <Image src="/brand/logo.webp" alt="" width={40} height={40} className="size-10 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-[17px] font-extrabold leading-tight tracking-tight">{siteConfig.name}</span>
        <span className="mt-0.5 inline-block rounded-full bg-secondary px-2 py-px text-[10.5px] font-bold text-primary">Dijital Tarım</span>
      </span>
      <button
        type="button"
        onClick={onInbox}
        aria-label={unread ? `Bildirimler: ${unread} okunmamış sohbet` : "Bildirimler"}
        className={`relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted transition-colors duration-150 hover:bg-border ${focusRing}`}
      >
        <BellIcon aria-hidden="true" weight="regular" className="size-5" />
        {unread > 0 && <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full bg-orange-500 ring-2 ring-muted" />}
      </button>
      {/* The phone is narrower than a real one: the profile chip shows only the initials. */}
      <span role="img" aria-label="Hesap: Ayşe Yılmaz, demo hesap" className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-secondary bg-primary text-[11.5px] font-bold text-white">
        AY
      </span>
    </div>
  );
}

/** Sample sponsor banner (the app's ad spaces carry sample content for now). */
function SponsorBanner() {
  return (
    <div className="flex items-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#1d4ed8_0%,#0f766e_55%,#047857_100%)] p-3 text-white shadow-soft">
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/15">
        <DropIcon weight="duotone" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-heading text-[13px] font-extrabold">sukocu.com</span>
          <span className="shrink-0 rounded-full bg-amber-400 px-1 py-px text-[8.5px] font-bold tracking-wider text-stone-900">ÖRNEK</span>
        </span>
        <span className="block text-[11.5px] leading-snug text-white/95">Yakıtsız, elektriksiz su pompası</span>
      </span>
      <span className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/40 bg-white/15 px-1.5 py-1.5 text-[10.5px] font-bold">
        İncele
        <ArrowSquareOutIcon aria-hidden="true" weight="bold" className="size-3.5" />
      </span>
    </div>
  );
}

function AdvertiseBox() {
  return (
    <div className="flex items-center gap-2 rounded-[22px] border-2 border-dashed border-amber-300 bg-amber-50 px-2.5 py-2.5">
      <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
        <MegaphoneIcon weight="duotone" className="size-5" />
      </span>
      <span className="min-w-0 flex-1 text-[11.5px] font-bold leading-tight text-amber-900">Reklam Vermek İçin Dokun</span>
      <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-amber-200 px-1.5 py-1 text-[10.5px] font-bold text-amber-900">
        İletişim
        <ArrowRightIcon aria-hidden="true" weight="bold" className="size-3" />
      </span>
    </div>
  );
}

const TILE = {
  emerald: "bg-emerald-50 border-emerald-200 [--solid:#059669]",
  sky: "bg-sky-50 border-sky-200 [--solid:#0ea5e9]",
  indigo: "bg-indigo-50 border-indigo-200 [--solid:#4f46e5]",
  amber: "bg-amber-50 border-amber-200 [--solid:#f59e0b]",
  teal: "bg-teal-50 border-teal-200 [--solid:#0d9488]",
  purple: "bg-purple-50 border-purple-200 [--solid:#9333ea]",
  rose: "bg-rose-50 border-rose-200 [--solid:#e11d48]",
  orange: "bg-orange-50 border-orange-200 [--solid:#f97316]",
} as const;

type MenuItem = { label: string; Icon: typeof EyeIcon; tone: keyof typeof TILE; go: () => void };

/** "Hızlı Menü Kısayolları": bright icon tiles in two rows that scroll sideways, as in the app. */
function QuickMenu({ onScan, nav, hint }: { onScan: () => void; nav: Nav; hint: boolean }) {
  // In columns of two, read top to bottom; three columns fit, the fourth scrolls in.
  const items: MenuItem[] = [
    { label: "Hastalık Tara", Icon: ScanIcon, tone: "emerald", go: onScan },
    { label: "Tarlalarım", Icon: TractorIcon, tone: "amber", go: () => nav.push({ name: "fields" }) },
    { label: "Hava Durumu", Icon: CloudSunIcon, tone: "sky", go: () => nav.tab("weather") },
    { label: "Tarla Haritası", Icon: MapTrifoldIcon, tone: "teal", go: () => nav.push({ name: "map" }) },
    { label: "Tarım Takvimi", Icon: CalendarDotsIcon, tone: "indigo", go: () => nav.tab("calendar") },
    { label: "Fiyatlar", Icon: ChartLineUpIcon, tone: "purple", go: () => nav.push({ name: "prices" }) },
    { label: "Pazar", Icon: StorefrontIcon, tone: "rose", go: () => nav.tab("market") },
    { label: "İlan Ver", Icon: MegaphoneIcon, tone: "orange", go: () => nav.push({ name: "new-listing" }) },
  ];
  return (
    <div className="rounded-[24px] border border-border bg-card py-3.5">
      <div className="flex items-center justify-between px-3.5">
        <p className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-foreground/80">Hızlı Menü Kısayolları</p>
        <span aria-hidden="true" className="flex items-center gap-0.5 text-[11.5px] font-semibold text-muted-foreground">
          Kaydırın
          <ArrowRightIcon weight="bold" className="size-3" />
        </span>
      </div>
      <ul aria-label="Kısayollar" className="mt-2.5 grid snap-x auto-cols-[88px] grid-flow-col grid-rows-2 gap-2 overflow-x-auto px-3.5 [scrollbar-width:none]">
        {items.map(({ label, Icon, tone, go }) => {
          const inner = (
            <>
              <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-[14px] bg-[var(--solid)] text-white shadow-[0_6px_14px_-6px_var(--solid)]">
                <Icon weight="bold" className="size-5" />
              </span>
              <span className="flex min-h-[2lh] w-full items-center justify-center text-center text-[11px] font-bold leading-tight">{label}</span>
            </>
          );
          const tile = `flex h-full w-full flex-col items-center gap-1 rounded-[18px] border px-0.5 pb-2 pt-2.5 ${TILE[tone]}`;
          return (
            <li key={label} className="relative snap-start">
              <button
                type="button"
                onClick={go}
                className={`${tile} cursor-pointer transition-transform duration-150 active:scale-[0.97] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:active:scale-100`}
              >
                {inner}
              </button>
              {hint && go === onScan && <TapHint label="Taramayı başlatın" className="left-1/2 top-[48%]" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** "Tarla Konumu": the app's dark green weather card, with sample values (the app shows live weather). */
function WeatherHero({ onForecast }: { onForecast?: () => void }) {
  return (
    <div data-testid="hava-karti" className="rounded-[24px] bg-[linear-gradient(135deg,#047857_0%,#065f46_35%,#0b3b30_75%,#0f2a2a_100%)] p-3.5 text-white shadow-lift">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-emerald-300">
          <MapPinIcon weight="duotone" className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10.5px] font-bold uppercase tracking-[0.08em] text-emerald-300">Tarla konumu</span>
          <span className="flex items-center gap-1 font-heading text-[18px] font-extrabold leading-tight">
            Konya
            <CaretDownIcon aria-hidden="true" weight="bold" className="size-3.5" />
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-500/20 px-2.5 py-1.5 text-[11px] font-bold">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-400" />
          Canlı Hava
        </span>
      </div>
      <div aria-hidden="true" className="my-3 h-px bg-white/15" />
      <p className="flex items-center gap-2.5">
        <span className="font-heading text-[38px] font-extrabold leading-none tracking-tight">18,5°C</span>
        <span>
          <span className="flex items-center gap-1 text-[13.5px] font-bold">
            <SunIcon aria-hidden="true" weight="fill" className="size-5 text-[#fde047]" />
            Güneşli
          </span>
          <span className="block text-[11.5px] text-white/80">Nem %42</span>
        </span>
      </p>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["Yağış", "%5"],
          ["Rüzgâr", "8 km/s"],
          ["Gün doğumu", "07:04"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[16px] border border-white/15 bg-white/10 px-1 py-2.5 text-center">
            <dt className="text-[11px] text-white/80">{label}</dt>
            <dd className="font-heading text-[17px] font-extrabold">{value}</dd>
          </div>
        ))}
      </dl>
      {(() => {
        const hint = (
          <>
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
              <SprayBottleIcon weight="duotone" className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10.5px] font-bold uppercase tracking-[0.08em] text-primary">Bugün tarlada</span>
              <span className="block text-[13.5px] font-bold leading-snug">İlaçlama için uygun bir gün.</span>
            </span>
          </>
        );
        const card = "mt-3 flex w-full items-center gap-2.5 rounded-[18px] border-l-4 border-emerald-400 bg-card py-2.5 pl-2.5 pr-3 text-left text-foreground";
        return onForecast ? (
          <button type="button" onClick={onForecast} aria-label="Bugün tarlada: İlaçlama için uygun bir gün. 5 günlük tahmini aç" className={`${card} cursor-pointer ${focusRing}`}>
            {hint}
            <CaretRightIcon aria-hidden="true" weight="bold" className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ) : (
          <div className={card}>{hint}</div>
        );
      })()}
    </div>
  );
}

const OUTLOOK = [
  { title: "İlaçlamaya uygun", text: "Bugün", Icon: SprayBottleIcon, tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { title: "Don riski", text: "Cuma", Icon: SnowflakeIcon, tone: "border-sky-200 bg-sky-50 text-sky-700" },
  { title: "Yoğun yağış", text: "Çarşamba", Icon: CloudRainIcon, tone: "border-indigo-200 bg-indigo-50 text-indigo-700" },
];

/** "Bu Hafta Tarlada": the forecast's spraying days, frost and heavy rain. */
function WeekOutlook() {
  return (
    <div className="rounded-[24px] border border-border bg-card p-3.5">
      <p className="mb-2.5 flex items-center gap-2 font-heading text-[16px] font-extrabold">
        <CalendarBlankIcon aria-hidden="true" weight="bold" className="size-5 text-primary" />
        Bu Hafta Tarlada
      </p>
      <ul className="space-y-2">
        {OUTLOOK.map(({ title, text, Icon, tone }) => (
          <li key={title} className={`flex items-center gap-2.5 rounded-[18px] border px-2.5 py-2 ${tone}`}>
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/80">
              <Icon weight="duotone" className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-bold text-foreground">{title}</span>
              <span className="block text-[12px] text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriceStrip({ onSeeAll }: { onSeeAll: () => void }) {
  return (
    <div className="pt-1">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-heading text-[16px] font-extrabold">
          <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
          Tarım Borsası Fiyatları
        </p>
        <button type="button" onClick={onSeeAll} aria-label="Tüm fiyatları gör" className={`flex cursor-pointer items-center text-[12px] font-semibold text-primary ${focusRing}`}>
          Tümünü gör
          <CaretRightIcon aria-hidden="true" weight="bold" className="size-3.5" />
        </button>
      </div>
      <ul tabIndex={0} aria-label="Ürün fiyatları" className="-mx-3.5 mt-2 flex snap-x gap-2.5 overflow-x-auto px-3.5 pb-1 [scrollbar-width:none]">
        {PRICES.slice(0, 4).map((p) => (
          <li key={p.name} className="w-[138px] shrink-0 snap-start rounded-[18px] border border-border bg-card p-3">
            <span className="flex items-center justify-between">
              <span className="text-[13.5px] font-bold">{p.name}</span>
              <Sparkline line={p.line} change={p.change} />
            </span>
            <span className="mt-1 block">
              <span className="font-heading text-[19px] font-extrabold">{p.price.toFixed(2).replace(".", ",")} ₺</span>
              <span className="text-[11px] text-muted-foreground"> /kg</span>
            </span>
            <span className="mt-1.5 flex items-center gap-1.5">
              <ChangePill change={p.change} />
              <span className="truncate text-[10.5px] text-muted-foreground">Türkiye geneli</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "Pazarda yeni": the latest listings, sideways, with a way into Pazar. */
function MarketStrip({ market, nav }: { market: DemoMarket; nav: Nav }) {
  const latest = filterListings(LISTINGS, { query: "", category: "tumu", view: "kesfet", favorites: market.favorites, status: market.listingStatus }).slice(0, 5);
  const now = demoNow();
  return (
    <div className="pt-1">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-heading text-[16px] font-extrabold">
          <span aria-hidden="true" className="size-2 rounded-full bg-gold" />
          Pazarda yeni
        </p>
        <button type="button" onClick={() => nav.tab("market")} aria-label="Pazar’daki tüm ilanlar" className={`flex cursor-pointer items-center text-[12px] font-semibold text-primary ${focusRing}`}>
          Tümünü gör
          <CaretRightIcon aria-hidden="true" weight="bold" className="size-3.5" />
        </button>
      </div>
      <ul aria-label="Yeni ilanlar" className="-mx-3.5 mt-2 flex snap-x gap-2.5 overflow-x-auto px-3.5 pb-2 [scrollbar-width:none]">
        {latest.map((l) => (
          <li key={l.id} className="w-[150px] shrink-0 snap-start">
            <ListingCard listing={l} favorite={market.favorites.includes(l.id)} now={now} onOpen={() => nav.push({ name: "listing", id: l.id })} onFavorite={() => market.toggleFavorite(l.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CameraScreen({ s, live, onShutter, onClose, hint }: { s: DemoScenario; live: boolean; onShutter: () => void; onClose: () => void; hint: boolean }) {
  return (
    <div className="relative h-full bg-black text-white">
      {/* Viewfinder: the same field as the stage behind the phone, zoomed in. Live it drifts like a
          handheld camera; once the shutter is pressed the frame freezes. */}
      <div className={`absolute inset-0 ${live ? "motion-safe:animate-[handheld_7s_ease-in-out_infinite_alternate]" : ""}`}>
        <div className="absolute inset-0 scale-[1.35]">
          <Image src={s.imageSrc} alt={s.imageAlt} fill sizes="480px" className="object-cover" />
        </div>
      </div>
      <div className="absolute inset-x-0 top-14 z-10 flex items-center justify-between px-5">
        {/* Closes the camera (and cancels a running analysis), back to the home screen. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Kamerayı kapat"
          className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-black/40 backdrop-blur transition-colors duration-150 hover:bg-black/60 active:bg-black/70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <XIcon aria-hidden="true" weight="bold" className="size-5" />
        </button>
        <span aria-hidden="true" className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[13px] font-semibold backdrop-blur">
          <span className="size-2 rounded-full bg-red-500 motion-safe:animate-pulse" />
          {live ? "CANLI · Kamera" : "CANLI · Tarama"}
        </span>
        <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full bg-black/40 backdrop-blur">
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
    { id: "market", label: "Pazar", Icon: StorefrontIcon, go: () => onTab("market") },
    { id: "calendar", label: "Takvim", Icon: CalendarDotsIcon, go: () => onTab("calendar") },
  ] as const;
  return (
    <nav aria-label="Uygulama menüsü" className="absolute inset-x-0 bottom-0 z-20 flex h-[86px] items-start justify-around border-t border-border bg-card px-2 pt-1.5">
      {items.map(({ id, label, Icon, go }) => {
        const on = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={go}
            aria-current={on ? "page" : undefined}
            className={`flex min-h-12 w-[60px] cursor-pointer flex-col items-center gap-1 rounded-2xl pt-1 text-[11px] font-semibold transition-colors duration-150 active:bg-secondary focus-visible:outline-2 focus-visible:outline-primary ${on ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
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

/** "Geçmiş taramalar", under the calendar: the demo's past scans; each opens its result again. */
function ScanHistory({ onOpen }: { onOpen: (s: DemoScenario) => void }) {
  return (
    <div className="mt-5">
      <p className="mb-2 font-heading text-[16px] font-bold">Geçmiş taramalar</p>
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
              <span className={`rounded-full px-2.5 py-1 text-[12.5px] font-bold ${s.successRate >= 75 ? "bg-secondary text-primary" : s.successRate >= 50 ? "bg-gold-soft text-gold" : "bg-destructive/10 text-destructive"}`}>
                %{s.successRate}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
