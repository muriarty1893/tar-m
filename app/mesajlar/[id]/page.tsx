import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChatThread } from "@/components/chat/ChatThread";
import { requireUserId } from "@/lib/auth";
import { getThread } from "@/lib/chat-data";

export const metadata: Metadata = { title: "Sohbet", robots: { index: false } };

export default function ConversationPage({ params }: PageProps<"/mesajlar/[id]">) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Suspense fallback={<div aria-hidden="true" className="h-[70vh] rounded-2xl bg-muted motion-safe:animate-pulse" />}>
        <Conversation params={params} />
      </Suspense>
    </div>
  );
}

async function Conversation({ params }: { params: PageProps<"/mesajlar/[id]">["params"] }) {
  const { id } = await params;
  const userId = await requireUserId(`/mesajlar/${id}`);
  const thread = await getThread(id, userId);
  if (!thread) notFound();
  return <ChatThread initial={thread} />;
}
