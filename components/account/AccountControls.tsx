"use client";

import { useState, useTransition } from "react";
import { useClerk } from "@clerk/nextjs";
import { ShieldCheckIcon, SignOutIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { deleteAccount } from "@/app/hesabim/actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/forms/fields";

/** Clerk's own account settings (e-posta, şifre, Google), sign out. */
export function SecurityControls() {
  const clerk = useClerk();
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={() => clerk.openUserProfile()}>
        <ShieldCheckIcon aria-hidden="true" weight="duotone" />
        E-posta, şifre ve giriş yöntemleri
      </Button>
      <Button variant="ghost" onClick={() => clerk.signOut({ redirectUrl: "/" })}>
        <SignOutIcon aria-hidden="true" weight="bold" />
        Çıkış yap
      </Button>
    </div>
  );
}

/** "Hesabımı sil": a checkbox to confirm, then everything is deleted (KVKK: the right to erasure). */
export function DeleteAccount() {
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await deleteAccount(confirmed);
          if (r?.error) setError(r.error);
        });
      }}
      className="space-y-4"
    >
      <label className="flex cursor-pointer items-start gap-3 text-lg">
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 size-6 shrink-0 accent-[var(--destructive)]" />
        Hesabımın ve bütün verilerimin (ilanlar, fotoğraflar, mesajlar, tarlalar, masraflar, takvim) kalıcı olarak silineceğini anlıyorum.
      </label>
      {error && <FieldError id="sil-hata">{error}</FieldError>}
      <Button type="submit" disabled={pending || !confirmed} className="bg-destructive hover:bg-[color-mix(in_oklab,var(--destructive),black_12%)]">
        <TrashIcon aria-hidden="true" weight="bold" />
        {pending ? "Siliniyor…" : "Hesabımı sil"}
      </Button>
    </form>
  );
}
