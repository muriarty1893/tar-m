import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, CalendarBlankIcon, NewspaperIcon } from "@phosphor-icons/react/dist/ssr";
import type { Article } from "@/lib/news";
import { formatTrDate } from "@/lib/format";
import { CardContainer, CardItem } from "@/components/ui/3d-card";

/** News card on an Aceternity-style 3D tilt: the cover, title and link lift on hover. */
export function NewsCard({ article, headingLevel = 3 }: { article: Article; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <CardContainer>
      <article className="relative flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-3 shadow-soft transition-shadow duration-300 [transform-style:preserve-3d] group-hover/card3d:shadow-lift">
        <CardItem depth={50} className="relative aspect-[16/10] overflow-hidden rounded-[1.25rem] bg-secondary">
          {article.cover?.startsWith("/") ? (
            <Image src={article.cover} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
          ) : (
            <NewspaperIcon aria-hidden="true" weight="duotone" className="absolute left-5 top-5 size-10 text-primary" />
          )}
          <time
            dateTime={article.date}
            className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1 text-sm font-semibold text-foreground shadow-soft"
          >
            <CalendarBlankIcon aria-hidden="true" weight="duotone" className="size-4 text-primary" />
            {formatTrDate(article.date)}
          </time>
        </CardItem>
        <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-5 [transform-style:preserve-3d]">
          <CardItem depth={35}>
            <Heading className="text-xl font-bold leading-snug">
              <Link href={`/haberler/${article.slug}`} className="hover:text-primary focus-visible:text-primary">
                {article.title}
              </Link>
            </Heading>
          </CardItem>
          <CardItem depth={20}>
            <p className="text-muted-foreground">{article.summary}</p>
          </CardItem>
          <CardItem depth={45} className="mt-auto pt-3">
            {/* Duplicate of the title link for pointer users; hidden from keyboard and screen readers. */}
            <Link
              href={`/haberler/${article.slug}`}
              tabIndex={-1}
              aria-hidden="true"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-secondary px-4 font-semibold text-primary transition-colors group-hover/card3d:bg-primary group-hover/card3d:text-primary-foreground"
            >
              Devamını oku
              <ArrowRightIcon weight="bold" />
            </Link>
          </CardItem>
        </div>
      </article>
    </CardContainer>
  );
}
