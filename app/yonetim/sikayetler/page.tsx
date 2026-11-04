import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { openReports } from "@/lib/services/admin";
import { agoLabel } from "@/lib/tr-time";
import { moderate } from "../actions";
import { requestNow } from "@/lib/now";

export const metadata: Metadata = { title: "Şikâyetler · Yönetim", robots: { index: false } };

export default function ReportsPage() {
  return (
    <AdminShell section="sikayetler" title="Şikâyet edilen ilanlar" intro="Açık şikâyetler, en çok şikâyet alan ilan önce.">
      <Suspense fallback={<AdminSkeleton />}>
        <Reports />
      </Suspense>
    </AdminShell>
  );
}

async function Reports() {
  await requireAdmin("/yonetim/sikayetler");
  const rows = await openReports();
  const now = await requestNow();
  if (!rows.length) return <p className="text-lg">Açık şikâyet yok.</p>;
  return (
    <ul className="space-y-4">
      {rows.map((r) => {
        const id = r.id;
        return (
          <li key={id} className="rounded-2xl border border-border p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <Link href={`/pazar/ilan/${id}`} className="text-lg font-bold text-primary underline-offset-4 hover:underline">
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
