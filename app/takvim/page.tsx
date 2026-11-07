import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { WeatherTile } from "@/components/home/WeatherTile";
import { SignInPrompt } from "@/components/tool/SignInPrompt";
import { TaskForm } from "@/components/farm/TaskForm";
import { TaskItem } from "@/components/farm/TaskItem";
import { KIND_STYLE } from "@/components/farm/task-style";
import { getUserId } from "@/lib/auth";
import { WEEKDAY_LONG, WEEKDAY_SHORT, daysIn, dayKeyOf, monthGrid, monthKey, monthTitle, parseMonth, shiftMonth, type MonthRef } from "@/lib/farm";
import { fieldOptions, tasksBetween, upcomingTasks, type Task } from "@/lib/farm-data";
import { addDaysKey, dayTitle, trDayKey, weekdayOf } from "@/lib/tr-time";
import { requestNow } from "@/lib/now";

export const metadata: Metadata = {
  title: "Tarım takvimi",
  description: "Ekim, gübreleme, ilaçlama, sulama ve hasat işlerinizi takvimde planlayın; yaptıklarınızı işaretleyin.",
};

export default function CalendarPage({ searchParams }: PageProps<"/takvim">) {
  return (
    <>
      <ToolHeader eyebrow="Planlama" title="Tarım takvimi" intro="Tarladaki işlerinizi gün gün planlayın, yaptıklarınızı işaretleyin. Bir işi tarlanıza bağlarsanız tarla sayfasında da görünür." />
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-6">
        {/* Today's weather sits on top of the calendar. */}
        <div className="mb-4 xl:hidden">
          <WeatherTile wide />
        </div>
        <Suspense fallback={<div aria-hidden="true" className="h-[32rem] rounded-lg bg-muted motion-safe:animate-pulse" />}>
          <Calendar searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

const href = (ref: MonthRef, day?: string) => `/takvim?ay=${monthKey(ref)}${day ? `&gun=${day}` : ""}`;

async function Calendar({ searchParams }: { searchParams: PageProps<"/takvim">["searchParams"] }) {
  const sp = await searchParams;
  const userId = await getUserId();
  if (!userId) {
    return (
      <SignInPrompt returnTo="/takvim" title="Takviminizi kaydetmek için giriş yapın">
        Takvim hesabınıza kaydedilir: telefondan da bilgisayardan da aynı işleri görürsünüz. Hesap ücretsizdir.
      </SignInPrompt>
    );
  }

  const today = trDayKey(await requestNow());
  const gun = typeof sp.gun === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.gun) ? sp.gun : "";
  const ref = parseMonth(typeof sp.ay === "string" ? sp.ay : gun.slice(0, 7), today);
  const first = dayKeyOf(ref, 1);
  const last = dayKeyOf(ref, daysIn(ref));
  // The chosen day, else today if it's in this month, else the 1st.
  const selected = gun >= first && gun <= last ? gun : today >= first && today <= last ? today : first;

  const [tasks, upcoming, fields] = await Promise.all([tasksBetween(userId, first, last), upcomingTasks(userId, today, 8), fieldOptions(userId)]);
  const byDay = new Map<string, Task[]>();
  for (const t of tasks) byDay.set(t.date, [...(byDay.get(t.date) ?? []), t]);
  const dayTasks = byDay.get(selected) ?? [];
  const weekEnd = addDaysKey(today, 7);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
      <section aria-labelledby="ay-baslik" className="rounded-lg border border-border p-4 sm:p-5 bg-card">
        <div className="flex items-center justify-between gap-3">
          <Link href={href(shiftMonth(ref, -1))} aria-label="Önceki ay" className="flex size-12 items-center justify-center rounded-md border border-border hover:border-primary/50 bg-card">
            <CaretLeftIcon aria-hidden="true" weight="bold" className="size-5" />
          </Link>
          <h2 id="ay-baslik" className="text-xl font-bold tracking-tight">
            {monthTitle(ref)}
          </h2>
          <Link href={href(shiftMonth(ref, 1))} aria-label="Sonraki ay" className="flex size-12 items-center justify-center rounded-md border border-border hover:border-primary/50 bg-card">
            <CaretRightIcon aria-hidden="true" weight="bold" className="size-5" />
          </Link>
        </div>
        <table className="mt-4 w-full table-fixed border-separate border-spacing-1">
          <caption className="sr-only">{monthTitle(ref)}: işler gün gün. Bir güne dokunun, işleri altta görün.</caption>
          <thead>
            <tr>
              {WEEKDAY_SHORT.map((d, i) => (
                <th key={d} scope="col" className="pb-1 text-sm font-semibold text-muted-foreground">
                  <abbr title={WEEKDAY_LONG[i]} className="no-underline">
                    {d}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthGrid(ref).map((week, w) => (
              <tr key={w}>
                {week.map((key, i) => {
                  if (!key) return <td key={i} />;
                  const list = byDay.get(key) ?? [];
                  const open = list.filter((t) => !t.done).length;
                  const isToday = key === today;
                  const isSelected = key === selected;
                  return (
                    <td key={key} className="p-0">
                      <Link
                        href={href(ref, key)}
                        aria-current={isToday ? "date" : undefined}
                        aria-label={`${dayTitle(key)}${list.length ? `, ${list.length} iş` : ""}${isSelected ? ", seçili" : ""}`}
                        className={`flex aspect-square min-h-11 flex-col items-center justify-center gap-1 rounded-xl text-lg font-semibold transition-colors ${
                          isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-secondary text-primary ring-2 ring-primary/40" : "hover:bg-secondary"
                        }`}
                      >
                        {Number(key.slice(8))}
                        <span aria-hidden="true" className="flex h-1.5 gap-0.5">
                          {list.slice(0, 3).map((t) => (
                            <span key={t.id} className={`size-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : KIND_STYLE[t.kind].dot} ${t.done ? "opacity-40" : ""}`} />
                          ))}
                        </span>
                      </Link>
                      {open > 0 && <span className="sr-only">{open} yapılmamış</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {(today < first || today > last || selected !== today) && (
          <Link href={href(parseMonth(undefined, today), today)} className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">
            Bugüne dön
          </Link>
        )}
      </section>

      <div className="space-y-8">
        <section aria-labelledby="gun-baslik">
          <h2 id="gun-baslik" className="text-xl font-bold tracking-tight">
            {dayTitle(selected)}
            {selected === today && <span className="ml-2 text-base font-semibold text-primary">Bugün</span>}
          </h2>
          {dayTasks.length ? (
            <ul className="mt-4 space-y-2">
              {dayTasks.map((t) => (
                <TaskItem key={t.id} task={t} />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted-foreground">Bu gün için iş yok.</p>
          )}
        </section>

        <section aria-labelledby="ekle-baslik" className="rounded-lg border border-border p-4 bg-card">
          <h2 id="ekle-baslik" className="text-xl font-bold">
            İş ekle
          </h2>
          <div className="mt-4">
            <TaskForm key={selected} date={selected} fields={fields} />
          </div>
        </section>
      </div>

      <section aria-labelledby="yaklasan" className="lg:col-span-2">
        <h2 id="yaklasan" className="text-xl font-bold tracking-tight">
          Yaklaşan işler
        </h2>
        {upcoming.length ? (
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {upcoming.map((t) => (
              <TaskItem key={t.id} task={t} showDate={t.date === today ? "Bugün" : t.date === addDaysKey(today, 1) ? "Yarın" : t.date <= weekEnd ? WEEKDAY_LONG[(weekdayOf(t.date) + 6) % 7] : dayTitle(t.date)} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-muted-foreground">Yaklaşan bir işiniz yok. Takvimden bir gün seçip iş ekleyin.</p>
        )}
      </section>
    </div>
  );
}
