"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CameraIcon, CheckIcon, InfoIcon } from "@phosphor-icons/react/dist/ssr";
import { demoScenarios, type DemoScenario } from "@/data/demo-scenarios";
import { AppScreen, type AppPhase, type AppTab, type GuideStep } from "./phone-app/AppScreen";
import { PhoneStage, usePrefersReducedMotion } from "./phone-app/PhoneStage";
import type { Backdrop } from "./phone-app/StageBackdrop";

/** The scene behind the phone for each app tab: grass at home, sky for the weather, and so on. */
const BACKDROPS: Record<AppTab, Backdrop> = { home: "meadow", market: "harvest", weather: "sky", calendar: "furrows" };
import { ANALYSIS_MS } from "@/lib/phone-stage";
import { CtaLink } from "./CtaLink";
import { Button } from "./ui/button";
import { FocusCards } from "./ui/focus-cards";

const taken = (p: AppPhase) => p === "analyzing" || p === "done";
const STEPS: { label: string; reached: (p: AppPhase) => boolean; current: (p: AppPhase) => boolean }[] = [
  { label: "Fotoğraf", reached: taken, current: (p) => p === "camera" },
  { label: "Analiz", reached: taken, current: (p) => p === "analyzing" },
  { label: "Sonuç", reached: (p) => p === "done", current: () => false },
];

export function DemoShowcase() {
  const [selected, setSelected] = useState<DemoScenario | null>(null);
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [tab, setTab] = useState<AppTab>("home");
  const [asking, setAsking] = useState(false);
  // Guide steps the visitor has already done; the tap hand points only at the next new one.
  const [done, setDone] = useState<ReadonlySet<GuideStep>>(() => new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const mark = useCallback((step: GuideStep) => setDone((d) => (d.has(step) ? d : new Set(d).add(step))), []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Picking a field opens the live camera on it; a new pick cancels any pending analysis.
  const aim = (s: DemoScenario) => {
    if (timer.current) clearTimeout(timer.current);
    mark("scan");
    setSelected(s);
    setAsking(false);
    setPhase("camera");
  };

  // The shutter takes the photo and starts the analysis. Nothing is ever photographed by itself.
  const press = () => {
    if (timer.current) clearTimeout(timer.current);
    mark("shoot");
    setPhase("analyzing");
    timer.current = setTimeout(() => setPhase("done"), ANALYSIS_MS);
  };

  const pick = (s: DemoScenario) => {
    aim(s);
    // The picker sits below the phone: bring the phone into view (on phones it is usually off screen).
    const el = stage.current;
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    }
  };

  const scanNext = () => {
    const i = selected ? demoScenarios.indexOf(selected) : -1;
    pick(demoScenarios[(i + 1) % demoScenarios.length]);
  };

  const reset = (to: AppTab = "home") => {
    if (timer.current) clearTimeout(timer.current);
    setSelected(null);
    setAsking(false);
    setPhase("idle");
    setTab(to);
  };

  // History list: show a past scan's result without re-running the analysis.
  const open = (s: DemoScenario) => {
    if (timer.current) clearTimeout(timer.current);
    setSelected(s);
    setAsking(false);
    setPhase("done");
  };

  const hint: GuideStep | null =
    phase === "idle" && tab === "home" && !done.has("scan")
      ? "scan"
      : phase === "camera" && !done.has("shoot")
        ? "shoot"
        : phase === "done" && !asking && !done.has("ask")
          ? "ask"
          : phase === "done" && asking && !done.has("question")
            ? "question"
            : null;

  return (
    <div className="space-y-10">
      {/* Desktop: the field picker and the steps beside the phone. Phones: picker, phone, steps. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-10">
        <div className="lg:col-start-1 lg:row-start-1">
          <p className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">1</span>
            Bir tarla fotoğrafı seçin
          </p>
          <FocusCards
            className="mt-4 lg:grid-cols-2"
            cardClassName="lg:aspect-[5/4]"
            cards={demoScenarios.map((s) => ({ id: s.id, title: s.title, src: s.imageSrc, alt: s.imageAlt }))}
            selectedId={selected?.id}
            onSelect={(id) => pick(demoScenarios.find((s) => s.id === id)!)}
            icon={<CameraIcon weight="duotone" />}
          />
        </div>

        <div ref={stage} className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <PhoneStage scene={selected ? { src: selected.imageSrc, alt: selected.imageAlt } : null} backdrop={BACKDROPS[tab]}>
            <AppScreen
              phase={phase}
              scenario={selected}
              tab={tab}
              onScan={scanNext}
              onReset={() => reset()}
              onTab={(t) => reset(t)}
              onOpen={open}
              onShutter={press}
              asking={asking}
              onAsk={(v) => {
                if (v) mark("ask");
                setAsking(v);
              }}
              hint={hint}
              onQuestion={() => mark("question")}
            />
          </PhoneStage>
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <p className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">2</span>
            Fotoğrafı çekin, yanıtı izleyin
          </p>
          <ol className="mt-4 flex items-center gap-2 lg:min-w-[22rem]" aria-label="Tarama adımları">
            {STEPS.map(({ label, reached, current }, i) => {
              const on = reached(phase);
              const now = current(phase);
              return (
                <li key={label} className="flex flex-1 items-center gap-2" aria-current={now ? "step" : undefined}>
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors duration-300 ${
                      on ? "border-primary bg-primary text-primary-foreground" : now ? "border-gold bg-gold-soft text-gold ring-4 ring-gold/25" : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {on ? <CheckIcon aria-hidden="true" weight="bold" className="size-4" /> : i + 1}
                  </span>
                  <span className={`text-[0.95rem] font-semibold ${on || now ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                    <span className="sr-only">{on ? " (tamamlandı)" : now ? " (şu an)" : ""}</span>
                  </span>
                  {i < STEPS.length - 1 && <span aria-hidden="true" className={`h-0.5 flex-1 rounded-full ${on ? "bg-primary" : "bg-border"}`} />}
                </li>
              );
            })}
          </ol>
          {/* Large shutter next to the phone: easier to hit than the one on the small screen. */}
          <div className="mt-5 min-h-14">
            {phase === "camera" ? (
              <Button size="lg" onClick={press} className="w-full sm:w-auto">
                <CameraIcon aria-hidden="true" weight="fill" />
                Fotoğrafı çek ve analiz et
              </Button>
            ) : (
              <p className="text-muted-foreground">
                {phase === "idle" ? "Telefonda \u201cHastalık Tara\u201dya dokunun ya da bir tarla fotoğrafı seçin." : phase === "analyzing" ? "Yapay zekâ fotoğrafı inceliyor…" : "Sonucu telefonda görün, \u201cSoru sor\u201d ile ayrıntı isteyin."}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-3 rounded-2xl border border-border bg-gold-soft p-4 text-base">
          <InfoIcon aria-hidden="true" weight="duotone" className="mt-0.5 size-5 shrink-0 text-gold" />
          Örnek gösterim — gerçek uygulamada kendi tarlanızın fotoğrafını yükleyeceksiniz.
        </p>
        <CtaLink className="shrink-0" />
      </div>
    </div>
  );
}
