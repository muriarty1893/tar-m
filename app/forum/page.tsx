import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChatsTeardropIcon, CheckCircleIcon, ListIcon, MagnifyingGlassIcon, NotePencilIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { Avatar } from "@/components/market/Avatar";
import { CategoryChip, repliesLabel } from "@/components/forum/parts";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUserId, signInHref } from "@/lib/auth";
import { FORUM_CATEGORIES, FORUM_PAGE_SIZE, FORUM_SORTS, forumHref, parseForumQuery, type ForumQuery } from "@/lib/forum";
import { listTopics } from "@/lib/forum-data";
import { requestNow } from "@/lib/now";
import { agoLabel } from "@/lib/tr-time";

export const metadata: Metadata = {
  title: "Forum",
  description: "Çiftçilerin forumu: ekim, hayvancılık, makine, destekler ve fiyatlar üzerine sorun, deneyiminizi paylaşın.",
};

export default function ForumPage({ searchParams }: PageProps<"/forum">) {
  return (
    <>
      <ToolHeader
        eyebrow="Topluluk"
        title="Forum"
        intro="Çiftçilere sorun, deneyiminizi paylaşın. Okumak için hesap gerekmez; konu açmak ve yanıt yazmak için ücretsiz hesap yeter."
        actions={
          <Suspense fallback={<OpenTopicLink href="/forum/yeni" />}>
            <OpenTopicButton />
          </Suspense>
        }
      />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Suspense fallback={<ForumSkeleton />}>
          <Topics searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

function OpenTopicLink({ href }: { href: string }) {
  return (
    <Link href={href} className={buttonVariants({ size: "lg", className: "bg-emerald-950 hover:bg-emerald-900" })}>
      <NotePencilIcon aria-hidden="true" weight="bold" />
      Konu aç
    </Link>
  );
}

async function OpenTopicButton() {
  const userId = await getUserId();
  return <OpenTopicLink href={userId ? "/forum/yeni" : signInHref("/forum/yeni")} />;
}

async function Topics({ searchParams }: { searchParams: PageProps<"/forum">["searchParams"] }) {
  const sp = await searchParams;
  const query = parseForumQuery(sp);
  const { items, total } = await listTopics(query);
  const now = await requestNow();
  const pages = Math.max(1, Math.ceil(total / FORUM_PAGE_SIZE));
  const sortLabel = FORUM_SORTS.find((s) => s.id === query.sirala)?.label ?? "Son açılan";

  return (
    <div className="space-y-6">
      {sp.silindi === "1" && (
        <p role="status" className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-secondary px-4 py-3 font-semibold">
          <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 text-primary" />
          Konu silindi.
        </p>
      )}

      <form role="search" aria-label="Forumda ara" action="/forum" className="flex gap-2">
        {query.kategori !== "tumu" && <input type="hidden" name="kategori" value={query.kategori} />}
        {query.sirala !== "yeni" && <input type="hidden" name="sirala" value={query.sirala} />}
        <label htmlFor="forum-ara" className="sr-only">
          Forumda ara
        </label>
        <Input id="forum-ara" name="q" defaultValue={query.q} placeholder="Buğday tohumu, süt verimi, mazot desteği…" className="min-h-12 flex-1" />
        <button type="submit" className={buttonVariants({ variant: "outline", size: "lg" })}>
          <MagnifyingGlassIcon aria-hidden="true" weight="bold" />
          Ara
        </button>
      </form>

      <nav aria-label="Konu türleri">
        <ul className="flex flex-wrap gap-2">
          {[{ id: "tumu" as const, label: "Tümü" }, ...FORUM_CATEGORIES].map((c) => (
            <li key={c.id}>
              <Link
                href={forumHref(query, { kategori: c.id })}
                aria-current={query.kategori === c.id ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded-full bg-secondary px-4 font-semibold text-secondary-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_8%)] aria-[current=page]:bg-foreground aria-[current=page]:text-background"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="konular" className="overflow-hidden rounded-2xl border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-700 px-4 py-3 text-white">
          <h2 id="konular" className="flex items-center gap-2 text-lg font-bold">
            <ListIcon aria-hidden="true" weight="bold" className="size-5" />
            {sortLabel}
          </h2>
          <nav aria-label="Sıralama" className="flex flex-wrap gap-1">
            {FORUM_SORTS.map((s) => (
              <Link
                key={s.id}
                href={forumHref(query, { sirala: s.id })}
                aria-current={query.sirala === s.id ? "page" : undefined}
                className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-white/85 hover:bg-white/10 aria-[current=page]:bg-white aria-[current=page]:text-slate-900"
              >
                {s.label}
              </Link>
            ))}
          </nav>
        </div>
        {items.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <ul className="divide-y divide-border bg-card">
            {items.map((t) => (
              <li key={t.id}>
                <Link href={`/forum/${t.id}`} className="flex gap-3 px-4 py-4 transition-colors hover:bg-secondary focus-visible:outline-offset-[-3px]">
                  <Avatar id={t.authorId} name={t.authorName} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold leading-snug">{t.title}</span>
                    <span className="mt-1 line-clamp-2 block text-muted-foreground">{t.excerpt}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <CategoryChip category={t.category} />
                      <span>{t.authorName}</span>
                      <span>{agoLabel(new Date(t.createdAt), now)}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <ChatsTeardropIcon aria-hidden="true" weight="duotone" className="size-4 text-primary" />
                        {repliesLabel(t.replyCount)}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pages > 1 && (
        <nav aria-label="Sayfalar" className="flex items-center justify-between gap-3">
          {query.sayfa > 1 ? (
            <Link href={forumHref(query, { sayfa: query.sayfa - 1 })} className={buttonVariants({ variant: "outline" })}>
              Önceki sayfa
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Sayfa {query.sayfa} / {pages}
          </span>
          {query.sayfa < pages ? (
            <Link href={forumHref(query, { sayfa: query.sayfa + 1 })} className={buttonVariants({ variant: "outline" })}>
              Sonraki sayfa
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

function EmptyState({ query }: { query: ForumQuery }) {
  const filtered = Boolean(query.q) || query.kategori !== "tumu";
  return (
    <div className="bg-card px-6 py-12 text-center">
      <ChatsTeardropIcon aria-hidden="true" weight="duotone" className="mx-auto size-12 text-primary" />
      <p className="mx-auto mt-3 max-w-md text-lg">{filtered ? "Bu aramayla konu bulunamadı. Başka kelimeler deneyin ya da yeni bir konu açın." : "Henüz konu yok. İlk soruyu siz sorun!"}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {filtered && (
          <Link href="/forum" className={buttonVariants({ variant: "outline" })}>
            Filtreleri temizle
          </Link>
        )}
        <Link href="/forum/yeni" className={buttonVariants({})}>
          Konu aç
        </Link>
      </div>
    </div>
  );
}

function ForumSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="h-12 animate-pulse rounded-2xl bg-muted" />
      <div className="h-11 w-2/3 animate-pulse rounded-full bg-muted" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
