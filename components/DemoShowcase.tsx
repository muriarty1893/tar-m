"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  CameraIcon,
  CheckCircleIcon,
  EyeIcon,
  FirstAidKitIcon,
  InfoIcon,
  LightbulbIcon,
} from "@phosphor-icons/react/dist/ssr";
import { demoScenarios, type DemoScenario } from "@/data/demo-scenarios";
import { SuccessGauge } from "./SuccessGauge";
import { CtaLink } from "./CtaLink";

const ANALYSIS_MS = 2000;

type Phase = "idle" | "analyzing" | "done";

function AnswerBlock({ icon: Icon, label, children }: { icon: typeof EyeIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon aria-hidden="true" weight="duotone" className="size-5" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        {children}
      </div>
    </div>
  );
}

function Answer({ s }: { s: DemoScenario }) {
  return (
    <div className="space-y-4" data-testid="demo-cevap">
      <AnswerBlock icon={EyeIcon} label="Ne görüyorum">
        <p className="text-[0.95rem]">{s.seen}</p>
      </AnswerBlock>
      <AnswerBlock icon={FirstAidKitIcon} label="Teşhis">
        <p className="font-heading text-lg font-bold leading-snug">{s.diagnosis}</p>
      </AnswerBlock>
      <AnswerBlock icon={LightbulbIcon} label="Öneriler">
        <ul className="mt-1 space-y-1.5 text-[0.95rem]">
          {s.suggestions.map((t) => (
            <li key={t} className="flex gap-2">
              <CheckCircleIcon aria-hidden="true" weight="fill" className="mt-1 size-4 shrink-0 text-primary" />
              {t}
            </li>
          ))}
        </ul>
      </AnswerBlock>
      <SuccessGauge value={s.successRate} />
    </div>
  );
}

export function DemoShowcase() {
  const [selected, setSelected] = useState<DemoScenario | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // A new pick cancels any pending analysis so only the latest answer appears.
  const analyse = (s: DemoScenario) => {
    if (timer.current) clearTimeout(timer.current);
    setSelected(s);
    setPhase("analyzing");
    timer.current = setTimeout(() => setPhase("done"), ANALYSIS_MS);
  };

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_auto]">
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
                onClick={() => analyse(s)}
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
      </div>

      <div className="mx-auto w-full max-w-sm">
        <p className="mb-5 flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-7 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">2</span>
          Yapay zekânın yanıtı
        </p>
        {/* Phone frame */}
        <div className="relative">
          <div aria-hidden="true" className="blob absolute -inset-6 bg-blob opacity-70" />
          <div className="relative rounded-[2.6rem] border-[10px] border-foreground bg-foreground shadow-lift">
            <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-background/40" aria-hidden="true" />
            <div className="min-h-[34rem] overflow-hidden rounded-[1.9rem] bg-background p-4 text-base" aria-live="polite">
              {phase === "idle" && (
                <div className="flex h-[32rem] flex-col items-center justify-center gap-4 px-4 text-center text-muted-foreground">
                  <span className="blob flex size-20 items-center justify-center bg-secondary text-primary">
                    <CameraIcon aria-hidden="true" weight="duotone" className="size-10" />
                  </span>
                  <p>Bir fotoğrafa dokunun; yapay zekâ tarlayı analiz etsin.</p>
                </div>
              )}

              {selected && phase !== "idle" && (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-2xl">
                    <Image src={selected.imageSrc} alt={selected.imageAlt} width={400} height={300} unoptimized className="w-full" />
                    {phase === "analyzing" && (
                      <div className="absolute inset-0 bg-primary/20" aria-hidden="true">
                        <div className="h-1 w-full bg-gold shadow-[0_0_14px_var(--gold)] motion-safe:animate-[demo-scan_1.2s_ease-in-out_infinite]" />
                      </div>
                    )}
                  </div>
                  {phase === "analyzing" ? (
                    <p className="flex items-center gap-2 font-semibold" role="status">
                      <span className="size-4 rounded-full border-2 border-primary border-t-transparent motion-safe:animate-spin" aria-hidden="true" />
                      Analiz ediliyor…
                    </p>
                  ) : (
                    <Answer s={selected} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
        <p className="flex items-start gap-3 rounded-2xl border border-border bg-gold-soft p-4 text-base">
          <InfoIcon aria-hidden="true" weight="duotone" className="mt-0.5 size-5 shrink-0 text-gold" />
          Örnek gösterim — gerçek uygulamada kendi tarlanızın fotoğrafını yükleyeceksiniz.
        </p>
        <CtaLink withArrow className="shrink-0" />
      </div>
    </div>
  );
}
