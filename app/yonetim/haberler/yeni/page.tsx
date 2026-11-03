import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { requireAdmin } from "@/lib/auth";
import { requestNow } from "@/lib/now";
import { trDayKey } from "@/lib/tr-time";

export const metadata: Metadata = { title: "Yeni haber · Yönetim", robots: { index: false } };

export default function NewArticlePage() {
  return (
    <AdminShell section="haberler" title="Yeni haber">
      <Suspense fallback={<AdminSkeleton />}>
        <NewArticle />
      </Suspense>
    </AdminShell>
  );
}

async function NewArticle() {
  await requireAdmin("/yonetim/haberler/yeni");
  const today = trDayKey(await requestNow());
  return <ArticleEditor initial={{ title: "", slug: "", summary: "", body: "", cover: "", date: today, status: "draft" }} />;
}
