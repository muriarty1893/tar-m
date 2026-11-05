import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { TopicForm } from "@/components/forum/TopicForm";
import { requireProfile } from "@/lib/auth";
import { forumCategories } from "@/lib/forum-categories";

export const metadata: Metadata = { title: "Konu aç · Forum", robots: { index: false } };

export default function NewTopicPage({ searchParams }: PageProps<"/forum/yeni">) {
  return (
    <>
      <ToolHeader eyebrow="Forum" title="Konu aç" intro="Kategorisini seçin, başlığını ve açıklamasını yazın; diğer çiftçiler yanıtlasın. Adınız konunun altında görünür." />
      <div className="mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-10">
        <Suspense fallback={<div aria-hidden="true" className="h-96 rounded-xl bg-muted motion-safe:animate-pulse" />}>
          <NewTopic searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function NewTopic({ searchParams }: { searchParams: PageProps<"/forum/yeni">["searchParams"] }) {
  const sp = await searchParams;
  const kategori = typeof sp.kategori === "string" ? sp.kategori : "";
  await requireProfile(kategori ? `/forum/yeni?kategori=${encodeURIComponent(kategori)}` : "/forum/yeni");
  const cats = await forumCategories();
  return <TopicForm cats={cats} initial={{ category: kategori in cats.byId ? kategori : "", title: "", body: "", photos: [] }} />;
}
