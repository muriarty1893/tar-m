"use server";

import { refresh } from "next/cache";
import { ensureProfile, requireUserId } from "@/lib/auth";
import { addTaskFor, deleteTaskFor, setTaskDoneFor } from "@/lib/services/farm";
import type { TaskErrors, TaskInput } from "@/lib/farm";

/** Adds a task to the person's calendar. */
export async function addTask(raw: TaskInput): Promise<{ errors: TaskErrors; ok?: boolean }> {
  const userId = await requireUserId("/takvim");
  await ensureProfile(userId);
  const result = await addTaskFor(userId, raw);
  if (result.ok) refresh();
  return result;
}

export async function setTaskDone(id: string, done: boolean) {
  const userId = await requireUserId("/takvim");
  await setTaskDoneFor(userId, id, done);
  refresh();
}

export async function deleteTask(id: string) {
  const userId = await requireUserId("/takvim");
  await deleteTaskFor(userId, id);
  refresh();
}
