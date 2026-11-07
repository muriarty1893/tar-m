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
      intro="Haberleri yazın ve yayınlayın, şikâyet edilen ilanları ve forum yazılarını inceleyin."
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
    { label: "Şikâyet edilen forum yazısı", value: counts.forumReports, href: "/yonetim/sikayetler#forum", Icon: FlagIcon },
    { label: "Yayındaki ilan", value: counts.listings, href: "/pazar", Icon: StorefrontIcon },
    { label: "Kayıtlı kullanıcı", value: counts.people, Icon: UsersIcon },
  ];

  return (
    <div className="space-y-3 sm:space-y-6">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(({ label, value, href, Icon }) => {
          const inner = (
            <>
              <Icon aria-hidden="true" weight="fill" className="size-4 text-primary" />
              <span className="mt-1 block font-borsa-mono text-[26px] font-semibold leading-tight">{Number(value).toLocaleString("tr-TR")}</span>
              <span className="block text-[12.5px] leading-snug text-muted-foreground">{label}</span>
            </>
          );
          return (
            <li key={label}>
              {href ? (
                <Link href={href} className="block h-full rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-secondary">
                  {inner}
                </Link>
              ) : (
                <div className="h-full rounded-md border border-border bg-card p-3">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="son-haberler">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="son-haberler" className="text-lg font-bold">
            Son haberler
          </h2>
          <Link href="/yonetim/haberler" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Tüm haberler
          </Link>
        </div>
        {articles.length ? (
          <ul className="mt-2 divide-y divide-border overflow-hidden rounded-md border border-border bg-card text-[14px]">
            {articles.map((a) => (
              <li key={a.id}>
                <Link href={`/yonetim/haberler/${a.id}`} className="flex flex-wrap items-center gap-2.5 px-3 py-2.5 hover:bg-muted/50">
                  <span className="min-w-0 flex-1 truncate font-semibold">{a.title}</span>
                  <StatusBadge status={a.status} />
                  <span className="font-borsa-mono text-[12px] text-muted-foreground">{formatTrDate(a.date)}</span>
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
