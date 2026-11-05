import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { TopicForm } from "@/components/forum/TopicForm";
import { isAdmin, requireProfile } from "@/lib/auth";
import { forumCategories } from "@/lib/forum-categories";
import { getTopic } from "@/lib/forum-data";

export const metadata: Metadata = { title: "Konuyu düzenle · Forum", robots: { index: false } };

export default function EditTopicPage({ params }: PageProps<"/forum/[id]/duzenle">) {
  return (
    <>
      <ToolHeader eyebrow="Forum" title="Konuyu düzenle" />
      <div className="mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-10">
        <Suspense fallback={<div aria-hidden="true" className="h-96 rounded-xl bg-muted motion-safe:animate-pulse" />}>
          <EditTopic params={params} />
        </Suspense>
      </div>
    </>
  );
}

/** Its author, or an admin (who may also move it to another category). */
async function EditTopic({ params }: { params: PageProps<"/forum/[id]/duzenle">["params"] }) {
  const { id } = await params;
  const profile = await requireProfile(`/forum/${id}/duzenle`);
  const topic = await getTopic(id, profile.userId);
  if (!topic) notFound();
  const admin = await isAdmin(profile.userId);
  if (!topic.mine && !admin) notFound();
  const cats = await forumCategories();
  return (
    <>
      {!topic.mine && (
        <p className="mb-5 rounded-xl bg-gold-soft px-4 py-3 font-semibold text-gold ring-1 ring-gold/30">
          Yönetici olarak {topic.authorName} kişisinin konusunu düzenliyorsunuz.
        </p>
      )}
      <TopicForm cats={cats} topicId={topic.id} initial={{ category: topic.category, title: topic.title, body: topic.body, photos: topic.photos }} />
    </>
  );
}
