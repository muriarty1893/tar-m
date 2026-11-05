import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircleIcon, NotePencilIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { ForumFeed } from "@/components/forum/ForumFeed";
import { ForumSearch, Sections, box, boxHeader } from "@/components/forum/ForumSections";
import { buttonVariants } from "@/components/ui/button";
import { getUserId, signInHref } from "@/lib/auth";
import { categoryName, parseForumQuery } from "@/lib/forum";
import { categoryStats, forumCategories } from "@/lib/forum-categories";
import { listTopics } from "@/lib/forum-data";
import { requestNow } from "@/lib/now";

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
      <div className="mx-auto max-w-4xl py-4 sm:px-4 sm:py-8">
        <Suspense fallback={<ForumSkeleton />}>
          <Forum searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

function OpenTopicLink({ href }: { href: string }) {
  return (
    <Link href={href} className={buttonVariants({ className: "max-sm:w-full" })}>
      <NotePencilIcon aria-hidden="true" weight="bold" />
      Konu aç
    </Link>
  );
}

async function OpenTopicButton() {
  const userId = await getUserId();
  return <OpenTopicLink href={userId ? "/forum/yeni" : signInHref("/forum/yeni")} />;
}


async function Forum({ searchParams }: { searchParams: PageProps<"/forum">["searchParams"] }) {
  const sp = await searchParams;
  const query = parseForumQuery(sp);
  const searching = Boolean(query.q) || query.kategori !== "tumu";
  const [cats, now] = await Promise.all([forumCategories(), requestNow()]);

  if (searching) {
    const first = await listTopics(query);
    const title = query.q ? `“${query.q}” için sonuçlar` : categoryName(cats, query.kategori);
    return (
      <div className="space-y-5">
        <ForumSearch q={query.q} />
        <section aria-labelledby="sonuclar" className={box}>
          <h2 id="sonuclar" className={boxHeader}>
            <span className="truncate">{title}</span>
            <span className="shrink-0 font-semibold opacity-80">{first.total.toLocaleString("tr-TR")} konu</span>
          </h2>
          <ForumFeed
            initial={first}
            sort={query.sirala}
            q={query.q}
            kategori={query.kategori === "tumu" ? "" : query.kategori}
            cats={cats}
            now={now.toISOString()}
            tabs
            emptyText="Bu aramayla konu bulunamadı. Başka kelimeler deneyin ya da yeni bir konu açın."
          />
        </section>
        <p className="px-3 sm:px-0">
          <Link href="/forum" className="font-semibold text-primary underline-offset-4 hover:underline">
            Forumun ana sayfasına dön
          </Link>
        </p>
      </div>
    );
  }

  const [stats, latest] = await Promise.all([categoryStats(), listTopics(query)]);
  return (
    <div className="space-y-5">
      {sp.silindi === "1" && (
        <p role="status" className="mx-3 flex items-center gap-2 rounded-xl border border-primary/30 bg-secondary px-4 py-3 font-semibold sm:mx-0">
          <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 text-primary" />
          Konu silindi.
        </p>
      )}
      <ForumSearch />
      <Sections cats={cats} stats={stats} now={now} />
      <section aria-labelledby="son-konular" className={box}>
        <h2 id="son-konular" className={boxHeader}>
          Konular
        </h2>
        <ForumFeed initial={latest} cats={cats} now={now.toISOString()} tabs />
      </section>
    </div>
  );
}

function ForumSkeleton() {
  return (
    <div className="space-y-4 px-3 sm:px-0" aria-hidden="true">
      <div className="h-12 animate-pulse rounded-xl bg-muted" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
