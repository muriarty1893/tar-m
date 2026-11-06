import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { requireAdmin } from "@/lib/auth";
import { getArticleById } from "@/lib/news-data";

export const metadata: Metadata = { title: "Haberi düzenle · Yönetim", robots: { index: false } };

export default function EditArticlePage({ params, searchParams }: PageProps<"/yonetim/haberler/[id]">) {
  return (
    <AdminShell section="haberler" title="Haberi düzenle">
      <Suspense fallback={<AdminSkeleton />}>
        <EditArticle params={params} searchParams={searchParams} />
      </Suspense>
    </AdminShell>
  );
}

async function EditArticle({ params, searchParams }: Pick<PageProps<"/yonetim/haberler/[id]">, "params" | "searchParams">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  await requireAdmin(`/yonetim/haberler/${id}`);
  const a = await getArticleById(id);
  if (!a) notFound();
  return (
    <ArticleEditor
      key={a.id}
      articleId={a.id}
      justSaved={sp.kaydedildi === "1"}
      initial={{ title: a.title, slug: a.slug, summary: a.summary, body: a.body, cover: a.cover ?? "", date: a.date, status: a.status, kind: a.kind }}
    />
  );
}
