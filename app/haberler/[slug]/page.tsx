import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminNewsLink } from "@/components/admin/AdminNewsLink";
import { kindLabel, shareImage } from "@/lib/news";
import { getPublished, listPublished } from "@/lib/news-data";
import { formatTrDate } from "@/lib/format";
import { KIND_TONE } from "@/components/NewsCard";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowSquareOutIcon, CalendarBlankIcon } from "@phosphor-icons/react/dist/ssr";

// Cache Components rejects an empty list, so a site with no articles yet still builds; the
// placeholder slug simply resolves to notFound(). Articles published later render on first visit.
const PLACEHOLDER = "henuz-haber-yok";

export async function generateStaticParams() {
  const articles = await listPublished();
  return articles.length ? articles.map((a) => ({ slug: a.slug })) : [{ slug: PLACEHOLDER }];
}

export async function generateMetadata({ params }: PageProps<"/haberler/[slug]">): Promise<Metadata> {
  const article = await getPublished((await params).slug);
  if (!article) return { title: "Haber bulunamadı" };
  // A page-level openGraph object replaces the root one entirely, so repeat the shared fields
  // and fall back to the site share image when the article has no cover (WhatsApp previews).
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      locale: "tr_TR",
      url: `/haberler/${article.slug}`,
      title: article.title,
      description: article.summary,
      publishedTime: article.date,
      images: [shareImage(article.cover)],
    },
  };
}

export default function ArticlePage({ params }: PageProps<"/haberler/[slug]">) {
  // Articles known at build time prerender in full; one published later streams into the placeholder.
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticleBody params={params} />
    </Suspense>
  );
}

function ArticleSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-3xl space-y-6 px-3 py-3 sm:px-4 sm:py-6">
      <div className="h-12 w-3/4 rounded-xl bg-muted motion-safe:animate-pulse" />
      <div className="h-6 w-40 rounded-lg bg-muted" />
      <div className="aspect-[16/9] rounded-lg bg-muted" />
    </div>
  );
}

async function ArticleBody({ params }: { params: PageProps<"/haberler/[slug]">["params"] }) {
  const article = await getPublished((await params).slug);
  if (!article) notFound();

  return (
    <article>
      <header className="border-b border-border bg-surface px-4 pb-4 pt-2 sm:pb-6 sm:pt-4">
        <div className="mx-auto max-w-3xl">
          <Link href="/haberler" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline">
            <ArrowLeftIcon aria-hidden="true" weight="bold" />
            Tüm haberler
          </Link>
          <p className="flex items-center gap-2 text-[12px]">
            <span className={`rounded px-1.5 font-semibold leading-5 ${KIND_TONE[article.kind]}`}>{kindLabel(article.kind)}</span>
            <time dateTime={article.date} className="flex items-center gap-1 font-borsa-mono text-muted-foreground">
              <CalendarBlankIcon aria-hidden="true" weight="regular" className="size-3.5" />
              {formatTrDate(article.date)}
            </time>
            {article.source && <span className="text-muted-foreground">· Kaynak: {article.source.name}</span>}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">{article.title}</h1>
          <Suspense>
            <div className="mt-3 empty:hidden">
              <AdminNewsLink slug={article.slug} />
            </div>
          </Suspense>
        </div>
      </header>
      <div className="mx-auto max-w-3xl py-3 sm:px-4 sm:py-6">
        <div className="overflow-hidden border-y border-border bg-card sm:rounded-md sm:border-x">
          {article.cover && (
            <div className="relative aspect-[16/9] border-b border-border">
              <Image src={article.cover} alt="" fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
            </div>
          )}
          {article.source && <p className="p-4 pb-0 text-lg leading-relaxed sm:p-6 sm:pb-0">{article.summary}</p>}
          {article.html && <div className="prose-article space-y-4 p-4 leading-relaxed sm:p-6" dangerouslySetInnerHTML={{ __html: article.html }} />}
          {article.source && (
            <div className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/40 p-3 sm:m-6">
              <p className="text-sm text-muted-foreground">
                Bu haber <span className="font-semibold text-foreground">{article.source.name}</span> sitesinden özetlendi. Ayrıntılar ve ekler kaynağın sayfasında.
              </p>
              <a href={article.source.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "sm" })}>
                Haberin tamamı
                <ArrowSquareOutIcon aria-hidden="true" weight="bold" />
                <span className="sr-only"> ({article.source.name}, yeni sekmede açılır)</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
