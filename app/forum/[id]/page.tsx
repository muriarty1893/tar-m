import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowBendDownRightIcon, CaretRightIcon, ChatsTeardropIcon, CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/market/Avatar";
import { CountView } from "@/components/forum/CountView";
import { CategoryChip, repliesLabel } from "@/components/forum/parts";
import { ForumText } from "@/components/forum/ForumText";
import { PhotoGrid } from "@/components/forum/PhotoGrid";
import { PostBar } from "@/components/forum/PostBar";
import { ReplyForm } from "@/components/forum/ReplyForm";
import { getUserId, isAdmin, signInHref } from "@/lib/auth";
import { categoryHref, threadReplies, type ForumCats } from "@/lib/forum";
import { forumCategories } from "@/lib/forum-categories";
import { getTopic, type ForumReply, type TopicDetail } from "@/lib/forum-data";
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
    <div className="mx-auto max-w-3xl pb-8 pt-2 sm:px-4 sm:pt-6">
      <Suspense fallback={<div aria-hidden="true" className="mt-6 h-96 bg-muted motion-safe:animate-pulse sm:rounded-xl" />}>
        <Topic params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** "Ahmet Yılmaz @ahmet", the name linking to their forum page. */
function Author({ name, handle, mine, size = "base" }: { name: string; handle: string | null; mine: boolean; size?: "base" | "lg" }) {
  const label = mine ? `${name} (siz)` : name;
  return (
    <span className={`flex flex-wrap items-baseline gap-x-1.5 ${size === "lg" ? "text-base" : ""}`}>
      {handle ? (
        <Link href={`/forum/kisi/${handle}`} className="font-semibold underline-offset-4 hover:underline">
          {label}
        </Link>
      ) : (
        <span className="font-semibold">{label}</span>
      )}
      {handle && <span className="text-sm text-muted-foreground">@{handle}</span>}
    </span>
  );
}

