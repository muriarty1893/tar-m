import Image from "next/image";
import Link from "next/link";
import { ChatsTeardropIcon, HeartIcon, ImageIcon } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/market/Avatar";
import { CategoryChip, repliesLabel } from "@/components/forum/parts";
import type { TopicCard } from "@/lib/forum-data";
import { agoLabel } from "@/lib/tr-time";

/** Topics in a list: who, title, the start of the text, a photo when there is one, replies and likes. */
export function TopicList({ items, now, framed = true }: { items: TopicCard[]; now: Date; framed?: boolean }) {
  return (
    <ul className={`divide-y divide-border bg-card ${framed ? "overflow-hidden rounded-2xl border border-border" : ""}`}>
      {items.map((t) => (
        <li key={t.id}>
          <Link href={`/forum/${t.id}`} className="flex gap-3 px-4 py-4 transition-colors hover:bg-secondary focus-visible:outline-offset-[-3px]">
            <Avatar id={t.authorId} name={t.authorName} size={44} />
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold leading-snug">{t.title}</span>
              <span className="mt-1 line-clamp-2 block text-muted-foreground">{t.excerpt}</span>
              <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <CategoryChip category={t.category} />
                <span>
                  {t.authorName}
                  {t.authorHandle && <span className="ml-1">@{t.authorHandle}</span>}
                </span>
                <span>{agoLabel(new Date(t.createdAt), now)}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <ChatsTeardropIcon aria-hidden="true" weight="duotone" className="size-4 text-primary" />
                  {repliesLabel(t.replyCount)}
                </span>
                {t.likeCount > 0 && (
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    <HeartIcon aria-hidden="true" weight="fill" className="size-4 text-rose-700" />
                    {t.likeCount} beğeni
                  </span>
                )}
              </span>
            </span>
            {t.photo && (
              <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-24">
                <Image src={t.photo} alt="" fill sizes="96px" className="object-cover" />
                {t.photoCount > 1 && (
                  <span className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded-full bg-black/65 px-1.5 text-xs font-semibold text-white">
                    <ImageIcon aria-hidden="true" weight="bold" className="size-3" />
                    {t.photoCount}
                  </span>
                )}
                <span className="sr-only">{t.photoCount} fotoğraf</span>
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
