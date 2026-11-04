import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { TopicForm } from "@/components/forum/TopicForm";
import { requireProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Konu aç · Forum", robots: { index: false } };

export default function NewTopicPage() {
  return (
    <>
      <ToolHeader eyebrow="Forum" title="Konu aç" intro="Sorunuzu ya da deneyiminizi yazın; diğer çiftçiler yanıtlasın. Adınız konunun altında görünür." />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Suspense fallback={<div aria-hidden="true" className="h-96 rounded-2xl bg-muted motion-safe:animate-pulse" />}>
          <NewTopic />
        </Suspense>
      </div>
    </>
  );
}

async function NewTopic() {
  await requireProfile("/forum/yeni");
  return <TopicForm />;
}
