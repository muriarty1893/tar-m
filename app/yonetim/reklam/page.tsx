import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { SlotEditor } from "@/components/admin/SlotEditor";
import { requireAdmin } from "@/lib/auth";
import { getSlots } from "@/lib/site-slots";

export const metadata: Metadata = { title: "Reklam alanları · Yönetim", robots: { index: false } };

export default function SlotsPage() {
  return (
    <AdminShell section="reklam" title="Reklam alanları" intro="Ana sayfadaki sponsor şeridi ve “reklam verin” kutusu. Kaydettiğinizde ana sayfada hemen görünür.">
      <Suspense fallback={<AdminSkeleton />}>
        <Slots />
      </Suspense>
    </AdminShell>
  );
}

async function Slots() {
  await requireAdmin("/yonetim/reklam");
  const { sponsor, reklam } = await getSlots();
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <SlotEditor slot={sponsor} />
      <SlotEditor slot={reklam} />
    </div>
  );
}
