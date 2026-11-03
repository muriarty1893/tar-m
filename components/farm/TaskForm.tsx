"use client";

import { useState, useTransition } from "react";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { addTask } from "@/app/takvim/actions";
import { TASK_KINDS, validateTask, type TaskErrors, type TaskInput } from "@/lib/farm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, SelectChevron, describedBy, selectClass } from "@/components/forms/fields";

/** "İş ekle": a task for the chosen day (any day can be picked), optionally tied to a field. */
export function TaskForm({ date, fields, defaultFieldId = "" }: { date: string; fields: { id: string; name: string }[]; defaultFieldId?: string }) {
  const empty: TaskInput = { title: "", kind: "gubre", date, time: "", fieldId: defaultFieldId };
  const [values, setValues] = useState<TaskInput>(empty);
  const [errors, setErrors] = useState<TaskErrors>({});
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: keyof TaskInput, v: string) => {
    setValues((x) => ({ ...x, [k]: v }));
    setSaved(false);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const errs = validateTask(values);
        setErrors(errs);
        if (Object.keys(errs).length) return;
        start(async () => {
          const r = await addTask(values);
          setErrors(r.errors);
          if (r.ok) {
            setValues({ ...empty, date: values.date, fieldId: values.fieldId });
            setSaved(true);
          }
        });
      }}
      className="space-y-4"
      noValidate
    >
      <Field id="is-baslik" label="Yapılacak iş" error={errors.title}>
        <Input id="is-baslik" value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="Ör. Taban gübresi (DAP) at" {...describedBy("is-baslik", errors.title)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="is-tur" label="Türü" error={errors.kind}>
          <div className="relative">
            <select id="is-tur" value={values.kind} onChange={(e) => set("kind", e.target.value)} className={selectClass}>
              {Object.entries(TASK_KINDS).map(([id, k]) => (
                <option key={id} value={id}>
                  {k.label}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </Field>
        {fields.length > 0 && (
          <Field id="is-tarla" label="Tarla" optional>
            <div className="relative">
              <select id="is-tarla" value={values.fieldId} onChange={(e) => set("fieldId", e.target.value)} className={selectClass}>
                <option value="">Tarla seçilmedi</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </Field>
        )}
        <Field id="is-tarih" label="Tarih" error={errors.date}>
          <Input id="is-tarih" type="date" value={values.date} onChange={(e) => set("date", e.target.value)} {...describedBy("is-tarih", errors.date)} />
        </Field>
        <Field id="is-saat" label="Saat" optional error={errors.time}>
          <Input id="is-saat" type="time" value={values.time} onChange={(e) => set("time", e.target.value)} {...describedBy("is-saat", errors.time)} />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          <PlusIcon aria-hidden="true" weight="bold" />
          {pending ? "Ekleniyor…" : "İşi ekle"}
        </Button>
        {saved && (
          <p role="status" className="font-semibold text-primary">
            Takvime eklendi.
          </p>
        )}
      </div>
    </form>
  );
}
