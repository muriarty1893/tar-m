import Link from "next/link";
import { CloudSunIcon, ScanIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CinematicHero } from "@/components/ui/cinematic-landing-hero";
import { pageHeroPhoto } from "@/data/photo-credits";
import { ArrowUpRight } from "@/components/ui/arrow-up-right";
import { CtaLink } from "./CtaLink";

// The slogan on two lines: its first word, then the rest ("Çiftçinin" / "Akıllı Rehberi").
const [line1, line2] = siteConfig.tagline.split(/(?<=^\S+)\s/);

/** Home hero: bare soil running to the horizon behind the headline, then a card filled with a ripe
 *  wheat field (Suşehri, Sivas) holding the app on our phone: the field before and after. */
export function Hero() {
  return (
    <CinematicHero
      brandName={siteConfig.name}
      brandNote="Tarla asistanı"
      tagline1={line1}
      tagline2={line2 ?? ""}
      eyebrow={
        <Badge variant="secondary" className="max-w-full shrink whitespace-normal text-primary shadow-soft">
          <SparkleIcon aria-hidden="true" weight="fill" />
          Çiftçiler için yapay zekâ destekli tarla asistanı
        </Badge>
      }
      cardHeading="Ziraat uzmanınız cebinizde."
      cardDescription={
        <>
          <span className="hero-fg font-semibold">{siteConfig.name}</span>, tarlanızın fotoğrafından hastalık ve
          zararlı belirtilerini tanır, sade Türkçe öneriler sunar ve hasat başarı tahmini verir.
        </>
      }
      actions={
        <>
          <CtaLink variant="gold" />
          <Link
            href="/#demo"
            className={buttonVariants({
              variant: "outline",
              className: "hero-outline",
            })}
          >
            Demoyu deneyin
            <ArrowUpRight />
          </Link>
        </>
      }
      footnote="Ücretsiz kayıt · Tamamen Türkçe · KVKK'ya uygun"
      phone={{
        src: "/hero/phone.webp",
        alt: `${siteConfig.name} mobil uygulamasının ana ekranı: tarla hava durumu, ürün fiyatları ve hızlı işlemler`,
        width: 760,
        height: 1512,
      }}
      background={{ src: "/hero/field-horizon.webp" }}
      cardPhoto={{ src: pageHeroPhoto.src }}
      badges={[
        { icon: <ScanIcon weight="duotone" className="size-5" />, title: "Sarı pas tespit edildi", detail: "Buğday · erken evre" },
        { icon: <CloudSunIcon weight="duotone" className="size-5" />, title: "İlaçlama için uygun gün", detail: "Konya · 18°C" },
      ]}
    />
  );
}
