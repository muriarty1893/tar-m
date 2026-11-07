"use client";

import { useState, useTransition } from "react";
import { provinces } from "@/data/provinces";
import { saveField } from "@/app/tarlalarim/actions";
import { STAGES, validateField, type FieldErrors, type FieldInput } from "@/lib/farm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SelectChevron, describedBy, selectClass } from "@/components/forms/fields";

/** Add a field (no `fieldId`) or edit one. */
export function FieldForm({ initial, fieldId, onDone }: { initial: FieldInput; fieldId?: string; onDone?: () => void }) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: keyof FieldInput, value: string) => {
    setV((x) => ({ ...x, [k]: value }));
    setSaved(false);
  };
  const id = (k: string) => `tarla-${fieldId ? "duzenle-" : ""}${k}`;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const errs = validateField(v);
        setErrors(errs);
        if (Object.keys(errs).length) return;
        start(async () => {
          const r = await saveField(v, fieldId);
          setErrors(r?.errors ?? {});
          if (r && !Object.keys(r.errors).length) {
            setSaved(true);
            onDone?.();
          }
        });
      }}
      className="space-y-5"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id={id("ad")} label="Tarlanın adı" error={errors.name}>
          <Input id={id("ad")} value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Ör. Buğday tarlası" {...describedBy(id("ad"), errors.name)} />
        </Field>
        <Field id={id("alan")} label="Alan (dönüm)" error={errors.area}>
          <Input id={id("alan")} inputMode="decimal" value={v.area} onChange={(e) => set("area", e.target.value)} placeholder="Ör. 45" {...describedBy(id("alan"), errors.area)} />
        </Field>
        <Field id={id("urun")} label="Ürün" optional error={errors.crop}>
          <Input id={id("urun")} value={v.crop} onChange={(e) => set("crop", e.target.value)} placeholder="Ör. Ekmeklik buğday" {...describedBy(id("urun"), errors.crop)} />
        </Field>
        <Field id={id("donem")} label="Dönem" optional error={errors.stage}>
          <Input id={id("donem")} list={id("donemler")} value={v.stage} onChange={(e) => set("stage", e.target.value)} placeholder="Ör. Ekim hazırlığı" {...describedBy(id("donem"), errors.stage)} />
          <datalist id={id("donemler")}>
            {STAGES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field id={id("il")} label="İl" optional error={errors.province}>
          <div className="relative">
            <select id={id("il")} value={v.province} onChange={(e) => set("province", e.target.value)} className={selectClass} {...describedBy(id("il"), errors.province)}>
              <option value="">Seçin</option>
              {provinces.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </Field>
        <Field id={id("ilce")} label="İlçe" optional error={errors.district}>
          <Input id={id("ilce")} value={v.district} onChange={(e) => set("district", e.target.value)} {...describedBy(id("ilce"), errors.district)} />
        </Field>
        <Field id={id("verim")} label="Beklenen verim (kg)" optional error={errors.expectedYield}>
          <Input id={id("verim")} inputMode="decimal" value={v.expectedYield} onChange={(e) => set("expectedYield", e.target.value)} placeholder="Ör. 18.000" {...describedBy(id("verim"), errors.expectedYield)} />
        </Field>
      </div>
      <Field id={id("not")} label="Not" optional error={errors.notes}>
        <Textarea id={id("not")} value={v.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className="min-h-24" {...describedBy(id("not"), errors.notes)} />
      </Field>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Kaydediliyor…" : fieldId ? "Değişiklikleri kaydet" : "Tarlayı ekle"}
        </Button>
        {saved && (
          <p role="status" className="font-semibold text-primary">
            Kaydedildi.
          </p>
        )}
      </div>
    </form>
  );
}
