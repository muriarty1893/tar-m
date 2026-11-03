import Link from "next/link";
import type { ReactNode } from "react";
import { ChartBarIcon, FlagIcon, NewspaperIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";

export type AdminSection = "genel" | "haberler" | "sikayetler";

const TABS: { id: AdminSection; href: string; label: string; Icon: typeof NewspaperIcon }[] = [
  { id: "genel", href: "/yonetim", label: "Genel bakış", Icon: ChartBarIcon },
  { id: "haberler", href: "/yonetim/haberler", label: "Haberler", Icon: NewspaperIcon },
  { id: "sikayetler", href: "/yonetim/sikayetler", label: "Şikâyetler", Icon: FlagIcon },
];

/** The admin dashboard's frame: title, the section tabs and the page's own actions. */
export function AdminShell({ section, title, intro, actions, children }: { section: AdminSection; title: string; intro?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <>
      <ToolHeader eyebrow="Yönetim paneli" title={title} intro={intro} actions={actions}>
        <nav aria-label="Yönetim bölümleri" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {TABS.map(({ id, href, label, Icon }) => (
              <li key={id}>
                <Link
                  href={href}
                  aria-current={section === id ? "page" : undefined}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-border px-4 font-semibold transition-colors hover:border-primary/50 aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
                >
                  <Icon aria-hidden="true" weight="duotone" className="size-5" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </ToolHeader>
      <div className="mx-auto max-w-6xl px-4 py-10">{children}</div>
    </>
  );
}

export function AdminSkeleton() {
  return <div aria-hidden="true" className="h-80 rounded-2xl bg-muted motion-safe:animate-pulse" />;
}
