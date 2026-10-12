import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllArticles, getArticle } from "@/lib/news";
import { formatTrDate } from "@/lib/format";
import { siteConfig } from "@/config/site";

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
      images: [article.cover ?? { url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/haberler/[slug]">) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/haberler" className="text-primary underline">
        ← Tüm haberler
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold leading-tight sm:text-4xl">{article.title}</h1>
      <time dateTime={article.date} className="mt-3 block text-muted">
        {formatTrDate(article.date)}
      </time>
      {article.cover?.startsWith("/") && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={article.cover} alt="" fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
        </div>
      )}
      <div
        className="prose-article mt-8 space-y-4 text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />
    </article>
  );
}
