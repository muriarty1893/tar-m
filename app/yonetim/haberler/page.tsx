import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowSquareOutIcon, CheckCircleIcon, NewspaperIcon, PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { formatTrDate } from "@/lib/format";
import { listAllArticles } from "@/lib/news-data";

export const metadata: Metadata = { title: "Haberler · Yönetim", robots: { index: false } };

export default function AdminNewsPage({ searchParams }: PageProps<"/yonetim/haberler">) {
  return (
    <AdminShell
      section="haberler"
      title="Haberler"
      intro="Taslaklar yalnızca burada görünür; yayındaki haberler Haberler sayfasında ve ana sayfada."
      actions={
        <Link href="/yonetim/haberler/yeni" className={buttonVariants({ size: "lg" })}>
          <PlusIcon aria-hidden="true" weight="bold" />
          Yeni haber
        </Link>
      }
    >
      <Suspense fallback={<AdminSkeleton />}>
        <NewsList searchParams={searchParams} />
      </Suspense>
    </AdminShell>
  );
}

async function NewsList({ searchParams }: { searchParams: PageProps<"/yonetim/haberler">["searchParams"] }) {
  const sp = await searchParams;
  await requireAdmin("/yonetim/haberler");
  const articles = await listAllArticles();
  return (
    <div className="space-y-6">
      {sp.silindi === "1" && (
        <p role="status" className="flex items-center gap-2 rounded-lg border border-primary/30 bg-secondary px-4 py-3 font-semibold">
          <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 text-primary" />
          Haber silindi.
        </p>
      )}
      {articles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-input px-4 py-6 text-center">
          <NewspaperIcon aria-hidden="true" weight="duotone" className="mx-auto size-12 text-primary" />
          <p className="mt-3 text-lg">Henüz haber yok.</p>
          <Link href="/yonetim/haberler/yeni" className={buttonVariants({ className: "mt-6" })}>
            İlk haberi yazın
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {articles.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
              <span className="relative hidden size-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:block">
                {a.cover ? (
                  <Image src={a.cover} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <NewspaperIcon aria-hidden="true" weight="duotone" className="absolute inset-0 m-auto size-7 text-primary" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={a.status} />
                  <span className="text-sm text-muted-foreground">{formatTrDate(a.date)}</span>
                </p>
                <p className="mt-1 truncate text-lg font-semibold">{a.title}</p>
                <p className="truncate text-sm text-muted-foreground">/haberler/{a.slug}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href={`/yonetim/haberler/${a.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <PencilSimpleIcon aria-hidden="true" weight="bold" />
                  Düzenle
                </Link>
                {a.status === "published" && (
                  <Link href={`/haberler/${a.slug}`} target="_blank" aria-label={`${a.title}: sitede gör`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    <ArrowSquareOutIcon aria-hidden="true" weight="bold" />
                    Gör
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
