import Image from "next/image";
import Link from "next/link";
import { ChatCircleTextIcon, EyeIcon, HeartIcon, ImageIcon, LockSimpleIcon, PushPinIcon } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/market/Avatar";
import { CategoryChip } from "@/components/forum/parts";
import { categoryName, type ForumCats } from "@/lib/forum";
import type { TopicCard } from "@/lib/forum-data";
import { agoLabel } from "@/lib/tr-time";

/** "Hasan Demir" → "Hasan D." for the dense list's "son: …". */
const shortName = (name: string) => {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last.charAt(0).toLocaleUpperCase("tr-TR")}.` : first;
};

/** A pin before a pinned topic's title, a lock after a locked one's. */
function Marks({ topic: t }: { topic: TopicCard }) {
  return (
    <>
      {t.pinned && (
        <span className="mr-1 inline-flex items-center align-[-2px] text-primary">
          <PushPinIcon aria-hidden="true" weight="fill" className="size-3.5" />
          <span className="sr-only">Sabit konu: </span>
        </span>
      )}
    </>
  );
}

const Lock = ({ topic: t }: { topic: TopicCard }) =>
  t.locked ? (
    <span className="ml-1 inline-flex items-center align-[-2px] text-muted-foreground">
      <LockSimpleIcon aria-hidden="true" weight="fill" className="size-3.5" />
      <span className="sr-only"> (yanıtlara kapalı)</span>
    </span>
  ) : null;

/** Replies and views at the end of a topic's line. */
function Counts({ topic: t, className = "" }: { topic: TopicCard; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-2 tabular-nums ${className}`}>
      <span className="inline-flex items-center gap-0.5">
        <ChatCircleTextIcon aria-hidden="true" weight="bold" className="size-3.5" />
        {t.replyCount.toLocaleString("tr-TR")}
        <span className="sr-only"> yanıt, </span>
      </span>
      <span className="inline-flex items-center gap-0.5">
        <EyeIcon aria-hidden="true" weight="bold" className="size-3.5" />
        {t.viewCount.toLocaleString("tr-TR")}
        <span className="sr-only"> görüntülenme</span>
      </span>
    </span>
  );
}

/**
 * One topic in a list, r10.net style: who, the title, then category · author · time with the likes,
 * replies and views at the end of the line. A photo shows as a small thumbnail. `dense` is the home
 * page's Borsa row: title, then category · time · last replier and the counts, on two short lines.
 * Used on the server and in the browser ("Daha fazla göster" adds rows), so it reads nothing itself.
 */
export function TopicRow({ topic: t, cats, now, showLastReply = false, dense = false }: { topic: TopicCard; cats: ForumCats; now: Date; showLastReply?: boolean; dense?: boolean }) {
  const when = showLastReply && t.lastReplyAt ? `son yanıt ${agoLabel(new Date(t.lastReplyAt), now)}` : agoLabel(new Date(t.createdAt), now);

  if (dense) {
    const who = t.replyCount > 0 && t.lastReplyBy ? `son: ${shortName(t.lastReplyBy)}` : shortName(t.authorName);
    return (
      <li>
        <Link href={`/forum/${t.id}`} className="block px-3 py-2 transition-colors hover:bg-muted/50 focus-visible:outline-offset-[-3px]">
          <span className="block truncate font-medium leading-snug text-foreground">
            <Marks topic={t} />
            {t.title}
            <Lock topic={t} />
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-[12px] leading-5 text-muted-foreground">
            <span className="min-w-0 truncate">
              {categoryName(cats, t.category)} · {when} · {who}
            </span>
            <Counts topic={t} className="font-borsa-mono text-[11.5px] [&>span:first-child]:text-foreground" />
          </span>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link href={`/forum/${t.id}`} className="flex items-start gap-3 px-3.5 py-3 transition-colors hover:bg-secondary focus-visible:outline-offset-[-3px] sm:px-4">
        <Avatar id={t.authorId} name={t.authorName} photo={t.authorPhoto} size={38} />
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 font-semibold leading-snug text-foreground">
            <Marks topic={t} />
            {t.title}
            <Lock topic={t} />
          </span>
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
            <Counts topic={t} />
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
      </Link>
    </li>
  );
}
