import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getAllArticles } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Haberler",
  description: `Tarım dünyasından haberler, öneriler ve ${siteConfig.name} duyuruları.`,
};

export default async function NewsPage() {
  const articles = await getAllArticles();

  return (
    <>
      <PageHero
        title="Haberler"
        intro={<>Tarım dünyasından haberler, mevsimlik öneriler ve {siteConfig.name} duyuruları.</>}
      />
      <section className="mx-auto max-w-6xl px-4 py-14">
        {articles.length === 0 ? (
          <p className="text-lg">Henüz haber yok.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <NewsCard key={a.slug} article={a} headingLevel={2} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