async function Topic({ params, searchParams }: { params: PageProps<"/forum/[id]">["params"]; searchParams: PageProps<"/forum/[id]">["searchParams"] }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const userId = await getUserId();
  const topic = await getTopic(id, userId);
  if (!topic) notFound();
  const [admin, now, cats] = await Promise.all([isAdmin(userId), requestNow(), forumCategories()]);
  const signIn = userId ? null : signInHref(`/forum/${topic.id}`);
  const thread = threadReplies(topic.replies);
  const answered = new Set(topic.replies.map((r) => r.parentId).filter(Boolean));
  const shown = topic.replies.filter((r) => !r.deleted).length;

  return (
    <article className="space-y-6">
      <CountView topicId={topic.id} />
      <Breadcrumb cats={cats} category={topic.category} />
      {(sp.yeni === "1" || sp.kaydedildi === "1") && (
        <p role="status" className="mx-3 flex items-center gap-2 rounded-xl border border-primary/30 bg-secondary px-4 py-3 font-semibold sm:mx-0">
          <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 shrink-0 text-primary" />
          {sp.yeni === "1" ? "Konunuz yayında. Yanıtlar geldikçe burada görünecek." : "Değişiklikler kaydedildi."}
        </p>
      )}

      <header className="space-y-4 border-y border-border bg-card p-4 sm:rounded-xl sm:border-x sm:p-6">
        <CategoryChip cats={cats} category={topic.category} />
        <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-4xl">{topic.title}</h1>
        <div className="flex items-center gap-3">
          <Avatar id={topic.authorId} name={topic.authorName} size={44} />
          <div>
            <Author name={topic.authorName} handle={topic.authorHandle} mine={topic.mine} size="lg" />
            <p className="text-sm text-muted-foreground">
              {agoLabel(new Date(topic.createdAt), now)}
              {topic.editedAt && <> · düzenlendi</>} · {topic.viewCount.toLocaleString("tr-TR")} görüntülenme
            </p>
          </div>
        </div>
        <ForumText text={topic.body} className="text-lg leading-relaxed" />
        <PhotoGrid photos={topic.photos} label="Konunun fotoğrafları" />
        <PostBar
          topicId={topic.id}
          liked={topic.liked}
          likeCount={topic.likeCount}
          canDelete={topic.mine || admin}
          canEdit={topic.mine || admin}
          canReport={Boolean(userId) && !topic.mine}
          reported={topic.reported}
          hasReplies={topic.replyCount > 0}
          signInHref={signIn}
        />
      </header>

      <section aria-labelledby="yanitlar" className="space-y-4 px-3 sm:px-0">
        <h2 id="yanitlar" className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <ChatsTeardropIcon aria-hidden="true" weight="duotone" className="size-7 text-primary" />
          {repliesLabel(shown)}
        </h2>
        {thread.length === 0 ? (
          <p className="text-muted-foreground">Henüz yanıt yok. İlk yanıtı siz yazın.</p>
        ) : (
          <ol className="space-y-3">
            {thread.map(({ reply, children }) => (
              <li key={reply.id} className="rounded-xl border border-border bg-card p-3.5 sm:p-4">
                <Reply reply={reply} topic={topic} userId={userId} admin={admin} now={now} signIn={signIn} answered={answered.has(reply.id)} />
                {children.length > 0 && (
                  <ol aria-label="Bu yanıta gelen yanıtlar" className="mt-3 space-y-3 border-l-2 border-border pl-3 sm:ml-5 sm:pl-4">
                    {children.map(({ reply: child, parent }) => (
                      <li key={child.id}>
                        <Reply reply={child} parent={parent} topic={topic} userId={userId} admin={admin} now={now} signIn={signIn} answered={answered.has(child.id)} />
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        )}
        <ReplyForm topicId={topic.id} signInHref={signIn} />
      </section>
    </article>
  );
}

function Reply({
  reply: r,
  parent,
  topic,
  userId,
  admin,
  now,
  signIn,
  answered,
}: {
  reply: ForumReply;
  parent?: ForumReply;
  topic: TopicDetail;
  userId: string | null;
  admin: boolean;
  now: Date;
  signIn: string | null;
  answered: boolean;
}) {
  if (r.deleted) {
    return (
      <div id={`yanit-${r.id}`} className="scroll-mt-24 rounded-xl bg-muted/60 px-3 py-2.5 text-muted-foreground">
        Bu yanıt silindi.
      </div>
    );
  }
  return (
    <div id={`yanit-${r.id}`} className="scroll-mt-24">
      {parent && (
        <p className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowBendDownRightIcon aria-hidden="true" weight="bold" className="size-4" />
          {parent.deleted ? "Silinen bir yanıta yanıt" : <>{parent.authorHandle ? <Link href={`/forum/kisi/${parent.authorHandle}`} className="font-semibold text-primary underline-offset-4 hover:underline">@{parent.authorHandle}</Link> : parent.authorName} kişisine yanıt</>}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Avatar id={r.authorId} name={r.authorName} size={36} />
        <div className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <Author name={r.authorName} handle={r.authorHandle} mine={r.mine} />
            {r.authorId === topic.authorId && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-primary">Konuyu açan</span>}
          </span>
        </div>
        <span className="shrink-0 text-sm text-muted-foreground">
          {agoLabel(new Date(r.createdAt), now)}
          {r.editedAt && <span className="block text-right text-xs">düzenlendi</span>}
        </span>
      </div>
      {r.body && <ForumText text={r.body} className="mt-2 leading-relaxed" />}
      {r.photos.length > 0 && (
        <div className="mt-2">
          <PhotoGrid photos={r.photos} label={`${r.authorName} kişisinin yanıtındaki fotoğraflar`} />
        </div>
      )}
      <PostBar
        topicId={topic.id}
        reply={{ id: r.id, name: r.authorName, handle: r.authorHandle }}
        liked={r.liked}
        likeCount={r.likeCount}
        canDelete={r.mine || admin}
        canEdit={r.mine || admin}
        body={r.body}
        canReport={Boolean(userId) && !r.mine}
        reported={r.reported}
        hasReplies={answered}
        signInHref={signIn}
      />
    </div>
  );
}

/** Forum › Bitkisel üretim › Buğday */
function Breadcrumb({ cats, category }: { cats: ForumCats; category: string }) {
  const c = cats.byId[category];
  const parent = c?.parentId ? cats.byId[c.parentId] : null;
  const steps = [parent, c].filter((x): x is NonNullable<typeof x> => Boolean(x));
  return (
    <nav aria-label="Konum" className="px-3 text-sm sm:px-0">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/forum" className="inline-flex min-h-9 items-center font-semibold text-primary underline-offset-4 hover:underline">
            Forum
          </Link>
        </li>
        {steps.map((step) => (
          <li key={step.id} className="flex items-center gap-1">
            <CaretRightIcon aria-hidden="true" weight="bold" className="size-3 text-muted-foreground" />
            <Link href={categoryHref(step.id)} className="inline-flex min-h-9 items-center font-semibold text-primary underline-offset-4 hover:underline">
              {step.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
