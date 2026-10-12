import Image from "next/image";
import Link from "next/link";
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TranslateIcon,
} from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CtaLink } from "./CtaLink";

const trust = [
  { icon: CheckCircleIcon, text: "Ücretsiz kayıt" },
  { icon: TranslateIcon, text: "Tamamen Türkçe" },
  { icon: ShieldCheckIcon, text: "KVKK'ya uygun" },
];

/** Render of the 3D showcase phone running the app's home screen (see docs/3d-model.md to re-render). */
function PhoneShot() {
  return (
    <div className="relative mx-auto w-full max-w-[18rem] sm:max-w-[22rem]">
      <div aria-hidden="true" className="blob absolute inset-x-0 inset-y-10 bg-blob" />
      <Image
        src="/hero-phone.webp"
        alt={`${siteConfig.name} mobil uygulamasının ana ekranı: tarla hava durumu, ürün fiyatları ve hızlı işlemler`}
        width={880}
        height={1443}
        sizes="(min-width: 640px) 352px, 288px"
        className="relative h-auto w-full"
      />
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
        <PhoneShot />
      </div>
    </section>
  );
}
