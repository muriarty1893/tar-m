import Link from "next/link";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { Logo } from "./Logo";
import { CtaLink } from "./CtaLink";

const links = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İş Birliği", href: "/is-birligi" },
  { label: "Haberler", href: "/haberler" },
  { label: "Hava Durumu", href: "/hava" },
  { label: "Sıkça Sorulan Sorular", href: "/sss" },
  { label: "Gizlilik ve KVKK", href: "/gizlilik" },
  { label: "Görsel kaynakları", href: "/kaynaklar" },
];

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border bg-surface">
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo className="text-xl" />
          <p className="max-w-sm text-muted-foreground">{siteConfig.tagline}</p>
          <CtaLink />
        </div>
        <nav aria-label="Alt menü">
          <p className="font-heading text-base font-bold">Sayfalar</p>
          <ul className="mt-3 space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center text-muted-foreground transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-heading text-base font-bold">İletişim</p>
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="mt-3 inline-flex min-h-11 items-center gap-2 break-all font-medium text-primary underline-offset-4 hover:underline"
          >
            <EnvelopeIcon aria-hidden="true" weight="duotone" className="size-5 shrink-0" />
            {siteConfig.contactEmail}
          </a>
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center gap-x-6 gap-y-1 border-t border-border px-4 py-5 text-center text-sm text-muted-foreground sm:flex-row">
        <p>© 2026 {siteConfig.name}. Tüm hakları saklıdır.</p>
        {/* The one emoji on the site, at the owner's request (allowed in tests/unit/no-emoji.test.ts). */}
        <p data-allow-emoji>
          vibecoded with <span role="img" aria-label="sevgi">❤️</span> by{" "}
          <a href={siteConfig.creator.url} rel="noopener" className="font-semibold text-primary underline-offset-4 hover:underline">
            {siteConfig.creator.name}
          </a>
        </p>
      </div>
    </footer>
  );
}
