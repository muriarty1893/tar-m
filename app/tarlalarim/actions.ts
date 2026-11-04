"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { ensureProfile, requireUserId } from "@/lib/auth";
import { addExpenseFor, deleteExpenseFor, deleteFieldFor, saveFieldFor } from "@/lib/services/farm";
import type { ExpenseErrors, ExpenseInput, FieldErrors, FieldInput } from "@/lib/farm";

/** Adds a field, or saves changes to `id`; then opens it. */
export async function saveField(raw: FieldInput, id?: string): Promise<{ errors: FieldErrors }> {
  const userId = await requireUserId(id ? `/tarlalarim/${id}` : "/tarlalarim");
  await ensureProfile(userId);
  const saved = await saveFieldFor(userId, raw, id);
  if (!saved.id) return { errors: saved.errors };
  if (id) {
    refresh();
    return { errors: {} };
  }
  redirect(`/tarlalarim/${saved.id}`);
}

/** Deletes a field with its expenses; its calendar tasks stay, without the field. */
export async function deleteField(id: string) {
  const userId = await requireUserId("/tarlalarim");
  await deleteFieldFor(userId, id);
  redirect("/tarlalarim?silindi=1");
}

export async function addExpense(fieldId: string, raw: ExpenseInput): Promise<{ errors: ExpenseErrors; ok?: boolean }> {
  const userId = await requireUserId(`/tarlalarim/${fieldId}`);
  const result = await addExpenseFor(userId, fieldId, raw);
  if (result.ok) refresh();
  return result;
}

export async function deleteExpense(id: string) {
  const userId = await requireUserId("/tarlalarim");
  await deleteExpenseFor(userId, id);
  refresh();
}
