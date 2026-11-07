import Link from "next/link";
import Image from "next/image";
import { NewspaperIcon } from "@phosphor-icons/react/dist/ssr";
import { kindLabel, type ArticleSummary } from "@/lib/news";
import { formatTrDate } from "@/lib/format";

/** The label's colours: Destek green, Duyuru amber, Haber blue (as on the home page's strip). */
export const KIND_TONE = { destek: "bg-good-soft text-good", duyuru: "bg-amber-100 text-amber-900", haber: "bg-secondary text-primary" } as const;

/**
 * One article in the news list (Borsa): a small cover on the left, then the label (Destek, Haber,
 * Duyuru) and the date, the title and two lines of summary. The whole row opens the article.
 */
export function NewsCard({ article, headingLevel = 3 }: { article: ArticleSummary; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="relative flex gap-3 px-3 py-3 transition-colors hover:bg-muted/40 sm:px-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-secondary sm:h-20 sm:w-28">
        {article.cover ? (
          <Image src={article.cover} alt="" fill sizes="112px" className="object-cover" />
        ) : (
          <NewspaperIcon aria-hidden="true" weight="duotone" className="absolute inset-0 m-auto size-7 text-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[12px]">
          <span className={`rounded px-1.5 font-semibold leading-5 ${KIND_TONE[article.kind]}`}>{kindLabel(article.kind)}</span>
          <time dateTime={article.date} className="font-borsa-mono text-muted-foreground">
            {formatTrDate(article.date)}
          </time>
        </p>
        <Heading className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug">
          <Link href={`/haberler/${article.slug}`} className="after:absolute after:inset-0 hover:text-primary focus-visible:text-primary">
            {article.title}
          </Link>
        </Heading>
        <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">{article.summary}</p>
      </div>
    </article>
  );
}
