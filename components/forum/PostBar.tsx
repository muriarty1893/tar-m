"use client";

import { useState, useTransition } from "react";
import { ArrowBendUpLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { editReply } from "@/app/forum/actions";
import { REPLY_MAX } from "@/lib/forum";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/forms/fields";
import { LikeButton } from "@/components/forum/LikeButton";
import { MentionTextarea } from "@/components/forum/MentionTextarea";
import { PostActions } from "@/components/forum/PostActions";
import { ReplyForm, type ReplyTarget } from "@/components/forum/ReplyForm";

/** A reply's text, changed in place by its author or an admin. */
function EditReply({ replyId, body, onDone }: { replyId: string; body: string; onDone: () => void }) {
  const [text, setText] = useState(body);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const id = `duzenle-${replyId}`;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await editReply(replyId, text);
          if (r.error) setError(r.error);
          else onDone();
        });
      }}
      className="mt-2 space-y-2"
    >
      <label htmlFor={id} className="sr-only">
        Yanıtı düzenle
      </label>
      <MentionTextarea id={id} value={text} onChange={setText} rows={4} maxLength={REPLY_MAX} aria-describedby={error ? `${id}-hata` : undefined} />
      {error && <FieldError id={`${id}-hata`}>{error}</FieldError>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone} disabled={pending}>
          Vazgeç
        </Button>
      </div>
    </form>
  );
}

/**
 * Under a post: ♥, "Yanıtla" (opens a reply form right under it, as on X), then "Düzenle", "Sil" and
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
  canEdit = false,
  body = "",
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
  /** The author or an admin: "Düzenle". */
  canEdit?: boolean;
  /** A reply's current text, for editing it in place. */
  body?: string;
}) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  if (editing && reply) return <EditReply replyId={reply.id} body={body} onDone={() => setEditing(false)} />;
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
        <PostActions
          topicId={topicId}
          replyId={reply?.id ?? null}
          canDelete={canDelete}
          canReport={canReport}
          reported={reported}
          hasReplies={hasReplies}
          editHref={canEdit && !reply ? `/forum/${topicId}/duzenle` : undefined}
          onEdit={canEdit && reply ? () => setEditing(true) : undefined}
        />
      </div>
      {replying && reply && <ReplyForm topicId={topicId} signInHref={null} parent={reply} onDone={() => setReplying(false)} />}
    </div>
  );
}
