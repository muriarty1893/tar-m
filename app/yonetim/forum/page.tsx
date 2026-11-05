import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { ForumCategoryManager } from "@/components/admin/ForumCategoryManager";
import { requireAdmin } from "@/lib/auth";
import { categoryStats, forumCategories } from "@/lib/forum-categories";

export const metadata: Metadata = { title: "Forum kategorileri · Yönetim", robots: { index: false } };

export default function ForumCategoriesPage() {
  return (
    <AdminShell
      section="forum"
      title="Forum kategorileri"
      intro="Ana bölümleri ve altlarındaki kategorileri burada ekleyin, adlandırın ve sıralayın. Konu açan herkes bu listeden seçer."
    >
      <Suspense fallback={<AdminSkeleton />}>
        <Manager />
      </Suspense>
    </AdminShell>
  );
}

async function Manager() {
  await requireAdmin("/yonetim/forum");
  const [cats, stats] = await Promise.all([forumCategories(), categoryStats()]);
  const counts = Object.fromEntries(Object.entries(stats).map(([id, s]) => [id, s.topics]));
  return <ForumCategoryManager cats={cats} counts={counts} />;
}
