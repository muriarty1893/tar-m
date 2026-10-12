"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CameraIcon, CheckIcon, InfoIcon } from "@phosphor-icons/react/dist/ssr";
import { demoScenarios, type DemoScenario } from "@/data/demo-scenarios";
import { photoCredits } from "@/data/photo-credits";
import { AppScreen, type AppPhase, type AppTab } from "./phone-app/AppScreen";
import { PhoneStage, usePrefersReducedMotion } from "./phone-app/PhoneStage";
import { CtaLink } from "./CtaLink";

const ANALYSIS_MS = 2000;
const AUTOPLAY_MS = 2600;

const STEPS: { label: string; reached: (p: AppPhase) => boolean }[] = [
  { label: "Fotoğraf", reached: (p) => p !== "idle" },
  { label: "Analiz", reached: (p) => p !== "idle" },
  { label: "Sonuç", reached: (p) => p === "done" },
];

export function DemoShowcase() {
  const [selected, setSelected] = useState<DemoScenario | null>(null);
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [tab, setTab] = useState<AppTab>("home");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const interacted = useRef(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // A new pick cancels any pending analysis so only the latest answer appears.
  const analyse = useCallback((s: DemoScenario) => {
    if (timer.current) clearTimeout(timer.current);
    setSelected(s);
    setPhase("analyzing");
    timer.current = setTimeout(() => setPhase("done"), ANALYSIS_MS);
  }, []);

  const pick = (s: DemoScenario) => {
    interacted.current = true;
    analyse(s);
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
    interacted.current = true;
    if (timer.current) clearTimeout(timer.current);
    setSelected(null);
    setPhase("idle");
    setTab(to);
  };

  // History list: show a past scan's result without re-running the analysis.
  const open = (s: DemoScenario) => {
    interacted.current = true;
    if (timer.current) clearTimeout(timer.current);
    setSelected(s);
    setPhase("done");
  };

  // Showcase: once the phone is in view, play one example scan unless the visitor acts first.
  useEffect(() => {
    const el = stage.current;
    if (!el || reduced) return;
    let pending: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || interacted.current) return;
        io.disconnect();
        pending = setTimeout(() => {
          if (!interacted.current) analyse(demoScenarios[0]);
        }, AUTOPLAY_MS);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(pending);
    };
  }, [reduced, analyse]);

  return (
    <div className="space-y-10">
      <div ref={stage}>
        <PhoneStage scene={selected ? { src: selected.imageSrc, alt: selected.imageAlt } : null}>
          <AppScreen
            phase={phase}
            scenario={selected}
            tab={tab}
            onScan={scanNext}
            onReset={() => reset()}
            onTab={(t) => reset(t)}
            onOpen={open}
          />
        </PhoneStage>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">1</span>
            Bir tarla fotoğrafı seçin
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {demoScenarios.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => pick(s)}
                  aria-pressed={selected?.id === s.id}
                  className="group w-full cursor-pointer overflow-hidden rounded-3xl border-2 border-border bg-background text-left shadow-soft transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-lift aria-pressed:border-primary aria-pressed:ring-4 aria-pressed:ring-primary/20 motion-reduce:hover:translate-y-0"
                >
                  <Image src={s.imageSrc} alt={s.imageAlt} width={400} height={300} sizes="(min-width: 640px) 25vw, 50vw" className="aspect-[4/3] w-full object-cover" />
                  <span className="flex min-h-12 items-center justify-between gap-2 px-3.5 py-2.5 font-semibold">
                    {s.title}
                    <CameraIcon aria-hidden="true" weight="duotone" className="size-5 shrink-0 text-primary opacity-70 group-aria-pressed:opacity-100" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">2</span>
            Telefondaki yanıtı izleyin
          </p>
          <ol className="mt-4 flex items-center gap-2 lg:min-w-[22rem]" aria-label="Tarama adımları">
            {STEPS.map(({ label, reached }, i) => {
              const on = reached(phase);
              return (
                <li key={label} className="flex flex-1 items-center gap-2">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors duration-300 ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}
                  >
                    {on ? <CheckIcon aria-hidden="true" weight="bold" className="size-4" /> : i + 1}
                  </span>
                  <span className={`text-[0.95rem] font-semibold ${on ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                    <span className="sr-only">{on ? " (tamamlandı)" : ""}</span>
                  </span>
                  {i < STEPS.length - 1 && <span aria-hidden="true" className={`h-0.5 flex-1 rounded-full ${on ? "bg-primary" : "bg-border"}`} />}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-3 rounded-2xl border border-border bg-gold-soft p-4 text-base">
          <InfoIcon aria-hidden="true" weight="duotone" className="mt-0.5 size-5 shrink-0 text-gold" />
          Örnek gösterim — gerçek uygulamada kendi tarlanızın fotoğrafını yükleyeceksiniz.
        </p>
        <CtaLink withArrow className="shrink-0" />
      </div>
      <Credits />
    </div>
  );
}

const linkCls = "underline underline-offset-2 hover:text-foreground";

/** Attribution required by the CC BY licences of the 3D model and photos. */
function Credits() {
  return (
    <div className="space-y-1 text-sm text-muted-foreground">
      <p>
        3B telefon modeli:{" "}
        <a href="https://sketchfab.com/3d-models/iphone-17-pro-4541aa8a28324b33a2baaf81d263aaec" className={linkCls} rel="noopener">
          “iPhone 17 Pro”, Ranguel
        </a>{" "}
        —{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" className={linkCls} rel="noopener license">
          CC BY 4.0
        </a>
        , web için sıkıştırıldı.
      </p>
      <p>
        Fotoğraflar (Wikimedia Commons, kırpıldı):{" "}
        {photoCredits
          .filter((c, i, all) => all.findIndex((o) => o.sourceUrl === c.sourceUrl) === i)
          .map((c, i) => (
            <span key={c.src}>
              {i > 0 && "; "}
              <a href={c.sourceUrl} className={linkCls} rel="noopener">
                {c.label}
              </a>
              {", "}
              {c.author} —{" "}
              {c.licenseUrl ? (
                <a href={c.licenseUrl} className={linkCls} rel="noopener license">
                  {c.license}
                </a>
              ) : (
                c.license
              )}
            </span>
          ))}
      </p>
    </div>
  );
}
