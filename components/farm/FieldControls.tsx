"use client";

import { useState, useTransition } from "react";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { deleteExpense, deleteField } from "@/app/tarlalarim/actions";
import type { FieldInput } from "@/lib/farm";
import { Button } from "@/components/ui/button";
import { FieldForm } from "./FieldForm";

/** "Tarla ekle" on the list: the form opens in place. */
export function AddField({ defaultProvince, open: startOpen = false }: { defaultProvince: string; open?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  if (!open) return <Button onClick={() => setOpen(true)}>Tarla ekle</Button>;
  return (
    <div className="rounded-lg border border-border p-4 bg-card">
      <h2 className="text-[15px] font-bold">Yeni tarla</h2>
      <div className="mt-4">
        <FieldForm initial={{ name: "", crop: "", stage: "", area: "", province: defaultProvince, district: "", expectedYield: "", notes: "" }} />
      </div>
    </div>
  );
}

/** On a field's page: edit (the form opens in place) and delete with a confirmation. */
export function FieldActions({ fieldId, initial }: { fieldId: string; initial: FieldInput }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => setEditing((e) => !e)} aria-expanded={editing}>
          <PencilSimpleIcon aria-hidden="true" weight="bold" />
          {editing ? "Düzenlemeyi kapat" : "Tarlayı düzenle"}
        </Button>
        {!confirming && (
          <Button variant="ghost" onClick={() => setConfirming(true)} className="text-destructive hover:bg-destructive/10">
            <TrashIcon aria-hidden="true" weight="bold" />
            Tarlayı sil
          </Button>
        )}
      </div>
      {confirming && (
        <div role="alertdialog" aria-labelledby="tarla-sil" className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <p id="tarla-sil" className="font-semibold">
            Tarla ve bütün masrafları silinsin mi? Takvimdeki işler kalır, tarlasız görünür.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setConfirming(false)} autoFocus>
              Vazgeç
            </Button>
            <Button disabled={pending} onClick={() => start(() => deleteField(fieldId))} className="bg-destructive hover:bg-[color-mix(in_oklab,var(--destructive),black_12%)]">
              Evet, sil
            </Button>
          </div>
        </div>
      )}
      {editing && (
        <div className="rounded-lg border border-border p-4 bg-card">
          <FieldForm initial={initial} fieldId={fieldId} onDone={() => setEditing(false)} />
        </div>
      )}
    </div>
  );
}

export function DeleteExpenseButton({ id, label }: { id: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => deleteExpense(id))}
      aria-label={`${label}: sil`}
      className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
    >
      <TrashIcon aria-hidden="true" weight="bold" className="size-5" />
    </button>
  );
}
