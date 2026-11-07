"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckCircleIcon, FlagIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { deleteReply, deleteTopic, reportPost } from "@/app/forum/actions";
import { FORUM_REPORT_REASONS } from "@/lib/forum";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/forms/fields";

const actionClass =
  "inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline";

/**
 * Under a topic or a reply: "Düzenle" and "Sil" for its author (and admins), deleting with a
 * confirmation step, and "Şikâyet et" for signed-in people who didn't write it. A topic is edited on
 * its own page (`editHref`); a reply right where it is (`onEdit`).
 */
export function PostActions({
  topicId,
  replyId = null,
  canDelete,
  canReport,
  reported,
  hasReplies = false,
  editHref,
  onEdit,
}: {
  topicId: string;
  replyId?: string | null;
  canDelete: boolean;
  canReport: boolean;
  reported: boolean;
  hasReplies?: boolean;
  editHref?: string;
  onEdit?: () => void;
}) {
  const [mode, setMode] = useState<"idle" | "delete" | "report">("idle");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(reported);
  const [pending, start] = useTransition();
  const what = replyId ? "yanıt" : "konu";
  if (!canDelete && !canReport && !editHref && !onEdit) return null;

  if (mode === "delete") {
    return (
      <div role="alertdialog" aria-labelledby={`sil-${replyId ?? topicId}`} className="w-full rounded-lg border border-destructive/40 bg-destructive/5 p-4">
        <p id={`sil-${replyId ?? topicId}`} className="font-semibold">
          {replyId ? (hasReplies ? "Yanıt silinsin mi? Altındaki yanıtlar kalır; sizinkinin yerinde “Bu yanıt silindi” yazar." : "Yanıt silinsin mi?") : hasReplies ? "Konu, yanıtlarıyla birlikte silinsin mi?" : "Konu silinsin mi?"} Bu geri alınamaz.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setMode("idle")} disabled={pending} autoFocus>
            Vazgeç
          </Button>
          <Button
            onClick={() => start(() => (replyId ? deleteReply(replyId) : deleteTopic(topicId)))}
            disabled={pending}
            className="bg-destructive hover:bg-[color-mix(in_oklab,var(--destructive),black_12%)]"
          >
            <TrashIcon aria-hidden="true" weight="bold" />
            Evet, sil
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "report") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!reason) return setError("Bir neden seçin.");
          start(async () => {
            const r = await reportPost(topicId, replyId, reason, note);
            if (r.ok) {
              setDone(true);
              setMode("idle");
            } else setError(r.message ?? "Gönderilemedi, yeniden deneyin.");
          });
        }}
        className="w-full space-y-3 rounded-lg border border-border p-4 bg-card"
      >
        <fieldset>
          <legend className="font-semibold">Bu {what} neden uygunsuz?</legend>
          <div className="mt-2 space-y-1">
            {FORUM_REPORT_REASONS.map((r) => (
              <label key={r.id} className="flex min-h-11 cursor-pointer items-center gap-3">
                <input type="radio" name={`neden-${replyId ?? topicId}`} value={r.id} checked={reason === r.id} onChange={() => setReason(r.id)} className="size-5 accent-[var(--primary)]" />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} aria-label="Açıklama (isteğe bağlı)" placeholder="Açıklama (isteğe bağlı)" />
        {error && <FieldError id={`sikayet-hata-${replyId ?? topicId}`}>{error}</FieldError>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending}>
            Şikâyeti gönder
          </Button>
          <Button variant="ghost" onClick={() => setMode("idle")}>
            Vazgeç
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4">
      {editHref && (
        <Link href={editHref} className={`${actionClass} hover:text-primary`}>
          <PencilSimpleIcon aria-hidden="true" weight="bold" className="size-4" />
          Düzenle
        </Link>
      )}
      {onEdit && (
        <button type="button" onClick={onEdit} className={`${actionClass} hover:text-primary`}>
          <PencilSimpleIcon aria-hidden="true" weight="bold" className="size-4" />
          Düzenle
        </button>
      )}
      {canDelete && (
        <button type="button" onClick={() => setMode("delete")} className={`${actionClass} hover:text-destructive`}>
          <TrashIcon aria-hidden="true" weight="bold" className="size-4" />
          Sil
        </button>
      )}
      {canReport &&
        (done ? (
          <span role="status" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground">
            <CheckCircleIcon aria-hidden="true" weight="fill" className="size-4 text-primary" />
            Şikâyetiniz alındı
          </span>
        ) : (
          <button type="button" onClick={() => setMode("report")} className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-destructive hover:underline">
            <FlagIcon aria-hidden="true" weight="bold" className="size-4" />
            Şikâyet et
          </button>
        ))}
    </div>
  );
}
