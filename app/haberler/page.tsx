import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminNewsLink } from "@/components/admin/AdminNewsLink";
import { siteConfig } from "@/config/site";
import { listPublished } from "@/lib/news-data";
import { NewsCard } from "@/components/NewsCard";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Destek ve haberler",
  description: `Çiftçi destekleri, tarım dünyasından haberler ve ${siteConfig.name} duyuruları.`,
};

export default async function NewsPage() {
  const articles = await listPublished();

  return (
    <>
      <PageHero
        title="Destek ve haberler"
        intro={<>Çiftçi destekleri, tarım dünyasından haberler ve {siteConfig.name} duyuruları.</>}
      />
      <section className="mx-auto max-w-4xl py-3 sm:px-4 sm:py-6">
        <Suspense>
          <div className="mb-3 px-3 empty:hidden sm:px-0">
            <AdminNewsLink />
          </div>
        </Suspense>
        {articles.length === 0 ? (
          <p className="px-4 sm:px-0">Henüz haber yok.</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden border-y border-border bg-card sm:rounded-md sm:border-x">
            {articles.map((a) => (
              <li key={a.slug}>
                <NewsCard article={a} headingLevel={2} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
