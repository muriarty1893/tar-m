"use client";

import { useState, useTransition } from "react";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { addExpense } from "@/app/tarlalarim/actions";
import { EXPENSE_KINDS, validateExpense, type ExpenseErrors, type ExpenseInput } from "@/lib/farm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, SelectChevron, describedBy, selectClass } from "@/components/forms/fields";

export function ExpenseForm({ fieldId, today }: { fieldId: string; today: string }) {
  const empty: ExpenseInput = { kind: "gubre", amount: "", date: today, note: "" };
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState<ExpenseErrors>({});
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: keyof ExpenseInput, value: string) => {
    setV((x) => ({ ...x, [k]: value }));
    setSaved(false);
  };
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const errs = validateExpense(v, today);
        setErrors(errs);
        if (Object.keys(errs).length) return;
        start(async () => {
          const r = await addExpense(fieldId, v);
          setErrors(r.errors);
          if (r.ok) {
            setV({ ...empty, kind: v.kind, date: v.date });
            setSaved(true);
          }
        });
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="masraf-tur" label="Masraf" error={errors.kind}>
          <div className="relative">
            <select id="masraf-tur" value={v.kind} onChange={(e) => set("kind", e.target.value)} className={selectClass}>
              {Object.entries(EXPENSE_KINDS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </Field>
        <Field id="masraf-tutar" label="Tutar (₺)" error={errors.amount}>
          <Input id="masraf-tutar" inputMode="decimal" value={v.amount} onChange={(e) => set("amount", e.target.value)} placeholder="Ör. 12.500" {...describedBy("masraf-tutar", errors.amount)} />
        </Field>
        <Field id="masraf-tarih" label="Tarih" error={errors.date}>
          <Input id="masraf-tarih" type="date" max={today} value={v.date} onChange={(e) => set("date", e.target.value)} {...describedBy("masraf-tarih", errors.date)} />
        </Field>
        <Field id="masraf-not" label="Not" optional error={errors.note}>
          <Input id="masraf-not" value={v.note} onChange={(e) => set("note", e.target.value)} placeholder="Ör. 20 çuval DAP" {...describedBy("masraf-not", errors.note)} />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          <PlusIcon aria-hidden="true" weight="bold" />
          {pending ? "Ekleniyor…" : "Masrafı ekle"}
        </Button>
        {saved && (
          <p role="status" className="font-semibold text-primary">
            Eklendi.
          </p>
        )}
      </div>
    </form>
  );
}
