import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ArrowUpRight } from "@/components/ui/arrow-up-right";
import { RollText } from "@/components/ui/roll-text";
import { CtaLink } from "./CtaLink";
import { FooterClock } from "./FooterClock";

const pages = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İş Birliği", href: "/is-birligi" },
  { label: "Haberler", href: "/haberler" },
  { label: "Hava Durumu", href: "/hava" },
];

const more = [
  { label: "SSS", href: "/sss" },
  { label: "Gizlilik ve KVKK", href: "/gizlilik" },
  { label: "Görsel kaynakları", href: "/kaynaklar" },
];

const actions = [
  { label: "Demoyu deneyin", href: "/#demo" },
  { label: "Soru sorun", href: "/#sorular" },
];

/**
 * Footer modelled on olhalazarieva.com: the contact address set large, underlined actions whose line
 * wipes across on hover, rolling page links (in brackets for the secondary ones), the brand name
 * across the full width and a bottom row with the clock, the maker credit and the legal line.
 */
export function Footer() {
  return (
    <footer className="site-footer mt-auto">
      <div className="site-footer__inner px-4 pt-16 sm:px-8 sm:pt-24 lg:px-[3.9vw]">
        <a href={`mailto:${siteConfig.contactEmail}`} className="site-footer__email">
          {siteConfig.contactEmail}
        </a>

        <div className="mt-8 grid gap-x-10 gap-y-12 md:grid-cols-[auto_1fr]">
          <ul className="order-2 md:order-1 md:pt-8">
            {pages.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-label={l.label} className="site-footer__page">
                  <RollText text={l.label} />
                </Link>
              </li>
            ))}
          </ul>
          <div className="order-1 flex flex-col gap-10 md:order-2 md:items-end">
            <ul className="flex flex-wrap gap-x-[clamp(2rem,6vw,6rem)] gap-y-4 md:justify-end">
              <li>
                <CtaLink variant="text" className="site-footer__action" />
              </li>
              {actions.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="site-footer__action">
                    {l.label}
                    <ArrowUpRight />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="site-footer__note max-w-60">
              {siteConfig.name}:
              <br />
              {siteConfig.tagline}
            </p>
          </div>
        </div>

        <ul className="mt-14 flex flex-col items-start sm:flex-row sm:flex-wrap sm:justify-between">
          {more.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-label={l.label} className="site-footer__bracket">
                <RollText text={l.label} />
              </Link>
            </li>
          ))}
        </ul>

        <p data-testid="footer-wordmark" aria-hidden="true" className="site-footer__wordmark">
          {siteConfig.name.toLocaleUpperCase("tr")}
        </p>

        <div className="grid items-end gap-x-8 gap-y-4 pb-7 pt-6 sm:pt-8 md:grid-cols-[1fr_auto_1fr]">
          <FooterClock className="site-footer__clock" />
          <a href={siteConfig.creator.url} rel="noopener" aria-label={`vibecoded with love by ${siteConfig.creator.name}`} className="site-footer__dev">
            VIBECODED WITH ♡ BY{" "}
            <span className="site-footer__swap">
              <span className="site-footer__initials">
                <span>M</span>
                <span>E</span>
              </span>
              <span className="site-footer__fullname">{siteConfig.creator.name}</span>
            </span>
          </a>
          <p className="site-footer__legal md:justify-self-end">
            © 2026 {siteConfig.name}. Tüm hakları saklıdır.
            <br />
            İçeriklerin izinsiz kopyalanması, çoğaltılması
            <br />
            veya kullanılması yasaktır.
          </p>
        </div>
      </div>
    </footer>
  );
}
