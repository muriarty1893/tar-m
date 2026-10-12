import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { demoScenarios } from "@/data/demo-scenarios";
import { CtaLink } from "./CtaLink";
import { SuccessGauge } from "./SuccessGauge";

/** Static phone mockup of the app's answer screen (placeholder until real screenshots exist). */
function PhoneMockup() {
  const s = demoScenarios[0];
  return (
    <div className="mx-auto w-full max-w-[19rem] rotate-2 rounded-[2.5rem] border-[10px] border-ink/85 bg-ink/85 shadow-2xl" aria-hidden="true">
      <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-surface/40" />
      <div className="space-y-3 overflow-hidden rounded-[1.8rem] bg-surface p-4 text-sm">
        <p className="font-extrabold text-primary">{siteConfig.name}</p>
        <Image src={s.imageSrc} alt="" width={400} height={300} unoptimized priority className="rounded-xl" />
        <p className="font-bold">{s.diagnosis}</p>
        <p className="text-muted">{s.suggestions[0]}</p>
        <div className="scale-90">
          <SuccessGauge value={s.successRate} />
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-accent-soft/70 to-surface px-4 pb-16 pt-12 sm:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="inline-block rounded-full bg-primary/10 px-4 py-1 font-bold text-primary">
            Çiftçiler için yapay zekâ destekli tarla asistanı
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">{siteConfig.tagline}</h1>
          <p className="mt-5 max-w-xl text-xl text-muted">
            {siteConfig.name}, tarlanızın fotoğrafından hastalık ve zararlı belirtilerini tanır, size anlaşılır öneriler
            sunar ve hasat başarı tahmini verir. Tamamen Türkçe, tamamen çiftçiye göre.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaLink className="text-lg" />
            <Link
              href="/#demo"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-primary px-6 py-3 font-bold text-primary hover:bg-primary/10"
            >
              Demoyu deneyin
            </Link>
          </div>
          <p className="mt-4 text-base text-muted">Ücretsiz kayıt · Uygulama çıktığında ilk siz haberdar olun</p>
        </div>
        <PhoneMockup />
      </div>
    </section>
  );
}
