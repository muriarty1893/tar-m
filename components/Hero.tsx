import Link from "next/link";
import { ChatsTeardropIcon, CloudSunIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr";
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
      brandNote="Dijital tarım"
      tagline1={line1}
      tagline2={line2 ?? ""}
      eyebrow={
        <Badge variant="secondary" className="max-w-full shrink whitespace-normal text-primary shadow-soft">
          <SparkleIcon aria-hidden="true" weight="fill" />
          Forum, pazar, hava ve takvim · Hepsi ücretsiz
        </Badge>
      }
      cardHeading="Çiftçiler burada buluşuyor."
      cardDescription={
        <>
          <span className="hero-fg font-semibold">{siteConfig.name}</span> ile forumda diğer çiftçilere sorun, çiftçi
          pazarında alıp satın; ilinizin hava durumunu, borsa fiyatlarını ve tarım takviminizi tek yerden takip edin.
        </>
      }
      actions={
        <>
          <CtaLink variant="gold" />
          <Link
            href="/pazar"
            className={buttonVariants({
              variant: "outline",
              className: "hero-outline",
            })}
          >
            Pazar’a göz atın
            <ArrowUpRight />
          </Link>
        </>
      }
      footnote="Ücretsiz hesap · Tamamen Türkçe · KVKK'ya uygun"
      phone={{
        src: "/hero/phone.webp",
        alt: `${siteConfig.name} telefonda: sponsor alanı, hava durumu, Pazar ve forum`,
        width: 760,
        height: 1512,
      }}
      background={{ src: "/hero/field-horizon.webp" }}
      cardPhoto={{ src: pageHeroPhoto.src }}
      badges={[
        { icon: <ChatsTeardropIcon weight="duotone" className="size-5" />, title: "Forumda 3 yeni yanıt", detail: "Bitkisel üretim" },
        { icon: <CloudSunIcon weight="duotone" className="size-5" />, title: "İlaçlama için uygun gün", detail: "Konya · 18°C" },
      ]}
    />
  );
}
