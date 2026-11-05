"use client";

import { useState, useTransition } from "react";
import { ArrowDownIcon, ArrowUpIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { createForumCategory, deleteForumCategory, moveForumCategory, updateForumCategory, type CategoryResult } from "@/app/yonetim/actions";
import { CATEGORY_DESCRIPTION_MAX, CATEGORY_NAME_MAX, FALLBACK_FORUM_CATS, type ForumCat, type ForumCats } from "@/lib/forum";
import type { CategoryInput } from "@/lib/forum-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, SelectChevron, selectClass } from "@/components/forms/fields";

type Counts = Record<string, number>;

const iconButton =
  "inline-flex size-11 cursor-pointer items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40";

/**
 * /yonetim/forum: the sections and their sub-categories, as on r10.net. Add, rename, describe, move
 * up and down, move under another section, delete (moving the topics elsewhere first).
 */
export function ForumCategoryManager({ cats, counts }: { cats: ForumCats; counts: Counts }) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="yeni-bolum" className="rounded-xl border border-border p-4 sm:p-5">
        <h2 id="yeni-bolum" className="text-xl font-bold">
          Yeni ana bölüm
        </h2>
        <p className="mt-1 text-muted-foreground">Örn. “Organik tarım”, “Seracılık”. Altına kategoriler ekleyebilirsiniz.</p>
        <CategoryForm cats={cats} submitLabel="Bölümü ekle" onSubmit={(v) => createForumCategory(v)} idPrefix="yeni-bolum" />
      </section>

      <ol className="space-y-4">
        {cats.sections.map((s, i) => (
          <li key={s.id} className="overflow-hidden rounded-xl border border-border">
            <div className="bg-secondary/60">
              <Row cat={s} cats={cats} counts={counts} first={i === 0} last={i === cats.sections.length - 1} section />
            </div>
            {s.children.length > 0 && (
              <ol aria-label={`${s.name}: alt kategoriler`} className="divide-y divide-border border-t border-border">
                {s.children.map((c, j) => (
                  <li key={c.id} className="pl-4 sm:pl-8">
                    <Row cat={c} cats={cats} counts={counts} first={j === 0} last={j === s.children.length - 1} />
                  </li>
                ))}
              </ol>
            )}
            <AddChild section={s} cats={cats} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function Row({ cat, cats, counts, first, last, section = false }: { cat: ForumCat; cats: ForumCats; counts: Counts; first: boolean; last: boolean; section?: boolean }) {
  const [mode, setMode] = useState<"idle" | "edit" | "delete">("idle");
  const [pending, start] = useTransition();
  const topics = section ? [cat.id, ...(cats.sections.find((s) => s.id === cat.id)?.children.map((c) => c.id) ?? [])].reduce((n, id) => n + (counts[id] ?? 0), 0) : (counts[cat.id] ?? 0);
  const own = counts[cat.id] ?? 0;

  if (mode === "edit") {
    return (
      <div className="p-4">
        <CategoryForm
          cats={cats}
          initial={{ name: cat.name, description: cat.description, parentId: cat.parentId ?? "" }}
          self={cat.id}
          withParent
          submitLabel="Kaydet"
          idPrefix={`duzenle-${cat.id}`}
          onSubmit={(v) => updateForumCategory(cat.id, v)}
          onDone={() => setMode("idle")}
        />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className={section ? "text-lg font-bold" : "font-semibold"}>{cat.name}</p>
          {cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}
          <p className="text-sm text-muted-foreground">
            /forum/k/{cat.id} · {topics.toLocaleString("tr-TR")} konu
          </p>
        </div>
        <div className="flex gap-1.5">
          <button type="button" aria-label={`${cat.name}: yukarı taşı`} disabled={first || pending} onClick={() => start(() => moveForumCategory(cat.id, "up"))} className={iconButton}>
            <ArrowUpIcon aria-hidden="true" weight="bold" className="size-5" />
          </button>
          <button type="button" aria-label={`${cat.name}: aşağı taşı`} disabled={last || pending} onClick={() => start(() => moveForumCategory(cat.id, "down"))} className={iconButton}>
            <ArrowDownIcon aria-hidden="true" weight="bold" className="size-5" />
          </button>
          <button type="button" aria-label={`${cat.name}: düzenle`} onClick={() => setMode("edit")} className={iconButton}>
            <PencilSimpleIcon aria-hidden="true" weight="bold" className="size-5" />
          </button>
          <button type="button" aria-label={`${cat.name}: sil`} onClick={() => setMode(mode === "delete" ? "idle" : "delete")} className={`${iconButton} hover:text-destructive`}>
            <TrashIcon aria-hidden="true" weight="bold" className="size-5" />
          </button>
        </div>
      </div>
      {mode === "delete" && <DeleteBox cat={cat} cats={cats} topics={own} onCancel={() => setMode("idle")} />}
    </div>
  );
}

function DeleteBox({ cat, cats, topics, onCancel }: { cat: ForumCat; cats: ForumCats; topics: number; onCancel: () => void }) {
  const [moveTo, setMoveTo] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const id = `sil-${cat.id}`;
  const protectedOne = Boolean(FALLBACK_FORUM_CATS.byId[cat.id]);
  const hasChildren = cats.sections.some((s) => s.id === cat.id && s.children.length > 0);
  const blocked = protectedOne
    ? "İlk altı bölüm silinemez: mobil uygulama bunları kullanıyor. Adını ve açıklamasını değiştirebilirsiniz."
    : hasChildren
      ? "Önce bu bölümün alt kategorilerini silin ya da başka bir bölüme taşıyın."
      : "";
  return (
    <div role="alertdialog" aria-labelledby={`${id}-baslik`} className="mt-3 rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4">
      <p id={`${id}-baslik`} className="font-semibold">
        {blocked || `“${cat.name}” silinsin mi?`}
      </p>
      {!blocked && topics > 0 && (
        <div className="mt-3 space-y-2">
          <label htmlFor={`${id}-hedef`} className="block">
            İçindeki {topics} konu şuraya taşınsın:
          </label>
          <div className="relative max-w-sm">
            <select id={`${id}-hedef`} value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className={selectClass}>
              <option value="">Kategori seçin</option>
              <CategoryOptions cats={cats} exclude={cat.id} />
            </select>
            <SelectChevron />
          </div>
        </div>
      )}
      {error && (
        <div className="mt-2">
          <FieldError id={`${id}-hata`}>{error}</FieldError>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-3">
        <Button variant="outline" onClick={onCancel} disabled={pending} autoFocus>
          {blocked ? "Tamam" : "Vazgeç"}
        </Button>
        {!blocked && (
          <Button
            disabled={pending || (topics > 0 && !moveTo)}
            onClick={() =>
              start(async () => {
                const r = await deleteForumCategory(cat.id, moveTo);
                if (r.error) setError(r.error);
              })
            }
            className="bg-destructive hover:bg-[color-mix(in_oklab,var(--destructive),black_12%)]"
          >
            <TrashIcon aria-hidden="true" weight="bold" />
            {topics > 0 ? "Taşı ve sil" : "Evet, sil"}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Every category as an option, sub-categories grouped under their section. */
function CategoryOptions({ cats, exclude }: { cats: ForumCats; exclude?: string }) {
  return (
    <>
      {cats.sections.map((s) => (
        <optgroup key={s.id} label={s.name}>
          {s.id !== exclude && <option value={s.id}>{s.name}</option>}
          {s.children
            .filter((c) => c.id !== exclude)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </optgroup>
      ))}
    </>
  );
}

function AddChild({ section, cats }: { section: ForumCat; cats: ForumCats }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <div className="border-t border-border p-3">
        <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 font-semibold text-primary hover:bg-secondary">
          <PlusIcon aria-hidden="true" weight="bold" className="size-5" />
          {section.name} altına kategori ekle
        </button>
      </div>
    );
  }
  return (
    <div className="border-t border-border p-4">
      <p className="font-semibold">{section.name} altına yeni kategori</p>
      <CategoryForm
        cats={cats}
        initial={{ name: "", description: "", parentId: section.id }}
        submitLabel="Kategoriyi ekle"
        idPrefix={`alt-${section.id}`}
        onSubmit={(v) => createForumCategory(v)}
        onDone={() => setOpen(false)}
        resetOnSuccess
      />
    </div>
  );
}

function CategoryForm({
  cats,
  initial = { name: "", description: "", parentId: "" },
  self,
  withParent = false,
  submitLabel,
  idPrefix,
  onSubmit,
  onDone,
  resetOnSuccess = true,
}: {
  cats: ForumCats;
  initial?: CategoryInput;
  self?: string;
  withParent?: boolean;
  submitLabel: string;
  idPrefix: string;
  onSubmit: (v: CategoryInput) => Promise<CategoryResult>;
  onDone?: () => void;
  resetOnSuccess?: boolean;
}) {
  const [values, setValues] = useState<CategoryInput>(initial);
  const [errors, setErrors] = useState<CategoryResult["errors"]>({});
  const [pending, start] = useTransition();
  const set = (k: keyof CategoryInput, v: string) => setValues((s) => ({ ...s, [k]: v }));
  const isSectionWithChildren = cats.sections.some((s) => s.id === self && s.children.length > 0);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await onSubmit(values);
          setErrors(r.errors ?? {});
          if (!r.errors) {
            if (resetOnSuccess && !self) setValues(initial);
            onDone?.();
          }
        });
      }}
      className="mt-3 grid gap-3 sm:grid-cols-2"
    >
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-ad`} className="block font-semibold">
          Ad
        </label>
        <Input id={`${idPrefix}-ad`} value={values.name} onChange={(e) => set("name", e.target.value)} maxLength={CATEGORY_NAME_MAX} required aria-invalid={Boolean(errors?.name)} />
        {errors?.name && <FieldError id={`${idPrefix}-ad-hata`}>{errors.name}</FieldError>}
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-aciklama`} className="block font-semibold">
          Açıklama <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
        </label>
        <Input id={`${idPrefix}-aciklama`} value={values.description} onChange={(e) => set("description", e.target.value)} maxLength={CATEGORY_DESCRIPTION_MAX} />
        {errors?.description && <FieldError id={`${idPrefix}-aciklama-hata`}>{errors.description}</FieldError>}
      </div>
      {withParent && !isSectionWithChildren && (
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor={`${idPrefix}-ust`} className="block font-semibold">
            Yeri
          </label>
          <div className="relative max-w-sm">
            <select id={`${idPrefix}-ust`} value={values.parentId} onChange={(e) => set("parentId", e.target.value)} className={selectClass}>
              <option value="">Ana bölüm</option>
              {cats.sections
                .filter((s) => s.id !== self)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} altında
                  </option>
                ))}
            </select>
            <SelectChevron />
          </div>
          {errors?.parentId && <FieldError id={`${idPrefix}-ust-hata`}>{errors.parentId}</FieldError>}
        </div>
      )}
      {errors?.form && (
        <div className="sm:col-span-2">
          <FieldError id={`${idPrefix}-hata`}>{errors.form}</FieldError>
        </div>
      )}
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Kaydediliyor…" : submitLabel}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone} disabled={pending}>
            Vazgeç
          </Button>
        )}
      </div>
    </form>
  );
}
