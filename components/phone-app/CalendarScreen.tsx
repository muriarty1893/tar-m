"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  DropIcon,
  FirstAidKitIcon,
  FlaskIcon,
  GrainsIcon,
  PlantIcon,
  ShovelIcon,
  SnowflakeIcon,
  TractorIcon,

} from "@phosphor-icons/react/dist/ssr";
import { CALENDAR_MONTH, TASK_KINDS, daysInMonth, tasksOn, weekdayIndex, weekdayName, type TaskKind } from "@/data/farm-calendar";

const SpringCheck = dynamic(() => import("@/components/ui/spring-check").then((m) => m.SpringCheck), {
  ssr: false,
  loading: () => <span className="block min-h-11" />,
});

/** Each kind of task: its icon and colour (icon tile and the dot under the day). Labels say the kind too. */
const KIND_STYLE: Record<TaskKind, { Icon: typeof PlantIcon; tile: string; dot: string }> = {
  analiz: { Icon: FlaskIcon, tile: "bg-sky-100 text-sky-800", dot: "bg-sky-600" },
  toprak: { Icon: ShovelIcon, tile: "bg-amber-100 text-amber-900", dot: "bg-amber-700" },
  gubre: { Icon: PlantIcon, tile: "bg-secondary text-primary", dot: "bg-primary" },
  ilac: { Icon: FirstAidKitIcon, tile: "bg-violet-100 text-violet-800", dot: "bg-violet-600" },
  ekim: { Icon: GrainsIcon, tile: "bg-gold-soft text-gold", dot: "bg-gold" },
  sulama: { Icon: DropIcon, tile: "bg-blue-100 text-blue-800", dot: "bg-blue-600" },
  hasat: { Icon: TractorIcon, tile: "bg-orange-100 text-orange-900", dot: "bg-orange-600" },
  uyari: { Icon: SnowflakeIcon, tile: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

const WEEK = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

/** The app's "Takvim" tab: the month's farm tasks, a day at a time; tasks can be ticked off. */
export function CalendarScreen({ className }: { className: string }) {
  const { name, year, today } = CALENDAR_MONTH;
  const [day, setDay] = useState<number>(today);
  const days = Array.from({ length: daysInMonth() }, (_, i) => i + 1);
  const lead = weekdayIndex(1);
  const tasks = tasksOn(day);
  const month = `${name} ${year}`;
  const total = days.reduce((n, d) => n + tasksOn(d).length, 0);

  return (
    <div className={className}>
      <p className="mb-3 font-heading text-[22px] font-bold">Tarım takvimi</p>

      <div className="rounded-[22px] border border-border bg-card p-3">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <p className="font-heading text-[16px] font-bold">{month}</p>
          <p className="text-[12px] text-muted-foreground">{total} görev</p>
        </div>
        <div aria-hidden="true" className="grid grid-cols-7 pb-1 text-center text-[11px] font-semibold text-muted-foreground">
          {WEEK.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div role="group" aria-label={month} className="grid grid-cols-7 gap-y-0.5">
          {lead > 0 && <span aria-hidden="true" style={{ gridColumn: `span ${lead}` }} />}
          {days.map((d) => {
            const list = tasksOn(d);
            const picked = d === day;
            const isToday = d === today;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                aria-pressed={picked}
                aria-label={`${d} ${name} ${weekdayName(d)}${isToday ? ", bugün" : ""}, ${list.length ? `${list.length} görev` : "görev yok"}`}
                className={`relative mx-auto flex h-10 w-10 cursor-pointer flex-col items-center justify-center rounded-full text-[14px] font-semibold tabular-nums transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                  picked ? "bg-primary text-primary-foreground" : isToday ? "text-primary ring-2 ring-inset ring-primary" : "hover:bg-secondary active:bg-secondary"
                }`}
              >
                {d}
                {list.length > 0 && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {list.slice(0, 3).map((t, i) => (
                      <span key={i} className={`size-1 rounded-full ${picked ? "bg-primary-foreground" : KIND_STYLE[t.kind].dot}`} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-2 mt-4 font-heading text-[16px] font-bold">
        {day} {name} {weekdayName(day)}
        {day === today && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 align-middle text-[11px] text-primary">Bugün</span>}
      </p>
      {tasks.length === 0 ? (
        <p className="rounded-[18px] border border-dashed border-border px-4 py-5 text-center text-[13px] text-muted-foreground">
          Bu gün için görev yok. Noktalı günlere dokunun.
        </p>
      ) : (
        <ul aria-label={`${day} ${name} görevleri`} className="space-y-2">
          {tasks.map((t) => {
            const { Icon, tile } = KIND_STYLE[t.kind];
            return (
              <li key={t.title} className="flex items-start gap-3 rounded-[18px] border border-border bg-card px-3 py-2.5">
                <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[12px] ${tile}`}>
                  <Icon aria-hidden="true" weight="duotone" className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <SpringCheck
                    label={t.title}
                    color="var(--foreground)"
                    fillColor="var(--primary)"
                    checkColor="var(--primary-foreground)"
                    boxSize={20}
                    boxRadius={6}
                    fontSize={14}
                    doneOpacity={0.5}
                    className="w-full items-start [&_.spring-check\_\_press]:mt-[-1px]"
                  />
                  <span className="-mt-2 block pl-[30px] text-[12px] text-muted-foreground">
                    {TASK_KINDS[t.kind].label} · {t.field} · {t.time}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
