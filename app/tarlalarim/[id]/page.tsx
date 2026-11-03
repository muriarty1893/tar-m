import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { ExpenseForm } from "@/components/farm/ExpenseForm";
import { DeleteExpenseButton, FieldActions } from "@/components/farm/FieldControls";
import { TaskItem } from "@/components/farm/TaskItem";
import { requireUserId } from "@/lib/auth";
import { EXPENSE_KINDS, expensesByKind, tonsLabel } from "@/lib/farm";
import { getField, upcomingTasks } from "@/lib/farm-data";
import { formatPrice, placeLabel } from "@/lib/market";
import { dayTitle, longDate, trDayKey } from "@/lib/tr-time";
import { requestNow } from "@/lib/now";

export const metadata: Metadata = { title: "Tarla", robots: { index: false } };

export default function FieldPage({ params }: PageProps<"/tarlalarim/[id]">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/tarlalarim" className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline">
        <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-5" />
        Tarlalarım
      </Link>
      <Suspense fallback={<div aria-hidden="true" className="mt-4 h-96 rounded-2xl bg-muted motion-safe:animate-pulse" />}>
        <FieldDetail params={params} />
      </Suspense>
    </div>
  );
}

async function FieldDetail({ params }: { params: PageProps<"/tarlalarim/[id]">["params"] }) {
  const { id } = await params;
  const userId = await requireUserId(`/tarlalarim/${id}`);
  const today = trDayKey(await requestNow());
  const data = await getField(id, userId, today);
  if (!data) notFound();
  const { field: f, expenses } = data;
  const tasks = await upcomingTasks(userId, today, 6, f.id);
  const byKind = expensesByKind(expenses);
  const max = byKind[0]?.amount ?? 0;
  const perDonum = f.areaDonum ? f.expenses / f.areaDonum : 0;

  return (
    <div className="mt-4 space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{f.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {[f.crop, f.stage, `${f.areaDonum.toLocaleString("tr-TR")} dönüm`, f.province || f.district ? placeLabel(f.province, f.district) : ""].filter(Boolean).join(" · ")}
        </p>
        {f.notes && <p className="mt-3 whitespace-pre-line text-lg">{f.notes}</p>}
        <div className="mt-5">
          <FieldActions
            fieldId={f.id}
            initial={{
              name: f.name,
              crop: f.crop,
              stage: f.stage,
              area: String(f.areaDonum).replace(".", ","),
              province: f.province,
              district: f.district,
              expectedYield: f.expectedYieldKg === null ? "" : String(f.expectedYieldKg).replace(".", ","),
              notes: f.notes,
            }}
          />
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        {[
          ["Sezon masrafı", formatPrice(Math.round(f.expenses))],
          ["Dönüm başı masraf", formatPrice(Math.round(perDonum))],
          ["Beklenen verim", f.expectedYieldKg ? tonsLabel(f.expectedYieldKg) : "Girilmedi"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border p-5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="masraflar" className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 id="masraflar" className="text-2xl font-bold tracking-tight">
            Masraflar
          </h2>
          {byKind.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {byKind.map((k) => (
                <li key={k.kind}>
                  <div className="flex justify-between gap-3 font-semibold">
                    <span>{EXPENSE_KINDS[k.kind]}</span>
                    <span className="tabular-nums">{formatPrice(Math.round(k.amount))}</span>
                  </div>
                  <div aria-hidden="true" className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, (k.amount / max) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted-foreground">Henüz masraf eklemediniz.</p>
          )}
          <div className="mt-6 rounded-2xl border border-border p-5">
            <h3 className="text-xl font-bold">Masraf ekle</h3>
            <div className="mt-4">
              <ExpenseForm fieldId={f.id} today={today} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kayıtlar</h2>
          {expenses.length ? (
            <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
              {expenses.map((x) => (
                <li key={x.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {EXPENSE_KINDS[x.kind]} · {formatPrice(x.amount)}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {longDate(x.date)}
                      {x.note && ` · ${x.note}`}
                    </p>
                  </div>
                  <DeleteExpenseButton id={x.id} label={`${EXPENSE_KINDS[x.kind]}, ${formatPrice(x.amount)}`} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted-foreground">Kayıt yok.</p>
          )}
        </div>
      </section>

      <section aria-labelledby="isler">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="isler" className="text-2xl font-bold tracking-tight">
            Yaklaşan işler
          </h2>
          <Link href="/takvim" className="font-semibold text-primary underline-offset-4 hover:underline">
            Takvime git
          </Link>
        </div>
        {tasks.length ? (
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {tasks.map((t) => (
              <TaskItem key={t.id} task={t} showDate={dayTitle(t.date)} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-muted-foreground">Bu tarla için planlanmış iş yok. Takvimde iş eklerken bu tarlayı seçin.</p>
        )}
      </section>
    </div>
  );
}
