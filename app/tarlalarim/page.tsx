import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CalendarBlankIcon, CaretRightIcon, CheckCircleIcon, MapPinIcon, PlantIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { SignInPrompt } from "@/components/tool/SignInPrompt";
import { AddField } from "@/components/farm/FieldControls";
import { ensureProfile, getUserId } from "@/lib/auth";
import { tonsLabel } from "@/lib/farm";
import { listFields } from "@/lib/farm-data";
import { formatPrice, placeLabel } from "@/lib/market";
import { dayTitle, trDayKey } from "@/lib/tr-time";
import { requestNow } from "@/lib/now";

export const metadata: Metadata = {
  title: "Tarlalarım",
  description: "Tarlalarınızı, ürünlerinizi ve sezon masraflarınızı tek yerde tutun; dönüm başı maliyetinizi görün.",
};

const area = (n: number) => `${n.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} dönüm`;

export default function FieldsPage({ searchParams }: PageProps<"/tarlalarim">) {
  return (
    <>
      <ToolHeader eyebrow="Çiftliğim" title="Tarlalarım" intro="Tarlalarınızı ve bu sezonki masraflarınızı kaydedin; toplam alanı, harcamayı ve beklenen verimi bir bakışta görün." />
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-6">
        <Suspense fallback={<div aria-hidden="true" className="h-96 rounded-lg bg-muted motion-safe:animate-pulse" />}>
          <Fields searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Fields({ searchParams }: { searchParams: PageProps<"/tarlalarim">["searchParams"] }) {
  const sp = await searchParams;
  const userId = await getUserId();
  if (!userId) {
    return (
      <SignInPrompt returnTo="/tarlalarim" title="Tarlalarınızı kaydetmek için giriş yapın">
        Tarlalarınız, masraflarınız ve notlarınız hesabınıza kaydedilir; yalnızca siz görürsünüz.
      </SignInPrompt>
    );
  }
  const profile = await ensureProfile(userId);
  const today = trDayKey(await requestNow());
  const fields = await listFields(userId, today);
  const totals = {
    area: fields.reduce((n, f) => n + f.areaDonum, 0),
    expenses: fields.reduce((n, f) => n + f.expenses, 0),
    yieldKg: fields.reduce((n, f) => n + (f.expectedYieldKg ?? 0), 0),
  };

  return (
    <div className="space-y-8">
      {sp.silindi === "1" && (
        <p role="status" className="flex items-center gap-2 rounded-lg border border-primary/30 bg-secondary px-4 py-3 font-semibold">
          <CheckCircleIcon aria-hidden="true" weight="fill" className="size-6 text-primary" />
          Tarla silindi.
        </p>
      )}

      {fields.length > 0 && (
        <dl className="grid gap-3 sm:grid-cols-3">
          {[
            ["Toplam alan", area(totals.area)],
            ["Sezon masrafı", formatPrice(Math.round(totals.expenses))],
            ["Beklenen verim", totals.yieldKg ? tonsLabel(totals.yieldKg) : "Girilmedi"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border p-4 bg-card">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-xl font-bold tracking-tight">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {fields.length === 0 ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-dashed border-input px-4 py-3 text-center">
            <PlantIcon aria-hidden="true" weight="duotone" className="mx-auto size-12 text-primary" />
            <p className="mx-auto mt-3 max-w-md text-lg">Henüz tarla eklemediniz. İlk tarlanızı ekleyin; masraflarını ve işlerini ona bağlayın.</p>
          </div>
          <AddField defaultProvince={profile.province} open />
        </div>
      ) : (
        <>
          <ul className="grid gap-4 md:grid-cols-2">
            {fields.map((f) => (
              <li key={f.id}>
                <Link href={`/tarlalarim/${f.id}`} className="group flex h-full items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-secondary bg-card">
                  <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary group-hover:bg-card">
                    <PlantIcon weight="duotone" className="size-7" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xl font-bold">{f.name}</span>
                    <span className="block text-muted-foreground">{[f.crop, f.stage, area(f.areaDonum)].filter(Boolean).join(" · ")}</span>
                    {(f.province || f.district) && (
                      <span className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPinIcon aria-hidden="true" weight="fill" className="size-4" />
                        {placeLabel(f.province, f.district)}
                      </span>
                    )}
                    <span className="mt-3 block font-semibold">Masraf: {formatPrice(Math.round(f.expenses))}</span>
                    {f.nextTask && (
                      <span className="mt-1 flex items-center gap-1.5 text-sm">
                        <CalendarBlankIcon aria-hidden="true" weight="duotone" className="size-4 text-primary" />
                        Sıradaki iş: {f.nextTask.title}, {dayTitle(f.nextTask.date)}
                      </span>
                    )}
                  </span>
                  <CaretRightIcon aria-hidden="true" weight="bold" className="mt-1 size-5 shrink-0 text-primary" />
                </Link>
              </li>
            ))}
          </ul>
          <AddField defaultProvince={profile.province} />
        </>
      )}
    </div>
  );
}
