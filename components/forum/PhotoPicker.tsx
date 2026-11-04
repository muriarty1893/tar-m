"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import { ImageIcon, SpinnerGapIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { MAX_FORUM_PHOTOS } from "@/lib/forum";
import { shrinkImage } from "@/lib/shrink-image";

type Item = { key: string; preview: string; url?: string; state: "uploading" | "done" | "error" };

const randomName = () => Math.random().toString(36).slice(2, 12);

/** The photos being added to a post: uploaded as they're picked (shrunk first), at most 4. */
export function usePhotoUploads() {
  const [items, setItems] = useState<Item[]>([]);
  const all = useRef<Item[]>([]);
  useEffect(() => {
    all.current = items;
  }, [items]);
  useEffect(() => () => all.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  async function add(files: FileList | null) {
    if (!files) return;
    const room = MAX_FORUM_PHOTOS - items.length;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(0, room));
    await Promise.all(
      picked.map(async (file) => {
        const key = randomName();
        setItems((ps) => [...ps, { key, preview: URL.createObjectURL(file), state: "uploading" }]);
        try {
          const blob = await shrinkImage(file);
          const ext = blob.type === "image/webp" ? "webp" : "jpg";
          const result = await upload(`forum/${randomName()}.${ext}`, blob, { access: "public", handleUploadUrl: "/api/forum/foto", contentType: blob.type });
          setItems((ps) => ps.map((p) => (p.key === key ? { ...p, url: result.url, state: "done" } : p)));
        } catch {
          setItems((ps) => ps.map((p) => (p.key === key ? { ...p, state: "error" } : p)));
        }
      }),
    );
  }

  const remove = (key: string) =>
    setItems((ps) => {
      const gone = ps.find((p) => p.key === key);
      if (gone) URL.revokeObjectURL(gone.preview);
      return ps.filter((p) => p.key !== key);
    });

  const reset = () =>
    setItems((ps) => {
      ps.forEach((p) => URL.revokeObjectURL(p.preview));
      return [];
    });

  return {
    items,
    add,
    remove,
    reset,
    urls: items.filter((p) => p.state === "done" && p.url).map((p) => p.url!),
    uploading: items.some((p) => p.state === "uploading"),
    failed: items.some((p) => p.state === "error"),
  };
}

export type PhotoUploads = ReturnType<typeof usePhotoUploads>;

/** "Fotoğraf ekle" and the picked photos' thumbnails, each removable. */
export function PhotoPicker({ uploads, id }: { uploads: PhotoUploads; id: string }) {
  const input = useRef<HTMLInputElement>(null);
  const full = uploads.items.length >= MAX_FORUM_PHOTOS;
  return (
    <div className="space-y-2">
      {uploads.items.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Eklenen fotoğraflar">
          {uploads.items.map((p, i) => (
            <li key={p.key} className="relative size-24 overflow-hidden rounded-xl border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- a local preview (blob: URL) */}
              <img src={p.preview} alt="" className={`size-full object-cover ${p.state === "done" ? "" : "opacity-60"}`} />
              {p.state === "uploading" && (
                <span className="absolute inset-0 flex items-center justify-center" role="status" aria-label={`Fotoğraf ${i + 1} yükleniyor`}>
                  <SpinnerGapIcon aria-hidden="true" weight="bold" className="size-7 animate-spin text-white drop-shadow" />
                </span>
              )}
              {p.state === "error" && (
                <span className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-destructive px-1.5 py-0.5 text-xs font-semibold text-white" role="alert">
                  <WarningCircleIcon aria-hidden="true" weight="fill" className="size-3.5" />
                  Yüklenemedi
                </span>
              )}
              <button
                type="button"
                onClick={() => uploads.remove(p.key)}
                aria-label={`Fotoğraf ${i + 1}: kaldır`}
                className="absolute right-1 top-1 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/80"
              >
                <XIcon aria-hidden="true" weight="bold" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {!full && (
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-border px-4 font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-secondary has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring/30">
          <input
            ref={input}
            id={id}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={async (e) => {
              await uploads.add(e.target.files);
              if (input.current) input.current.value = "";
            }}
          />
          <ImageIcon aria-hidden="true" weight="duotone" className="size-5 text-primary" />
          Fotoğraf ekle
          <span className="font-normal text-muted-foreground">
            ({uploads.items.length}/{MAX_FORUM_PHOTOS})
          </span>
        </label>
      )}
    </div>
  );
}
