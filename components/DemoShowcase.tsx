"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { demoScenarios, type DemoScenario } from "@/data/demo-scenarios";
import { SuccessGauge } from "./SuccessGauge";
import { CtaLink } from "./CtaLink";

const ANALYSIS_MS = 2000;

type Phase = "idle" | "analyzing" | "done";

function Answer({ s }: { s: DemoScenario }) {
  return (
    <div className="space-y-4" data-testid="demo-cevap">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-muted">Ne görüyorum</p>
        <p>{s.seen}</p>
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-muted">Teşhis</p>
        <p className="text-lg font-bold">{s.diagnosis}</p>
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-muted">Öneriler</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {s.suggestions.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
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
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_auto]">
      <div>
        <p className="text-lg font-semibold">1. Bir tarla fotoğrafı seçin:</p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
          {demoScenarios.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => analyse(s)}
                aria-pressed={selected?.id === s.id}
                className="group w-full overflow-hidden rounded-2xl border-2 border-line bg-card text-left transition hover:border-primary aria-pressed:border-primary aria-pressed:ring-2 aria-pressed:ring-primary/40"
              >
                <Image src={s.imageSrc} alt={s.imageAlt} width={400} height={300} unoptimized className="aspect-[4/3] w-full object-cover" />
                <span className="block p-3 font-bold">{s.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <p className="mb-4 text-lg font-semibold lg:hidden">2. Yapay zekânın yanıtı:</p>
        {/* Phone frame */}
        <div className="rounded-[2.5rem] border-[10px] border-ink/85 bg-ink/85 shadow-xl">
          <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-surface/40" aria-hidden="true" />
          <div className="min-h-[34rem] overflow-hidden rounded-[1.8rem] bg-surface p-4 text-base" aria-live="polite">
            {phase === "idle" && (
              <div className="flex h-[32rem] flex-col items-center justify-center gap-3 text-center text-muted">
                <span className="text-5xl" aria-hidden="true">📷</span>
                <p>Soldaki fotoğraflardan birine dokunun; yapay zekâ tarlayı analiz etsin.</p>
              </div>
            )}

            {selected && phase !== "idle" && (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-xl">
                  <Image src={selected.imageSrc} alt={selected.imageAlt} width={400} height={300} unoptimized className="w-full" />
                  {phase === "analyzing" && (
                    <div className="absolute inset-0 bg-primary/20" aria-hidden="true">
                      <div className="h-1 w-full bg-accent shadow-[0_0_12px_var(--accent)] motion-safe:animate-[demo-scan_1.2s_ease-in-out_infinite]" />
                    </div>
                  )}
                </div>
                {phase === "analyzing" ? (
                  <p className="flex items-center gap-2 font-semibold" role="status">
                    <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent motion-safe:animate-spin" aria-hidden="true" />
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

      <div className="space-y-4 lg:col-span-2">
        <p className="rounded-xl border border-line bg-accent-soft p-4 text-base">
          Örnek gösterim — gerçek uygulamada kendi tarlanızın fotoğrafını yükleyeceksiniz.
        </p>
        <CtaLink />
      </div>
    </div>
  );
}
