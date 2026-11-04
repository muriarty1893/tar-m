"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PaperPlaneRightIcon } from "@phosphor-icons/react/dist/ssr";
import { replyToTopic } from "@/app/forum/actions";
import { REPLY_MAX, validateReply } from "@/lib/forum";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/forms/fields";

/** "Yanıt yaz" under a topic; signed out, the way to sign in instead. */
export function ReplyForm({ topicId, signInHref }: { topicId: string; signInHref: string | null }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

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
        const invalid = validateReply(body);
        if (invalid) return setError(invalid);
        start(async () => {
          const r = await replyToTopic(topicId, body);
          if (r.error) setError(r.error);
          else {
            setBody("");
            setError("");
            setSent(true);
          }
        });
      }}
      className="space-y-3"
      aria-label="Yanıt yaz"
    >
      <label htmlFor="yanit" className="block text-lg font-semibold">
        Yanıtınız
      </label>
      <Textarea
        id="yanit"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          setError("");
        }}
        rows={4}
        maxLength={REPLY_MAX}
        placeholder="Deneyiminizi ya da önerinizi yazın…"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "yanit-hata" : undefined}
      />
      {error && <FieldError id="yanit-hata">{error}</FieldError>}
      {sent && (
        <p role="status" className="font-semibold text-primary">
          Yanıtınız eklendi.
        </p>
      )}
      <Button type="submit" disabled={pending}>
        <PaperPlaneRightIcon aria-hidden="true" weight="fill" />
        {pending ? "Gönderiliyor…" : "Yanıtı gönder"}
      </Button>
    </form>
  );
}
