import { forumCategoryLabel, type ForumCategory } from "@/lib/forum";

/** Each kind of topic has its own accent, so a list reads at a glance (the label always says it too). */
export const CATEGORY_TONES: Record<ForumCategory, string> = {
  bitki: "bg-emerald-100 text-emerald-900",
  hayvan: "bg-amber-100 text-amber-900",
  makine: "bg-sky-100 text-sky-900",
  destek: "bg-violet-100 text-violet-900",
  pazar: "bg-rose-100 text-rose-900",
  genel: "bg-slate-200 text-slate-800",
};

export function CategoryChip({ category }: { category: ForumCategory }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${CATEGORY_TONES[category]}`}>{forumCategoryLabel(category)}</span>;
}

/** "3 yanıt", "Yanıt yok" */
export const repliesLabel = (n: number) => (n ? `${n.toLocaleString("tr-TR")} yanıt` : "Yanıt yok");
