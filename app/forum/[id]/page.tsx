import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon, ChatsTeardropIcon, CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/market/Avatar";
import { CategoryChip, repliesLabel } from "@/components/forum/parts";
import { PostActions } from "@/components/forum/PostActions";
import { ReplyForm } from "@/components/forum/ReplyForm";
import { getUserId, isAdmin, signInHref } from "@/lib/auth";
import { getTopic } from "@/lib/forum-data";
import { requestNow } from "@/lib/now";
import { agoLabel } from "@/lib/tr-time";

export async function generateMetadata({ params }: PageProps<"/forum/[id]">): Promise<Metadata> {
  const { id } = await params;
  const topic = await getTopic(id, null);
  if (!topic) return { title: "Konu bulunamadı" };
  return { title: `${topic.title} · Forum`, description: topic.excerpt };
}

export default function TopicPage({ params, searchParams }: PageProps<"/forum/[id]">) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/forum" className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline">
        <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-5" />
        Foruma dön
      </Link>
      <Suspense fallback={<div aria-hidden="true" className="mt-6 h-96 rounded-2xl bg-muted motion-safe:animate-pulse" />}>
        <Topic params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Topic({ params, searchParams }: { params: PageProps<"/forum/[id]">["params"]; searchParams: PageProps<"/forum/[id]">["searchParams"] }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const userId = await getUserId();
  const topic = await getTopic(id, userId);
  if (!topic) notFound();
  const admin = await isAdmin(userId);
  const now = await requestNow();

  return (
    <article className="mt-4 space-y-8">
      {sp.yeni === "1" && (
        <p role="status" className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-secondary px-4 py-3 font-semibold">
          <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 text-primary" />
          Konunuz yayında. Yanıtlar geldikçe burada görünecek.
        </p>
      )}

      <header className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <CategoryChip category={topic.category} />
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{topic.title}</h1>
        <div className="flex items-center gap-3">
          <Avatar id={topic.authorId} name={topic.authorName} size={44} />
          <div>
            <p className="font-semibold">{topic.mine ? `${topic.authorName} (siz)` : topic.authorName}</p>
            <p className="text-sm text-muted-foreground">{agoLabel(new Date(topic.createdAt), now)}</p>
          </div>
        </div>
        <div className="whitespace-pre-line text-lg leading-relaxed">{topic.body}</div>
        <PostActions topicId={topic.id} canDelete={topic.mine || admin} canReport={Boolean(userId) && !topic.mine} reported={topic.reported} hasReplies={topic.replyCount > 0} />
      </header>

      <section aria-labelledby="yanitlar" className="space-y-4">
        <h2 id="yanitlar" className="flex items-center gap-2 text-2xl font-bold">
          <ChatsTeardropIcon aria-hidden="true" weight="duotone" className="size-7 text-primary" />
          {repliesLabel(topic.replies.length)}
        </h2>
        {topic.replies.length === 0 ? (
          <p className="text-muted-foreground">Henüz yanıt yok. İlk yanıtı siz yazın.</p>
        ) : (
          <ol className="space-y-3">
            {topic.replies.map((r) => (
              <li key={r.id} id={`yanit-${r.id}`} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Avatar id={r.authorId} name={r.authorName} size={36} />
                  <p className="font-semibold">
                    {r.mine ? `${r.authorName} (siz)` : r.authorName}
                    {r.authorId === topic.authorId && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-primary">Konuyu açan</span>}
                  </p>
                  <span className="ml-auto text-sm text-muted-foreground">{agoLabel(new Date(r.createdAt), now)}</span>
                </div>
                <p className="mt-2 whitespace-pre-line leading-relaxed">{r.body}</p>
                <PostActions topicId={topic.id} replyId={r.id} canDelete={r.mine || admin} canReport={Boolean(userId) && !r.mine} reported={r.reported} />
              </li>
            ))}
          </ol>
        )}
        <ReplyForm topicId={topic.id} signInHref={userId ? null : signInHref(`/forum/${topic.id}`)} />
      </section>
    </article>
  );
}
