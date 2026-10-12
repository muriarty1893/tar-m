import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, CalendarBlankIcon, NewspaperIcon } from "@phosphor-icons/react/dist/ssr";
import type { Article } from "@/lib/news";
import { formatTrDate } from "@/lib/format";

export function NewsCard({ article, headingLevel = 3 }: { article: Article; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-soft transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
        {article.cover?.startsWith("/") ? (
          <Image
            src={article.cover}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0">
            <div className="dot-texture absolute inset-0" />
            <div className="blob absolute -right-8 -top-10 size-40 bg-blob" />
            <div className="blob-alt absolute -bottom-12 left-6 size-32 bg-gold-soft" />
            <NewspaperIcon weight="duotone" className="absolute left-6 top-6 size-10 text-primary" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <time dateTime={article.date} className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarBlankIcon aria-hidden="true" weight="duotone" className="size-4" />
          {formatTrDate(article.date)}
        </time>
        <Heading className="text-xl font-bold leading-snug">
          <Link href={`/haberler/${article.slug}`} className="after:absolute after:inset-0 group-hover:text-primary">
            {article.title}
          </Link>
        </Heading>
        <p className="text-muted-foreground">{article.summary}</p>
        <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1.5 pt-2 font-semibold text-primary">
          Devamını oku
          <ArrowRightIcon weight="bold" className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
