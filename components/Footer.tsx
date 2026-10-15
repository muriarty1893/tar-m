import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ArrowUpRight } from "@/components/ui/arrow-up-right";
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
 * Swiss-style footer: the contact address set large, the actions as underlined links, the pages in
 * a plain list and in brackets, and the brand name across the full width at the bottom.
 */
export function Footer() {
  return (
    <footer className="site-footer mt-auto">
      <div className="site-footer__inner mx-auto max-w-7xl px-4 pt-14 sm:px-8 sm:pt-20">
        <a href={`mailto:${siteConfig.contactEmail}`} className="site-footer__email ml-auto block w-fit">
          {siteConfig.contactEmail}
        </a>

        <div className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-[auto_1fr]">
          <ul className="site-footer__mono order-2 md:order-1 md:pt-10">
            {pages.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="site-footer__page">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="order-1 flex flex-col gap-10 md:order-2 md:items-end">
            <ul className="site-footer__mono flex flex-wrap gap-x-10 gap-y-2 md:justify-end">
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
            <p className="site-footer__note max-w-64 md:text-right">{siteConfig.tagline}</p>
          </div>
        </div>

        <ul className="site-footer__mono mt-12 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-6">
          {more.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="site-footer__bracket">
                <span aria-hidden="true">[</span>
                {l.label}
                <span aria-hidden="true">]</span>
              </Link>
            </li>
          ))}
        </ul>

        <p data-testid="footer-wordmark" aria-hidden="true" className="site-footer__wordmark">
          BEREKET AI
        </p>

        <div className="site-footer__mono grid items-end gap-x-8 gap-y-3 pb-6 pt-6 text-sm sm:pt-8 md:grid-cols-3">
          <FooterClock />
          <p className="normal-case md:text-center">
            vibecoded with <span role="img" aria-label="sevgi">♡</span> by{" "}
            <a href={siteConfig.creator.url} rel="noopener" className="site-footer__credit">
              {siteConfig.creator.name}
            </a>
          </p>
          <p className="site-footer__legal md:text-right">
            © 2026 {siteConfig.name}. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
