import Link from "next/link";
import type { ReactNode } from "react";
import { ChartBarIcon, ChatsTeardropIcon, FlagIcon, NewspaperIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";

export type AdminSection = "genel" | "haberler" | "forum" | "sikayetler";

const TABS: { id: AdminSection; href: string; label: string; Icon: typeof NewspaperIcon }[] = [
  { id: "genel", href: "/yonetim", label: "Genel bakış", Icon: ChartBarIcon },
  { id: "haberler", href: "/yonetim/haberler", label: "Haberler", Icon: NewspaperIcon },
  { id: "forum", href: "/yonetim/forum", label: "Forum kategorileri", Icon: ChatsTeardropIcon },
  { id: "sikayetler", href: "/yonetim/sikayetler", label: "Şikâyetler", Icon: FlagIcon },
];

/** The admin dashboard's frame: title, the section tabs and the page's own actions. */
export function AdminShell({ section, title, intro, actions, children }: { section: AdminSection; title: string; intro?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <>
      <ToolHeader eyebrow="Yönetim paneli" title={title} intro={intro} actions={actions}>
        <nav aria-label="Yönetim bölümleri" className="-mb-3 mt-3 sm:-mb-6 sm:mt-4">
          <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
            {TABS.map(({ id, href, label, Icon }) => (
              <li key={id}>
                <Link
                  href={href}
                  aria-current={section === id ? "page" : undefined}
                  className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:font-semibold aria-[current=page]:text-primary"
                >
                  <Icon aria-hidden="true" weight={section === id ? "fill" : "regular"} className="size-4" />
                  {label}
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
