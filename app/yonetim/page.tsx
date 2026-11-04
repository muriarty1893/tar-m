import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FlagIcon, NewspaperIcon, PlusIcon, StorefrontIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { listAllArticles } from "@/lib/news-data";
import { adminCounts } from "@/lib/services/admin";
import { formatTrDate } from "@/lib/format";

export const metadata: Metadata = { title: "Yönetim paneli", robots: { index: false } };

export default function AdminHome() {
  return (
    <AdminShell
      section="genel"
      title="Genel bakış"
      intro="Haberleri yazın ve yayınlayın, şikâyet edilen ilanları inceleyin."
      actions={
        <Link href="/yonetim/haberler/yeni" className={buttonVariants({ size: "lg" })}>
          <PlusIcon aria-hidden="true" weight="bold" />
          Yeni haber
        </Link>
      }
    >
      <Suspense fallback={<AdminSkeleton />}>
        <Overview />
      </Suspense>
    </AdminShell>
  );
}

async function Overview() {
  await requireAdmin("/yonetim");
  const counts = await adminCounts();
  const articles = (await listAllArticles()).slice(0, 5);
  const stats = [
    { label: "Yayındaki haber", value: counts.published, href: "/yonetim/haberler", Icon: NewspaperIcon },
    { label: "Taslak", value: counts.drafts, href: "/yonetim/haberler", Icon: NewspaperIcon },
    { label: "Şikâyet edilen ilan", value: counts.reports, href: "/yonetim/sikayetler", Icon: FlagIcon },
    { label: "Yayındaki ilan", value: counts.listings, href: "/pazar", Icon: StorefrontIcon },
    { label: "Kayıtlı kullanıcı", value: counts.people, Icon: UsersIcon },
  ];

  return (
    <div className="space-y-12">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, href, Icon }) => {
          const inner = (
            <>
              <Icon aria-hidden="true" weight="duotone" className="size-7 text-primary" />
              <span className="mt-3 block text-4xl font-bold tracking-tight tabular-nums">{Number(value).toLocaleString("tr-TR")}</span>
              <span className="mt-1 block text-muted-foreground">{label}</span>
            </>
          );
          return (
            <li key={label}>
              {href ? (
                <Link href={href} className="block h-full rounded-2xl border border-border p-5 transition-colors hover:border-primary/40 hover:bg-secondary">
                  {inner}
                </Link>
              ) : (
                <div className="h-full rounded-2xl border border-border p-5">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="son-haberler">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="son-haberler" className="text-2xl font-bold tracking-tight">
            Son haberler
          </h2>
          <Link href="/yonetim/haberler" className="font-semibold text-primary underline-offset-4 hover:underline">
            Tüm haberler
          </Link>
        </div>
        {articles.length ? (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {articles.map((a) => (
              <li key={a.id}>
                <Link href={`/yonetim/haberler/${a.id}`} className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-secondary">
                  <span className="min-w-0 flex-1 truncate font-semibold">{a.title}</span>
                  <StatusBadge status={a.status} />
                  <span className="text-sm text-muted-foreground">{formatTrDate(a.date)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-muted-foreground">Henüz haber yok.</p>
        )}
      </section>
    </div>
  );
}
