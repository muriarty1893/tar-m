import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { iso, sql, str } from "@/lib/db";
import { REPORT_REASONS } from "@/lib/market";
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

const reasonLabel = (id: string) => REPORT_REASONS.find((r) => r.id === id)?.label ?? id;

async function Reports() {
  await requireAdmin("/yonetim/sikayetler");
  const rows = await sql()`
    select l.id, l.title, l.status, p.name as seller_name, count(r.id) as n, max(r.created_at) as last_at,
      array_agg(r.reason) as reasons, array_agg(r.note) filter (where r.note <> '') as notes
    from reports r join listings l on l.id = r.listing_id join profiles p on p.user_id = l.seller_id
    where r.resolved_at is null
    group by l.id, l.title, l.status, p.name
    order by count(r.id) desc, max(r.created_at) desc
    limit 100`;
  const now = await requestNow();
  if (!rows.length) return <p className="text-lg">Açık şikâyet yok.</p>;
  return (
    <ul className="space-y-4">
      {rows.map((r) => {
        const id = str(r.id);
        return (
          <li key={id} className="rounded-2xl border border-border p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <Link href={`/pazar/ilan/${id}`} className="text-lg font-bold text-primary underline-offset-4 hover:underline">
                {str(r.title)}
              </Link>
              <span className="text-muted-foreground">
                {Number(r.n)} şikâyet · son {agoLabel(new Date(iso(r.last_at)), now)}
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">
              Satıcı: {str(r.seller_name)} · Durum: {str(r.status)}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              {[...new Set((r.reasons as string[]) ?? [])].map((reason) => (
                <li key={reason}>{reasonLabel(reason)}</li>
              ))}
              {((r.notes as string[] | null) ?? []).map((note, i) => (
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
