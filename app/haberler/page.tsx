import type { Metadata } from "next";
import { getAllArticles } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";

export const metadata: Metadata = {
  title: "Haberler",
  description: "Tarım dünyasından haberler, öneriler ve Bereket AI duyuruları.",
};

export default async function NewsPage() {
  const articles = await getAllArticles();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-extrabold">Haberler</h1>
      <p className="mt-3 text-lg text-muted">
        Tarım dünyasından haberler, mevsimlik öneriler ve Bereket AI duyuruları.
      </p>

      {articles.length === 0 ? (
        <p className="mt-10 text-lg">Henüz haber yok.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <NewsCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </section>
  );
}
