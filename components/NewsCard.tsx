import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/news";
import { formatTrDate } from "@/lib/format";

export function NewsCard({ article }: { article: Article }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/25 via-accent-soft to-accent/30">
        {article.cover?.startsWith("/") && (
          <Image
            src={article.cover}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <time dateTime={article.date} className="text-sm text-muted">
          {formatTrDate(article.date)}
        </time>
        <h3 className="text-xl font-bold leading-snug">
          <Link
            href={`/haberler/${article.slug}`}
            className="after:absolute after:inset-0 group-hover:text-primary"
          >
            {article.title}
          </Link>
        </h3>
        <p className="text-muted">{article.summary}</p>
      </div>
    </article>
  );
}
