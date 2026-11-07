import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { openReports } from "@/lib/services/admin";
import { agoLabel } from "@/lib/tr-time";
import { moderate, moderateForum } from "../actions";
import { openForumReports } from "@/lib/services/forum";
import { requestNow } from "@/lib/now";

export const metadata: Metadata = { title: "Şikâyetler · Yönetim", robots: { index: false } };

export default function ReportsPage() {
  return (
    <AdminShell section="sikayetler" title="Şikâyetler" intro="Açık şikâyetler: önce ilanlar, sonra forum yazıları; en çok şikâyet alan önce.">
      <Suspense fallback={<AdminSkeleton />}>
        <h2 className="mb-2 text-[15px] font-bold">İlanlar</h2>
        <Reports />
        <h2 id="forum" className="mb-2 mt-5 scroll-mt-24 text-[15px] font-bold">Forum</h2>
        <ForumReports />
      </Suspense>
    </AdminShell>
  );
}

async function Reports() {
  await requireAdmin("/yonetim/sikayetler");
  const rows = await openReports();
  const now = await requestNow();
  if (!rows.length) return <p className="rounded-md border border-border bg-card px-4 py-3 text-[0.9375rem] text-muted-foreground">Açık şikâyet yok.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => {
        const id = r.id;
        return (
          <li key={id} className="rounded-lg border border-border p-4 bg-card">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <Link href={`/pazar/ilan/${id}`} className="text-base font-bold text-primary underline-offset-4 hover:underline">
                {r.title}
              </Link>
              <span className="text-muted-foreground">
                {r.count} şikâyet · son {agoLabel(new Date(r.lastAt), now)}
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">
              Satıcı: {r.sellerName} · Durum: {r.status}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              {r.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
              {r.notes.map((note, i) => (
                <li key={i} className="text-muted-foreground">
                  “{note}”
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <form action={moderate.bind(null, id, "remove")}>
                <Button type="submit" className="bg-destructive hover:bg-[color-mix(in_oklab,var(--destructive),black_12%)]">
                  İlanı kaldır
                </Button>
              </form>
              <form action={moderate.bind(null, id, "dismiss")}>
                <Button type="submit" variant="outline">
                  Şikâyetleri kapat
                </Button>
              </form>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

async function ForumReports() {
  await requireAdmin("/yonetim/sikayetler");
  const rows = await openForumReports();
  const now = await requestNow();
  if (!rows.length) return <p className="rounded-md border border-border bg-card px-4 py-3 text-[0.9375rem] text-muted-foreground">Açık şikâyet yok.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={`${r.topicId}-${r.replyId ?? "konu"}`} className="rounded-lg border border-border p-4 bg-card">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <Link href={`/forum/${r.topicId}${r.replyId ? `#yanit-${r.replyId}` : ""}`} className="text-base font-bold text-primary underline-offset-4 hover:underline">
              {r.replyId ? `Yanıt: ${r.topicTitle}` : r.topicTitle}
            </Link>
            <span className="text-muted-foreground">
              {r.count} şikâyet · son {agoLabel(new Date(r.lastAt), now)}
            </span>
          </div>
          <p className="mt-1 text-muted-foreground">Yazan: {r.authorName}</p>
          <blockquote className="mt-3 whitespace-pre-line border-l-4 border-border pl-4">{r.text}</blockquote>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            {r.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
            {r.notes.map((note, i) => (
              <li key={i} className="text-muted-foreground">
                “{note}”
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <form action={moderateForum.bind(null, r.topicId, r.replyId, "remove")}>
              <Button type="submit" className="bg-destructive hover:bg-[color-mix(in_oklab,var(--destructive),black_12%)]">
                {r.replyId ? "Yanıtı sil" : "Konuyu sil"}
              </Button>
            </form>
            <form action={moderateForum.bind(null, r.topicId, r.replyId, "dismiss")}>
              <Button type="submit" variant="outline">
                Şikâyetleri kapat
              </Button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
