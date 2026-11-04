"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { ArrowBendDownRightIcon, PaperPlaneRightIcon } from "@phosphor-icons/react/dist/ssr";
import { replyToTopic } from "@/app/forum/actions";
import { REPLY_MAX, validateReply } from "@/lib/forum";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldError } from "@/components/forms/fields";
import { MentionTextarea } from "@/components/forum/MentionTextarea";
import { PhotoPicker, usePhotoUploads } from "@/components/forum/PhotoPicker";

export type ReplyTarget = { id: string; name: string; handle: string | null };

/**
 * "Yanıt yaz": under the topic, or (`parent`) under one reply, as on X, starting with "@kişi ". Text,
 * up to 4 photos and mentions. Signed out, the way to sign in instead.
 */
export function ReplyForm({ topicId, signInHref, parent = null, onDone }: { topicId: string; signInHref: string | null; parent?: ReplyTarget | null; onDone?: () => void }) {
  const [body, setBody] = useState(parent?.handle ? `@${parent.handle} ` : "");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();
  const photos = usePhotoUploads();
  const box = useRef<HTMLTextAreaElement>(null);
  const id = parent ? `yanit-${parent.id}` : "yanit";

  if (signInHref) {
    return (
      <div className="rounded-2xl border border-dashed border-input p-6 text-center">
        <p className="text-lg">Yanıt yazmak için giriş yapın; hesap ücretsizdir.</p>
        <Link href={signInHref} className={buttonVariants({ className: "mt-4" })}>
          Giriş yap
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSent(false);
        if (photos.uploading) return setError("Fotoğraflar hâlâ yükleniyor; birkaç saniye bekleyin.");
        const invalid = validateReply(body, photos.urls);
        if (invalid) return setError(invalid);
        start(async () => {
          const r = await replyToTopic(topicId, { body, parentId: parent?.id ?? null, photos: photos.urls });
          if (r.error) return setError(r.error);
          setBody("");
          setError("");
          photos.reset();
          if (onDone) onDone();
          else setSent(true);
        });
      }}
      className={parent ? "mt-3 space-y-3 rounded-2xl border border-border bg-background p-3" : "space-y-3"}
      aria-label={parent ? `${parent.name} kişisine yanıt yaz` : "Yanıt yaz"}
    >
      {parent ? (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ArrowBendDownRightIcon aria-hidden="true" weight="bold" className="size-4" />
          <span>
            <span className="font-semibold text-foreground">{parent.name}</span> kişisine yanıt
          </span>
        </p>
      ) : (
        <label htmlFor={id} className="block text-lg font-semibold">
          Yanıtınız
        </label>
      )}
      <MentionTextarea
        ref={box}
        id={id}
        topicId={topicId}
        value={body}
        onChange={(v) => {
          setBody(v);
          setError("");
        }}
        rows={parent ? 3 : 4}
        maxLength={REPLY_MAX}
        autoFocus={Boolean(parent)}
        aria-label={parent ? "Yanıtınız" : undefined}
        placeholder={parent ? "Yanıtınızı yazın…" : "Deneyiminizi ya da önerinizi yazın… Birinden bahsetmek için @ yazın."}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-hata` : undefined}
      />
      <PhotoPicker uploads={photos} id={`${id}-foto`} />
      {error && <FieldError id={`${id}-hata`}>{error}</FieldError>}
      {sent && (
        <p role="status" className="font-semibold text-primary">
          Yanıtınız eklendi.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          <PaperPlaneRightIcon aria-hidden="true" weight="fill" />
          {pending ? "Gönderiliyor…" : "Yanıtı gönder"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone}>
            Vazgeç
          </Button>
        )}
      </div>
    </form>
  );
}
