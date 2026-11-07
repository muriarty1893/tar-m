import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AtIcon, BellIcon, ChatsTeardropIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { Avatar } from "@/components/market/Avatar";
import { buttonVariants } from "@/components/ui/button";
import { requireUserId } from "@/lib/auth";
import { requestNow } from "@/lib/now";
import { listNotifications, type Notification } from "@/lib/services/notifications";
import { agoLabel } from "@/lib/tr-time";
import { MarkRead } from "./MarkRead";

export const metadata: Metadata = { title: "Bildirimler", robots: { index: false } };

export default function NotificationsPage() {
  return (
    <>
      <ToolHeader eyebrow="Forum" title="Bildirimler" intro="Konularınıza ve yanıtlarınıza gelen yanıtlar, sizden bahsedenler (@kullanıcıadınız)." />
      <div className="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-6">
        <Suspense fallback={<div aria-hidden="true" className="h-96 rounded-lg bg-muted motion-safe:animate-pulse" />}>
          <List />
        </Suspense>
      </div>
    </>
  );
}

const what = (n: Notification) => (n.kind === "mention" ? "sizden bahsetti" : n.replyId ? "size yanıt verdi" : "konunuza yanıt verdi");

async function List() {
  const userId = await requireUserId("/bildirimler");
  const [items, now] = await Promise.all([listNotifications(userId), requestNow()]);
  const unread = items.filter((n) => !n.read).length;

  if (!items.length) {
    return (
      <div className="rounded-md border border-dashed border-input bg-card px-4 py-6 text-center">
        <BellIcon aria-hidden="true" weight="duotone" className="mx-auto size-9 text-primary" />
        <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-muted-foreground">Henüz bildirim yok. Biri konunuza ya da yanıtınıza yanıt verdiğinde, ya da sizden bahsettiğinde burada görünür.</p>
        <Link href="/forum" className={buttonVariants({ size: "sm", className: "mt-4" })}>
          Foruma git
        </Link>
      </div>
    );
  }

  return (
    <>
      <MarkRead unread={unread} />
      {unread > 0 && (
        <p role="status" className="mb-4 font-semibold text-primary">
          {unread} yeni bildirim
        </p>
      )}
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {items.map((n) => {
          const Icon = n.kind === "mention" ? AtIcon : ChatsTeardropIcon;
          return (
            <li key={n.id}>
              <Link
                href={`/forum/${n.topicId}${n.replyId ? `#yanit-${n.replyId}` : ""}`}
                className={`flex gap-3 px-4 py-3 transition-colors hover:bg-secondary focus-visible:outline-offset-[-3px] ${n.read ? "" : "bg-secondary/60"}`}
              >
                <span className="relative">
                  <Avatar id={n.actorHandle ?? n.actorName} name={n.actorName} size={44} />
                  <span aria-hidden="true" className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-md border border-card bg-primary text-primary-foreground">
                    <Icon weight="bold" className="size-3.5" />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block">
                    <span className="font-semibold">{n.actorName}</span> {what(n)}
                    {!n.read && <span className="sr-only"> (yeni)</span>}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-muted-foreground">{n.topicTitle}</span>
                  {n.excerpt && <span className="mt-1 line-clamp-2 block">“{n.excerpt}”</span>}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">{agoLabel(new Date(n.createdAt), now)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
