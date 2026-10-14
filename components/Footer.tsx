import Link from "next/link";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { Logo } from "./Logo";
import { CtaLink } from "./CtaLink";
import { WheatScene } from "./WheatScene";

const links = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İş Birliği", href: "/is-birligi" },
  { label: "Haberler", href: "/haberler" },
  { label: "Hava Durumu", href: "/hava" },
  { label: "Sıkça Sorulan Sorular", href: "/sss" },
  { label: "Gizlilik ve KVKK", href: "/gizlilik" },
];

export function Footer() {
  return (
    <footer className="wheat-sky relative isolate mt-auto overflow-hidden border-t border-border [touch-action:pan-y]">
      {/* The whole footer is a wheat field scene; the content sits on the sky above it. */}
      <WheatScene />
      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo className="text-xl" />
          <p className="max-w-sm text-muted-foreground">{siteConfig.tagline}</p>
          <CtaLink withArrow />
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
      {/* Room for the field: the scene's horizon starts here. Move the pointer through it. */}
      <div data-field-start aria-hidden="true" className="h-[19rem] sm:h-[24rem]" />
      <div className="relative z-10 flex justify-center px-4 pb-6">
        <p className="rounded-full bg-[#10301b]/75 px-4 py-2 text-center text-sm text-white/90 backdrop-blur-sm">
          © 2026 {siteConfig.name}. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
