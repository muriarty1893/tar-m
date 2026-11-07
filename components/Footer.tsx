import Link from "next/link";
import { siteConfig } from "@/config/site";

// `wide`: shown from 1280 px only (phones reach these through the Hızlı menü). `short`: the phone's label.
const links: { label: string; href: string; wide?: boolean; short?: string }[] = [
  { label: "Hakkımızda", href: "/hakkimizda", wide: true },
  { label: "İş birliği", href: "/is-birligi", wide: true },
  { label: "SSS", href: "/sss" },
  { label: "Pazar kuralları", href: "/pazar/kurallar" },
  { label: "Gizlilik ve KVKK", href: "/gizlilik" },
  { label: "Görsel kaynakları", href: "/kaynaklar", short: "Kaynaklar" },
];

/**
 * A thin footer, two short lines on a phone: the info pages, then the copyright and the contact address
 * (all on one line on wide screens). The menus carry the navigation, so the footer stays out of the way.
 */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-2.5 text-[0.8125rem] leading-snug text-muted-foreground xl:flex-row xl:items-center xl:justify-between xl:gap-6 xl:py-3">
        <nav aria-label="Site bilgileri">
          <ul className="flex flex-wrap items-center gap-x-3">
            {links.map((l) => (
              <li key={l.href} className={l.wide ? "max-xl:hidden" : undefined}>
                <Link href={l.href} aria-label={l.short ? l.label : undefined} className="inline-flex min-h-7 items-center underline-offset-4 hover:text-foreground hover:underline">
                  {l.short ? (
                    <>
                      <span className="xl:hidden">{l.short}</span>
                      <span className="max-xl:hidden">{l.label}</span>
                    </>
                  ) : (
                    l.label
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="flex flex-wrap items-center gap-x-2">
          <span>
            © 2026 {siteConfig.name}
            <span className="max-xl:hidden">. Tüm hakları saklıdır.</span>
          </span>
          <a href={`mailto:${siteConfig.contactEmail}`} className="inline-flex min-h-7 items-center font-medium text-foreground underline-offset-4 hover:underline">
            {siteConfig.contactEmail}
          </a>
        </p>
      </div>
    </footer>
  );
}
