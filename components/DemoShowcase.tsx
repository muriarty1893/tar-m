"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CameraIcon, CheckIcon, InfoIcon } from "@phosphor-icons/react/dist/ssr";
import { demoScenarios, type DemoScenario } from "@/data/demo-scenarios";
import { AppScreen, type AppPhase } from "./phone-app/AppScreen";
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
  };

  const scanNext = () => {
    const i = selected ? demoScenarios.indexOf(selected) : -1;
    pick(demoScenarios[(i + 1) % demoScenarios.length]);
  };

  const reset = () => {
    interacted.current = true;
    if (timer.current) clearTimeout(timer.current);
    setSelected(null);
    setPhase("idle");
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
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
      <div>
        <p className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-7 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">1</span>
          Bir tarla fotoğrafı seçin
        </p>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
          {demoScenarios.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => pick(s)}
                aria-pressed={selected?.id === s.id}
                className="group w-full cursor-pointer overflow-hidden rounded-3xl border-2 border-border bg-background text-left shadow-soft transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-lift aria-pressed:border-primary aria-pressed:ring-4 aria-pressed:ring-primary/20 motion-reduce:hover:translate-y-0"
              >
                <Image src={s.imageSrc} alt={s.imageAlt} width={400} height={300} unoptimized className="aspect-[4/3] w-full object-cover" />
                <span className="flex items-center justify-between gap-2 p-3.5 font-semibold">
                  {s.title}
                  <CameraIcon aria-hidden="true" weight="duotone" className="size-5 text-primary opacity-70 group-aria-pressed:opacity-100" />
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-8 flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-7 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">2</span>
          Telefondaki yanıtı izleyin
        </p>
        <ol className="mt-4 flex items-center gap-2" aria-label="Tarama adımları">
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

      <div ref={stage}>
        <PhoneStage>
          <AppScreen phase={phase} scenario={selected} onScan={scanNext} onReset={reset} />
        </PhoneStage>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
        <p className="flex items-start gap-3 rounded-2xl border border-border bg-gold-soft p-4 text-base">
          <InfoIcon aria-hidden="true" weight="duotone" className="mt-0.5 size-5 shrink-0 text-gold" />
          Örnek gösterim — gerçek uygulamada kendi tarlanızın fotoğrafını yükleyeceksiniz.
        </p>
        <CtaLink withArrow className="shrink-0" />
      </div>
      <p className="text-sm text-muted-foreground lg:col-span-2">
        3B telefon modeli:{" "}
        <a
          href="https://sketchfab.com/3d-models/iphone-17-pro-4541aa8a28324b33a2baaf81d263aaec"
          className="underline underline-offset-2 hover:text-foreground"
          rel="noopener"
        >
          “iPhone 17 Pro”, Ranguel
        </a>{" "}
        —{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-2 hover:text-foreground" rel="noopener license">
          CC BY 4.0
        </a>
        , web için sıkıştırıldı.
      </p>
    </div>
  );
}
