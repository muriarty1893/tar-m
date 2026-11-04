"use client";

import { useState } from "react";
import { ArrowBendUpLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { LikeButton } from "@/components/forum/LikeButton";
import { PostActions } from "@/components/forum/PostActions";
import { ReplyForm, type ReplyTarget } from "@/components/forum/ReplyForm";

/**
 * Under a post: ♥, "Yanıtla" (opens a reply form right under it, as on X), then "Sil" and
 * "Şikâyet et". `reply` is the reply this bar belongs to; without it, the bar is the topic's.
 */
export function PostBar({
  topicId,
  reply = null,
  liked,
  likeCount,
  canDelete,
  canReport,
  reported,
  hasReplies,
  signInHref,
}: {
  topicId: string;
  reply?: ReplyTarget | null;
  liked: boolean;
  likeCount: number;
  canDelete: boolean;
  canReport: boolean;
  reported: boolean;
  hasReplies?: boolean;
  /** Signed out: where "Yanıtla" goes. */
  signInHref: string | null;
}) {
  const [replying, setReplying] = useState(false);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4">
        <LikeButton topicId={topicId} replyId={reply?.id ?? null} liked={liked} count={likeCount} />
        {reply &&
          (signInHref ? (
            <a href={signInHref} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
              <ArrowBendUpLeftIcon aria-hidden="true" weight="bold" className="size-4" />
              Yanıtla
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              aria-expanded={replying}
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              <ArrowBendUpLeftIcon aria-hidden="true" weight="bold" className="size-4" />
              Yanıtla
            </button>
          ))}
        <PostActions topicId={topicId} replyId={reply?.id ?? null} canDelete={canDelete} canReport={canReport} reported={reported} hasReplies={hasReplies} />
      </div>
      {replying && reply && <ReplyForm topicId={topicId} signInHref={null} parent={reply} onDone={() => setReplying(false)} />}
    </div>
  );
}
