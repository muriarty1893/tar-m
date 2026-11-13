import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { listAdminLog, type AdminLogEntry } from "@/lib/services/admin-log";
import { requestNow } from "@/lib/now";
import { agoLabel } from "@/lib/tr-time";

export const metadata: Metadata = { title: "Kayıtlar · Yönetim", robots: { index: false } };

const TYPE_LABEL: Record<AdminLogEntry["targetType"], string> = {
  konu: "Konu",
  yanıt: "Yanıt",
  ilan: "İlan",
  haber: "Haber",
  kategori: "Kategori",
  üye: "Üye",
  reklam: "Reklam",
  "haber-kaynakları": "Haber kaynakları",
};

/** Where an entry's subject can still be opened; nothing for things that were deleted. */
function targetHref(e: AdminLogEntry): string | null {
  if (!e.targetId || /sildi/.test(e.action)) return null;
  switch (e.targetType) {
    case "konu":
    case "yanıt":
      return `/forum/${e.targetId}`;
    case "ilan":
      return `/pazar/ilan/${e.targetId}`;
    case "haber":
      return `/yonetim/haberler/${e.targetId}`;
    case "kategori":
      return "/yonetim/forum";
    case "reklam":
      return "/yonetim/reklam";
    default:
      return null;
  }
}

export default function AdminLogPage() {
  return (
    <AdminShell section="kayitlar" title="Kayıtlar" intro="Yöneticilerin yaptıkları, en yenisi üstte: silinen ve düzenlenen içerik, askıya alınan üyeler, haber ve reklam değişiklikleri. Son 200 kayıt.">
      <Suspense fallback={<AdminSkeleton />}>
        <Log />
      </Suspense>
    </AdminShell>
  );
}

async function Log() {
  await requireAdmin("/yonetim/kayitlar");
  const [entries, now] = await Promise.all([listAdminLog(200), requestNow()]);
  if (!entries.length) {
    return (
      <div className="rounded-md border border-dashed border-input bg-card px-4 py-6 text-center">
        <ClockCounterClockwiseIcon aria-hidden="true" weight="duotone" className="mx-auto size-10 text-primary" />
        <p className="mt-2 text-[15px]">Henüz kayıt yok.</p>
        <p className="text-[13px] text-muted-foreground">Bir yönetici içerik silip düzenlediğinde, bir üyeyi askıya aldığında ya da haber ve reklam değiştirdiğinde burada görünür.</p>
      </div>
    );
  }
  return (
    <ol className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card text-[13px] leading-[1.45]">
      {entries.map((e) => {
        const href = targetHref(e);
        return (
          <li key={e.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-3 py-2">
            <time dateTime={e.at} title={new Date(e.at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })} className="w-24 shrink-0 font-borsa-mono text-[12px] text-muted-foreground">
              {agoLabel(new Date(e.at), now)}
            </time>
            <span className="font-semibold">{e.adminName}</span>
            <span>{e.action.toLocaleLowerCase("tr")}</span>
            <span className="rounded bg-muted px-1.5 text-[11px] font-semibold leading-5 text-muted-foreground">{TYPE_LABEL[e.targetType] ?? e.targetType}</span>
            {e.summary &&
              (href ? (
                <Link href={href} className="min-w-0 truncate text-primary underline-offset-4 hover:underline">
                  {e.summary}
                </Link>
              ) : (
                <span className="min-w-0 truncate text-muted-foreground">{e.summary}</span>
              ))}
          </li>
        );
      })}
    </ol>
  );
}
