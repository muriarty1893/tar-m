import Image from "next/image";
import Link from "next/link";
import { ChatCircleTextIcon, HeartIcon, ImageIcon } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/market/Avatar";
import { CategoryChip } from "@/components/forum/parts";
import type { ForumCats } from "@/lib/forum";
import type { TopicCard } from "@/lib/forum-data";
import { agoLabel } from "@/lib/tr-time";

/**
 * One topic in a list, r10.net style: who, the title, category · author · time, and the reply count
 * in a box on the right. A photo shows as a small thumbnail. Used on the server and in the browser
 * ("Daha fazla göster" adds rows), so it reads nothing itself.
 */
export function TopicRow({ topic: t, cats, now, showLastReply = false }: { topic: TopicCard; cats: ForumCats; now: Date; showLastReply?: boolean }) {
  const when = showLastReply && t.lastReplyAt ? `son yanıt ${agoLabel(new Date(t.lastReplyAt), now)}` : agoLabel(new Date(t.createdAt), now);
  return (
    <li>
      <Link href={`/forum/${t.id}`} className="flex items-start gap-3 px-3.5 py-3 transition-colors hover:bg-secondary focus-visible:outline-offset-[-3px] sm:px-4">
        <Avatar id={t.authorId} name={t.authorName} size={38} />
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 font-semibold leading-snug text-foreground">{t.title}</span>
          <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm leading-5 text-muted-foreground">
            <CategoryChip cats={cats} category={t.category} size="sm" />
            <span className="max-w-[10rem] truncate">{t.authorName}</span>
            <span aria-hidden="true">·</span>
            <span>{when}</span>
            {t.likeCount > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <HeartIcon aria-hidden="true" weight="fill" className="size-3.5 text-rose-700" />
                <span className="sr-only">beğeni:</span>
                {t.likeCount}
              </span>
            )}
          </span>
        </span>
        {t.photo && (
          <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image src={t.photo} alt="" fill sizes="54px" className="object-cover" />
            {t.photoCount > 1 && (
              <span aria-hidden="true" className="absolute bottom-0.5 right-0.5 inline-flex items-center gap-0.5 rounded bg-black/65 px-1 text-[0.6875rem] font-semibold leading-4 text-white">
                <ImageIcon weight="bold" className="size-2.5" />
                {t.photoCount}
              </span>
            )}
            <span className="sr-only">{t.photoCount} fotoğraf</span>
          </span>
        )}
        <span className={`flex w-12 shrink-0 flex-col items-center rounded-lg py-1 ${t.replyCount ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"}`}>
          <ChatCircleTextIcon aria-hidden="true" weight="bold" className="size-4" />
          <span className="text-sm font-bold leading-5 tabular-nums">{t.replyCount.toLocaleString("tr-TR")}</span>
          <span className="sr-only">yanıt</span>
        </span>
      </Link>
    </li>
  );
}
