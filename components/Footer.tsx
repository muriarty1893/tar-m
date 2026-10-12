import Link from "next/link";
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
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="space-y-3">
          <Logo className="text-xl" />
          <p className="text-muted">{siteConfig.tagline}</p>
          <CtaLink />
        </div>
        <nav aria-label="Alt menü">
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-2">
          <p className="font-bold">İletişim</p>
          <a href={`mailto:${siteConfig.contactEmail}`} className="break-all text-primary underline">
            {siteConfig.contactEmail}
          </a>
        </div>
      </div>
      <p className="border-t border-line px-4 py-4 text-center text-sm text-muted">
        © 2026 {siteConfig.name}. Tüm hakları saklıdır.
      </p>
    </footer>
  );
}
