import Link from "next/link";
import type { ReactNode } from "react";
import { ChartBarIcon, ChatsTeardropIcon, ClockCounterClockwiseIcon, FlagIcon, MegaphoneIcon, NewspaperIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";

export type AdminSection = "genel" | "uyeler" | "haberler" | "forum" | "sikayetler" | "reklam" | "kayitlar";

const TABS: { id: AdminSection; href: string; label: string; short: string; Icon: typeof NewspaperIcon }[] = [
  { id: "genel", href: "/yonetim", label: "Genel bakış", short: "Genel", Icon: ChartBarIcon },
  { id: "uyeler", href: "/yonetim/uyeler", label: "Üyeler", short: "Üyeler", Icon: UsersIcon },
  { id: "haberler", href: "/yonetim/haberler", label: "Haberler", short: "Haberler", Icon: NewspaperIcon },
  { id: "forum", href: "/yonetim/forum", label: "Forum kategorileri", short: "Kategoriler", Icon: ChatsTeardropIcon },
  { id: "sikayetler", href: "/yonetim/sikayetler", label: "Şikâyetler", short: "Şikâyetler", Icon: FlagIcon },
  { id: "reklam", href: "/yonetim/reklam", label: "Reklam alanları", short: "Reklam", Icon: MegaphoneIcon },
  { id: "kayitlar", href: "/yonetim/kayitlar", label: "Kayıtlar", short: "Kayıtlar", Icon: ClockCounterClockwiseIcon },
];

/** The admin dashboard's frame: title, the section tabs and the page's own actions. */
export function AdminShell({ section, title, intro, actions, children }: { section: AdminSection; title: string; intro?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <>
      <ToolHeader eyebrow="Yönetim paneli" title={title} intro={intro} actions={actions}>
        <nav aria-label="Yönetim bölümleri" className="-mb-3 mt-3 sm:-mb-6 sm:mt-4">
          <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
            {TABS.map(({ id, href, label, short, Icon }) => (
              <li key={id}>
                <Link
                  href={href}
                  aria-current={section === id ? "page" : undefined}
                  className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-2 text-sm sm:px-2.5 font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:font-semibold aria-[current=page]:text-primary"
                >
                  <Icon aria-hidden="true" weight={section === id ? "fill" : "regular"} className="size-4 max-sm:hidden" />
                  {short === label ? (
                    label
                  ) : (
                    <>
                      <span className="sm:hidden">{short}</span>
                      <span className="max-sm:hidden">{label}</span>
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </ToolHeader>
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-6">{children}</div>
    </>
  );
}

export function AdminSkeleton() {
  return <div aria-hidden="true" className="h-80 rounded-md bg-muted motion-safe:animate-pulse" />;
}
