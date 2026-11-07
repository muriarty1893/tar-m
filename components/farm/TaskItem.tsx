"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { CheckIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { deleteTask, setTaskDone } from "@/app/takvim/actions";
import { TASK_KINDS } from "@/lib/farm";
import type { Task } from "@/lib/farm-data";
import { KIND_STYLE } from "./task-style";

/** A task in the day's list: tick it off, or delete it. */
export function TaskItem({ task, showDate }: { task: Task; showDate?: string }) {
  const [done, setDone] = useOptimistic(task.done);
  const [pending, start] = useTransition();
  const { Icon, tile } = KIND_STYLE[task.kind];
  const toggle = () =>
    start(async () => {
      setDone(!done);
      await setTaskDone(task.id, !done);
    });
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border p-3 bg-card">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`${task.title}: ${done ? "yapıldı" : "yapılmadı"}`}
        onClick={toggle}
        disabled={pending}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-input transition-colors aria-checked:border-primary aria-checked:bg-primary aria-checked:text-primary-foreground bg-card"
      >
        {done && <CheckIcon aria-hidden="true" weight="bold" className="size-6" />}
      </button>
      <span aria-hidden="true" className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tile}`}>
        <Icon weight="duotone" className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`font-semibold ${done ? "text-muted-foreground line-through" : ""}`}>{task.title}</p>
        <p className="text-sm text-muted-foreground">
          {[showDate, task.time, TASK_KINDS[task.kind].label].filter(Boolean).join(" · ")}
          {task.fieldName && task.fieldId && (
            <>
              {" · "}
              <Link href={`/tarlalarim/${task.fieldId}`} className="underline underline-offset-2 hover:text-primary">
                {task.fieldName}
              </Link>
            </>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={() => start(() => deleteTask(task.id))}
        disabled={pending}
        aria-label={`${task.title}: sil`}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <TrashIcon aria-hidden="true" weight="bold" className="size-5" />
      </button>
    </li>
  );
}
