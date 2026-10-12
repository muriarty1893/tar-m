import Image from "next/image";
import Link from "next/link";
import {
  CheckCircleIcon,
  CloudSunIcon,
  ScanIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TranslateIcon,
} from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { demoScenarios } from "@/data/demo-scenarios";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CtaLink } from "./CtaLink";

const trust = [
  { icon: CheckCircleIcon, text: "Ücretsiz kayıt" },
  { icon: TranslateIcon, text: "Tamamen Türkçe" },
  { icon: ShieldCheckIcon, text: "KVKK'ya uygun" },
];

/** Illustrative phone mockup of the app's answer screen; replace with a real screenshot later. */
function PhoneMockup() {
  const s = demoScenarios[0];
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[20rem]">
      <div className="blob absolute -inset-8 bg-blob" />
      <div className="blob-alt absolute -bottom-6 -left-10 size-40 bg-gold-soft" />

      <div className="relative rotate-[2.5deg] rounded-[2.6rem] border-[10px] border-foreground bg-foreground shadow-lift">
        <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-background/40" />
        <div className="space-y-3 overflow-hidden rounded-[1.9rem] bg-background p-4 text-sm">
          <p className="font-heading font-bold text-primary">{siteConfig.name}</p>
          <Image src={s.imageSrc} alt="" width={400} height={300} unoptimized className="rounded-2xl" />
          <p className="font-heading font-bold leading-snug">{s.diagnosis}</p>
          <p className="text-muted-foreground">{s.suggestions[0]}</p>
          <div>
            <div className="flex justify-between text-xs font-semibold">
              <span>Hasat başarı tahmini</span>
              <span className="text-primary">%{s.successRate}</span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${s.successRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -left-6 top-16 hidden rotate-[-4deg] items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm font-semibold shadow-soft sm:flex">
        <ScanIcon weight="duotone" className="size-5 text-primary" />
        Fotoğraf analiz edildi
      </div>
      <div className="absolute -right-4 bottom-20 hidden rotate-[3deg] items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm font-semibold shadow-soft sm:flex">
        <CloudSunIcon weight="duotone" className="size-5 text-gold" />
        İlaçlama için uygun gün
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-12 sm:pt-20">
      <div aria-hidden="true" className="dot-texture pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        <div className="min-w-0">
          <Badge variant="secondary" className="max-w-full shrink whitespace-normal text-left text-primary">
            <SparkleIcon aria-hidden="true" weight="fill" />
            Çiftçiler için yapay zekâ destekli tarla asistanı
          </Badge>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            {siteConfig.tagline}
          </h1>
          <p className="mt-6 max-w-xl text-xl text-muted-foreground">
            {siteConfig.name}, tarlanızın fotoğrafından hastalık ve zararlı belirtilerini tanır, sade Türkçe öneriler
            sunar ve hasat başarı tahmini verir.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CtaLink size="lg" withArrow />
            <Link href="/#demo" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Demoyu deneyin
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-base text-muted-foreground">
            {trust.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon aria-hidden="true" weight="duotone" className="size-5 text-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <PhoneMockup />
      </div>
    </section>
  );
}
