"use client";

import { useState, useTransition } from "react";
import { CheckCircleIcon, FlagIcon } from "@phosphor-icons/react/dist/ssr";
import { reportListing } from "@/app/pazar/actions";
import { REPORT_REASONS } from "@/lib/market";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/forms/fields";

/** "Şikayet et": a reason and an optional note, reviewed by the site's moderators. */
export function ReportListing({ listingId, reported }: { listingId: string; reported: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(reported);
  const [pending, start] = useTransition();

  if (done) {
    return (
      <p role="status" className="flex items-center gap-2 text-muted-foreground">
        <CheckCircleIcon aria-hidden="true" weight="fill" className="size-5 text-primary" />
        Şikâyetiniz alındı; ekibimiz inceleyecek.
      </p>
    );
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-muted-foreground underline-offset-4 hover:text-destructive hover:underline">
        <FlagIcon aria-hidden="true" weight="bold" className="size-5" />
        İlanı şikâyet et
      </button>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!reason) return setError("Bir neden seçin.");
        start(async () => {
          const r = await reportListing(listingId, reason, note);
          if (r.ok) setDone(true);
          else setError(r.message ?? "Gönderilemedi, yeniden deneyin.");
        });
      }}
      className="space-y-3 rounded-lg border border-border p-4 bg-card"
    >
      <fieldset>
        <legend className="font-semibold">Bu ilanda sorun ne?</legend>
        <div className="mt-2 space-y-1">
          {REPORT_REASONS.map((r) => (
            <label key={r.id} className="flex min-h-11 cursor-pointer items-center gap-3">
              <input type="radio" name="neden" value={r.id} checked={reason === r.id} onChange={() => setReason(r.id)} className="size-5 accent-[var(--primary)]" />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="sikayet-not" className="block font-semibold">
          Açıklama <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
        </label>
        <Textarea id="sikayet-not" value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} className="mt-2" />
      </div>
      {error && <FieldError id="sikayet-hata">{error}</FieldError>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          Şikâyeti gönder
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Vazgeç
        </Button>
      </div>
    </form>
  );
}
