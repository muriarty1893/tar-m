import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ChatsCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { buttonVariants } from "@/components/ui/button";
import { requireUserId } from "@/lib/auth";
import { listInbox, type ChatRole } from "@/lib/chat-data";
import { agoLabel } from "@/lib/tr-time";
import { requestNow } from "@/lib/now";

export const metadata: Metadata = { title: "Mesajlar", robots: { index: false } };

const TABS: { id: "" | "alis" | "satis"; label: string; role: ChatRole | "all" }[] = [
  { id: "", label: "Tümü", role: "all" },
  { id: "alis", label: "Alıyorum", role: "buyer" },
  { id: "satis", label: "Satıyorum", role: "seller" },
];

export default function InboxPage({ searchParams }: PageProps<"/mesajlar">) {
  return (
    <>
      <ToolHeader eyebrow="Pazar" title="Mesajlar" intro="İlanlar hakkındaki bütün sohbetleriniz. Yeni mesajlar kalın yazılır." />
      <div className="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-6">
        <Suspense fallback={<InboxSkeleton />}>
          <Inbox searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Inbox({ searchParams }: { searchParams: PageProps<"/mesajlar">["searchParams"] }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.id === sp.rol) ?? TABS[0];
  const userId = await requireUserId("/mesajlar");
  const rows = await listInbox(userId, tab.role);
  const now = await requestNow();

  return (
    <div className="space-y-6">
      <nav aria-label="Sohbet türü" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.id ? `/mesajlar?rol=${t.id}` : "/mesajlar"}
            aria-current={t.id === tab.id ? "page" : undefined}
            className="inline-flex min-h-11 items-center rounded-md border border-border px-4 font-semibold transition-colors hover:border-primary/50 aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground bg-card"
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-input px-4 py-6 text-center">
          <ChatsCircleIcon aria-hidden="true" weight="duotone" className="mx-auto size-12 text-primary" />
          <p className="mx-auto mt-3 max-w-md text-lg">
            {tab.role === "seller" ? "İlanlarınıza henüz mesaj gelmedi." : "Henüz bir sohbetiniz yok. Beğendiğiniz bir ilanda “Satıcıya mesaj gönder”e dokunun."}
          </p>
          <Link href="/pazar" className={buttonVariants({ className: "mt-6" })}>
            Pazara göz at
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/mesajlar/${r.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary focus-visible:outline-offset-[-3px]">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image src={r.listingPhoto} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className={`truncate text-lg ${r.unread ? "font-bold" : "font-semibold"}`}>{r.peerName}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">{agoLabel(new Date(r.lastAt), now)}</span>
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {r.role === "buyer" ? "Alıyorum" : "Satıyorum"} · {r.listingTitle}
                    {r.listingStatus === "sold" ? " · Satıldı" : r.listingStatus === "removed" ? " · Kaldırıldı" : ""}
                  </span>
                  <span className={`mt-0.5 block truncate ${r.unread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{r.lastLine}</span>
                </span>
                {r.unread > 0 && (
                  <span className="flex min-w-7 shrink-0 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-sm font-bold text-primary-foreground">
                    <span aria-hidden="true">{r.unread}</span>
                    <span className="sr-only">{r.unread} okunmamış mesaj</span>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InboxSkeleton() {
  return (
    <ul aria-hidden="true" className="space-y-3">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="flex gap-4 rounded-lg border border-border p-4 bg-card">
          <span className="size-16 rounded-xl bg-muted motion-safe:animate-pulse" />
          <span className="flex-1 space-y-2">
            <span className="block h-5 w-1/3 rounded bg-muted" />
            <span className="block h-4 w-2/3 rounded bg-muted" />
          </span>
        </li>
      ))}
    </ul>
  );
}
