"use client";

import { useId, useState, useTransition } from "react";
import { ProhibitIcon, TrashIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr";
import { deleteMember, setMemberSuspended } from "@/app/yonetim/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "idle" | "suspend" | "delete";

const DANGER = "bg-destructive text-white hover:bg-[color-mix(in_oklab,var(--destructive),black_12%)]";

/**
 * A member's row actions in Yönetim → Üyeler. Suspending asks for an optional reason; deleting asks for
 * the member's name typed in full, because it removes everything they wrote and can't be undone.
 */
export function MemberActions({ userId, name, suspended, protectedAccount }: { userId: string; name: string; suspended: boolean; protectedAccount: boolean }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  const reasonId = useId();
  const typedId = useId();

  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      setResult(null);
      const r = await fn();
      setResult(r);
      if (r.ok) {
        setMode("idle");
        setReason("");
        setTyped("");
      }
    });

  if (protectedAccount) return <span className="text-[12px] text-muted-foreground">Yönetici</span>;

  return (
    <div className="space-y-2">
      {mode === "idle" && (
        <div className="flex flex-wrap gap-1.5">
          {suspended ? (
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => run(() => setMemberSuspended(userId, false))}>
              <ArrowCounterClockwiseIcon aria-hidden="true" weight="bold" />
              Askıyı kaldır
            </Button>
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={() => setMode("suspend")}>
              <ProhibitIcon aria-hidden="true" weight="bold" />
              Askıya al
            </Button>
          )}
          <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setMode("delete")}>
            <TrashIcon aria-hidden="true" weight="bold" />
            Sil
          </Button>
        </div>
      )}

      {mode === "suspend" && (
        <form
          className="space-y-2 rounded-md border border-border bg-muted/40 p-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => setMemberSuspended(userId, true, reason));
          }}
        >
          <p className="text-[13px]">
            <b>{name}</b> giriş yapıp okuyabilir, ama konu, yanıt, ilan ve mesaj gönderemez.
          </p>
          <label htmlFor={reasonId} className="block text-[12px] font-semibold">
            Neden (yalnızca yöneticiler görür, isteğe bağlı)
          </label>
          <Input id={reasonId} value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} placeholder="ör. tekrar eden reklam paylaşımı" className="h-9 text-sm" />
          <div className="flex gap-1.5">
            <Button type="submit" size="sm" disabled={pending} className={DANGER}>
              {pending ? "Askıya alınıyor…" : "Askıya al"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setMode("idle")}>
              Vazgeç
            </Button>
          </div>
        </form>
      )}

      {mode === "delete" && (
        <form
          className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => deleteMember(userId, typed));
          }}
        >
          <p className="text-[13px]">
            <b>{name}</b> hesabı; konuları, yanıtları, ilanları, mesajları ve fotoğraflarıyla birlikte <b>kalıcı olarak</b> silinir. Geri alınamaz.
          </p>
          <label htmlFor={typedId} className="block text-[12px] font-semibold">
            Onaylamak için üyenin adını yazın: <span className="font-borsa-mono">{name}</span>
          </label>
          <Input id={typedId} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className="h-9 text-sm" />
          <div className="flex gap-1.5">
            <Button
              type="submit"
              size="sm"
              disabled={pending || typed.trim().toLocaleLowerCase("tr") !== name.trim().toLocaleLowerCase("tr")}
              className={DANGER}
            >
              {pending ? "Siliniyor…" : "Kalıcı olarak sil"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setMode("idle")}>
              Vazgeç
            </Button>
          </div>
        </form>
      )}

      <p role="status" className={`text-[12px] empty:hidden ${result && !result.ok ? "text-destructive" : "text-good"}`}>
        {result?.message}
      </p>
    </div>
  );
}
