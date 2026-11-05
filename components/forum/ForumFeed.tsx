"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowClockwiseIcon, CaretDownIcon, ChatsTeardropIcon, SpinnerGapIcon } from "@phosphor-icons/react/dist/ssr";
import { TopicRow } from "@/components/forum/TopicRow";
import { buttonVariants } from "@/components/ui/button";
import type { ForumCats, ForumSort } from "@/lib/forum";
import type { TopicCard } from "@/lib/forum-data";

const TABS: { id: ForumSort; label: string }[] = [
  { id: "yeni", label: "Son konular" },
  { id: "aktif", label: "Son yanıtlar" },
  { id: "populer", label: "Popüler" },
];

type Feed = { items: TopicCard[]; total: number; page: number; state: "idle" | "loading" | "error" };

/**
 * A list of topics that grows in place, as on r10.net: "Daha fazla göster" adds the next page under
 * the last row (from the public forum API). With `tabs`, three orders to switch between; each is
 * fetched the first time it's opened, then kept.
 */
export function ForumFeed({
  initial,
  sort = "yeni",
  kategori = "",
  q = "",
  cats,
  now,
  tabs = false,
  emptyText = "Henüz konu yok. İlk konuyu siz açın!",
  label = "Konular",
}: {
  initial: { items: TopicCard[]; total: number };
  sort?: ForumSort;
  kategori?: string;
  q?: string;
  cats: ForumCats;
  /** The server's time (ISO), so "3 saat önce" reads the same before and after the page wakes up. */
  now: string;
  tabs?: boolean;
  emptyText?: string;
  label?: string;
}) {
  const [active, setActive] = useState<ForumSort>(sort);
  const [feeds, setFeeds] = useState<Partial<Record<ForumSort, Feed>>>({ [sort]: { ...initial, page: 1, state: "idle" } });
  const [announce, setAnnounce] = useState("");
  const clock = new Date(now);
  const feed = feeds[active];

  async function load(which: ForumSort, page: number) {
    setFeeds((f) => ({ ...f, [which]: { items: f[which]?.items ?? [], total: f[which]?.total ?? 0, page: f[which]?.page ?? 0, state: "loading" } }));
    const params = new URLSearchParams({ sirala: which, sayfa: String(page) });
    if (kategori) params.set("kategori", kategori);
    if (q) params.set("q", q);
    try {
      const res = await fetch(`/api/app/forum?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { items: TopicCard[]; total: number };
      setFeeds((f) => {
        // A topic opened meanwhile shifts the pages by one: skip what's already listed.
        const before = page === 1 ? [] : (f[which]?.items ?? []);
        const seen = new Set(before.map((t) => t.id));
        return { ...f, [which]: { items: [...before, ...data.items.filter((t) => !seen.has(t.id))], total: data.total, page, state: "idle" } };
      });
      if (page > 1) setAnnounce(data.items.length ? `${data.items.length} konu daha gösteriliyor.` : "Gösterilecek başka konu yok.");
    } catch {
      setFeeds((f) => ({ ...f, [which]: { ...(f[which] as Feed), state: "error" } }));
    }
  }

  function pick(which: ForumSort) {
    setActive(which);
    if (!feeds[which]) void load(which, 1);
  }

  const more = feed && feed.items.length < feed.total;
  const firstLoad = !feed || (feed.state === "loading" && feed.items.length === 0);

  return (
    <div>
      {tabs && (
        <div role="group" aria-label="Sıralama" className="flex border-b border-border bg-card">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={active === t.id}
              onClick={() => pick(t.id)}
              className="relative min-h-12 flex-1 cursor-pointer px-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground aria-pressed:text-primary focus-visible:outline-offset-[-3px]"
            >
              {t.label}
              <span aria-hidden="true" className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full ${active === t.id ? "bg-primary" : "bg-transparent"}`} />
            </button>
          ))}
        </div>
      )}

      {firstLoad ? (
        <ul aria-hidden="true" className="divide-y divide-border bg-card">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="flex gap-3 px-4 py-3.5">
              <span className="size-[38px] shrink-0 rounded-full bg-muted" />
              <span className="flex-1 space-y-2">
                <span className="block h-4 w-4/5 rounded bg-muted motion-safe:animate-pulse" />
                <span className="block h-3 w-1/2 rounded bg-muted" />
              </span>
            </li>
          ))}
        </ul>
      ) : feed.items.length === 0 && feed.state !== "error" ? (
        <div className="bg-card px-6 py-10 text-center">
          <ChatsTeardropIcon aria-hidden="true" weight="duotone" className="mx-auto size-10 text-primary" />
          <p className="mx-auto mt-2 max-w-sm">{emptyText}</p>
        </div>
      ) : (
        <ul aria-label={tabs ? TABS.find((t) => t.id === active)?.label : label} className="divide-y divide-border bg-card">
          {feed.items.map((t) => (
            <TopicRow key={t.id} topic={t} cats={cats} now={clock} showLastReply={active === "aktif"} />
          ))}
        </ul>
      )}

      {feed?.state === "error" && (
        <p role="alert" className="flex flex-wrap items-center justify-center gap-3 border-t border-border bg-card px-4 py-4 text-center">
          Konular yüklenemedi.
          <button type="button" onClick={() => load(active, feed.items.length ? feed.page + 1 : 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ArrowClockwiseIcon aria-hidden="true" weight="bold" />
            Tekrar dene
          </button>
        </p>
      )}

      {feed && feed.state !== "error" && more && (
        <div className="border-t border-border bg-card p-3">
          <button
            type="button"
            onClick={() => load(active, feed.page + 1)}
            disabled={feed.state === "loading"}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-secondary font-semibold text-primary transition-colors hover:bg-[color-mix(in_oklab,var(--secondary),var(--primary)_10%)] disabled:cursor-wait disabled:opacity-80"
          >
            {feed.state === "loading" ? (
              <>
                <SpinnerGapIcon aria-hidden="true" weight="bold" className="size-5 motion-safe:animate-spin" />
                Yükleniyor…
              </>
            ) : (
              <>
                Daha fazla göster
                <CaretDownIcon aria-hidden="true" weight="bold" className="size-4" />
              </>
            )}
          </button>
        </div>
      )}
      {feed && !more && feed.items.length > 0 && feed.page > 1 && (
        <p className="border-t border-border bg-card px-4 py-3 text-center text-sm text-muted-foreground">Hepsi bu kadar.</p>
      )}
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </div>
  );
}

/** "Tüm konular" under a feed that only shows the start. */
export function AllTopicsLink({ href = "/forum" }: { href?: string }) {
  return (
    <Link href={href} className="flex min-h-12 items-center justify-center border-t border-border bg-card text-sm font-semibold text-primary underline-offset-4 hover:underline">
      Forumun tamamı
    </Link>
  );
}
