"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowCounterClockwiseIcon, CheckCircleIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { setListingStatus } from "@/app/pazar/actions";
import { Button, buttonVariants } from "@/components/ui/button";

/** On your own listing: edit, mark sold (or back on sale) and remove, with a confirmation step. */
export function OwnerActions({ listingId, status }: { listingId: string; status: "active" | "sold" | "removed" }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const set = (s: "active" | "sold" | "removed") => start(() => setListingStatus(listingId, s));

  if (status === "removed") return <p className="rounded-2xl bg-muted px-4 py-3 font-semibold">Bu ilanı kaldırdınız; Pazar’da görünmüyor.</p>;

  return (
    <div className="space-y-3">
      <p className="font-semibold">Bu sizin ilanınız.</p>
      <div className="grid gap-3">
        <Link href={`/pazar/ilan/${listingId}/duzenle`} className={buttonVariants({ variant: "outline" })}>
          <PencilSimpleIcon aria-hidden="true" weight="bold" />
          Düzenle
        </Link>
        {status === "active" ? (
          <Button onClick={() => set("sold")} disabled={pending}>
            <CheckCircleIcon aria-hidden="true" weight="bold" />
            Satıldı olarak işaretle
          </Button>
        ) : (
          <Button onClick={() => set("active")} disabled={pending}>
            <ArrowCounterClockwiseIcon aria-hidden="true" weight="bold" />
            Yeniden satışa çıkar
          </Button>
        )}
      </div>
      {confirming ? (
        <div role="alertdialog" aria-labelledby="kaldir-baslik" className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-4">
          <p id="kaldir-baslik" className="font-semibold">
            İlan kaldırılsın mı? Pazar’da görünmez ve geri alınamaz; mevcut sohbetler okunabilir kalır.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setConfirming(false)} disabled={pending} autoFocus>
              Vazgeç
            </Button>
            <Button onClick={() => set("removed")} disabled={pending} className="bg-destructive hover:bg-[color-mix(in_oklab,var(--destructive),black_12%)]">
              <TrashIcon aria-hidden="true" weight="bold" />
              Evet, kaldır
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" onClick={() => setConfirming(true)} className="w-full text-destructive hover:bg-destructive/10">
          <TrashIcon aria-hidden="true" weight="bold" />
          İlanı kaldır
        </Button>
      )}
    </div>
  );
}
