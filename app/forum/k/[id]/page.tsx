import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CaretRightIcon, NotePencilIcon } from "@phosphor-icons/react/dist/ssr";
import { ForumFeed } from "@/components/forum/ForumFeed";
import { box, boxHeader } from "@/components/forum/ForumSections";
import { sectionBar } from "@/components/forum/parts";
import { buttonVariants } from "@/components/ui/button";
import { getUserId, signInHref } from "@/lib/auth";
import { categoryHref, parseForumQuery } from "@/lib/forum";
import { categoryStats, forumCategories, sectionTotals } from "@/lib/forum-categories";
import { listTopics } from "@/lib/forum-data";
import { requestNow } from "@/lib/now";

export async function generateMetadata({ params }: PageProps<"/forum/k/[id]">): Promise<Metadata> {
  const { id } = await params;
  const cats = await forumCategories();
  const c = cats.byId[id];
  if (!c) return { title: "Kategori bulunamadı" };
  return { title: `${c.name} · Forum`, description: c.description || `${c.name}: çiftçilerin soruları ve deneyimleri.` };
}

export default function CategoryPage({ params, searchParams }: PageProps<"/forum/k/[id]">) {
  return (
    <div className="mx-auto max-w-4xl pb-8 sm:px-4 sm:pt-6">
      <Suspense fallback={<div aria-hidden="true" className="h-96 bg-muted motion-safe:animate-pulse sm:rounded-xl" />}>
        <Category params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Category({ params, searchParams }: Pick<PageProps<"/forum/k/[id]">, "params" | "searchParams">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const cats = await forumCategories();
  const cat = cats.byId[id];
  if (!cat) notFound();
  const section = cats.sections.find((s) => s.id === (cat.parentId ?? cat.id))!;
  const query = { ...parseForumQuery(sp), q: "", kategori: id, sayfa: 1 };
  const [first, stats, now, userId] = await Promise.all([listTopics(query), categoryStats(), requestNow(), getUserId()]);
  const total = cat.parentId ? (stats[id] ?? { topics: 0, replies: 0 }) : sectionTotals(section, stats);
  const newHref = `/forum/yeni?kategori=${id}`;

  return (
    <div className="space-y-4">
      <nav aria-label="Konum" className="px-3 pt-3 text-sm sm:px-0 sm:pt-0">
        <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
          <li>
            <Link href="/forum" className="inline-flex min-h-9 items-center font-semibold text-primary underline-offset-4 hover:underline">
              Forum
            </Link>
          </li>
          {cat.parentId && (
            <li className="flex items-center gap-1">
              <CaretRightIcon aria-hidden="true" weight="bold" className="size-3" />
              <Link href={categoryHref(section.id)} className="inline-flex min-h-9 items-center font-semibold text-primary underline-offset-4 hover:underline">
                {section.name}
              </Link>
            </li>
          )}
          <li className="flex items-center gap-1">
            <CaretRightIcon aria-hidden="true" weight="bold" className="size-3" />
            <span aria-current="page">{cat.name}</span>
          </li>
        </ol>
      </nav>

      <header className="flex gap-3 border-y border-border bg-card px-4 py-4 sm:rounded-xl sm:border-x">
        <span aria-hidden="true" className={`w-1.5 shrink-0 rounded-full ${sectionBar(section.id)}`} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{cat.name}</h1>
          {cat.description && <p className="mt-1 text-muted-foreground">{cat.description}</p>}
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            {total.topics.toLocaleString("tr-TR")} konu · {total.replies.toLocaleString("tr-TR")} yanıt
          </p>
          <Link href={userId ? newHref : signInHref(newHref)} className={buttonVariants({ className: "mt-3 max-sm:w-full" })}>
            <NotePencilIcon aria-hidden="true" weight="bold" />
            Bu kategoride konu aç
          </Link>
        </div>
      </header>

      {!cat.parentId && section.children.length > 0 && (
        <nav aria-label="Alt kategoriler" className="px-3 sm:px-0">
          <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {section.children.map((c) => (
              <li key={c.id} className="shrink-0">
                <Link href={categoryHref(c.id)} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-secondary">
                  {c.name}
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">{(stats[c.id]?.topics ?? 0).toLocaleString("tr-TR")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <section aria-labelledby="kategori-konulari" className={box}>
        <h2 id="kategori-konulari" className={boxHeader}>
          Konular
        </h2>
        <ForumFeed initial={first} sort={query.sirala} kategori={id} cats={cats} now={now.toISOString()} tabs emptyText="Bu kategoride henüz konu yok. İlk konuyu siz açın!" />
      </section>
    </div>
  );
}
