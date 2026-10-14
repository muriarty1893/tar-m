import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllArticles, getArticle, shareImage } from "@/lib/news";
import { formatTrDate } from "@/lib/format";
import { siteConfig } from "@/config/site";
import { ArrowLeftIcon, CalendarBlankIcon } from "@phosphor-icons/react/dist/ssr";

// Cache Components rejects an empty list, so a site with no articles yet
// still builds; the placeholder slug simply resolves to notFound().
const PLACEHOLDER = "henuz-haber-yok";

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.length ? articles.map((a) => ({ slug: a.slug })) : [{ slug: PLACEHOLDER }];
}

export async function generateMetadata({ params }: PageProps<"/haberler/[slug]">): Promise<Metadata> {
  const article = await getArticle((await params).slug);
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

export default async function ArticlePage({ params }: PageProps<"/haberler/[slug]">) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();

  return (
    <article>
      <header className="relative border-b border-border bg-surface px-4 pb-12 pt-10 sm:pt-14">
        <div className="relative mx-auto max-w-3xl">
          <Link
            href="/haberler"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
          >
            <ArrowLeftIcon aria-hidden="true" weight="bold" />
            Tüm haberler
          </Link>
          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{article.title}</h1>
          <time dateTime={article.date} className="mt-5 flex items-center gap-1.5 text-muted-foreground">
            <CalendarBlankIcon aria-hidden="true" weight="duotone" className="size-5" />
            {formatTrDate(article.date)}
          </time>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-12">
        {article.cover?.startsWith("/") && (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl shadow-soft">
            <Image src={article.cover} alt="" fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
        )}
        <div className="prose-article space-y-5 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: article.html }} />
      </div>
    </article>
  );
}
