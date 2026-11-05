import { categoryName, sectionOf, type ForumCats } from "@/lib/forum";

/**
 * Each section has its own accent (its sub-categories share it), so a list reads at a glance; the
 * label always says it too. The six first sections keep their colours; new ones get one by their id.
 */
const KNOWN: Record<string, string> = {
  bitki: "bg-emerald-100 text-emerald-900",
  hayvan: "bg-amber-100 text-amber-900",
  makine: "bg-sky-100 text-sky-900",
  destek: "bg-violet-100 text-violet-900",
  pazar: "bg-rose-100 text-rose-900",
  genel: "bg-slate-200 text-slate-800",
};
const PALETTE = ["bg-teal-100 text-teal-900", "bg-orange-100 text-orange-900", "bg-indigo-100 text-indigo-900", "bg-lime-100 text-lime-900", "bg-fuchsia-100 text-fuchsia-900", "bg-cyan-100 text-cyan-900"];

/** The accent's solid colour, for the bar beside a section on /forum. */
const KNOWN_BAR: Record<string, string> = {
  bitki: "bg-emerald-600",
  hayvan: "bg-amber-500",
  makine: "bg-sky-600",
  destek: "bg-violet-600",
  pazar: "bg-rose-600",
  genel: "bg-slate-500",
};
const PALETTE_BAR = ["bg-teal-600", "bg-orange-500", "bg-indigo-600", "bg-lime-600", "bg-fuchsia-600", "bg-cyan-600"];

const hash = (id: string) => [...id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

export const sectionTone = (sectionId: string) => KNOWN[sectionId] ?? PALETTE[hash(sectionId) % PALETTE.length];
export const sectionBar = (sectionId: string) => KNOWN_BAR[sectionId] ?? PALETTE_BAR[hash(sectionId) % PALETTE_BAR.length];

export function CategoryChip({ cats, category, size = "base" }: { cats: ForumCats; category: string; size?: "sm" | "base" }) {
  const tone = sectionTone(sectionOf(cats, category));
  return (
    <span className={`inline-flex max-w-full items-center truncate rounded-md font-semibold ${size === "sm" ? "px-1.5 text-xs leading-5" : "px-2.5 py-0.5 text-sm"} ${tone}`}>
      {categoryName(cats, category)}
    </span>
  );
}

/** "3 yanıt", "Yanıt yok" */
export const repliesLabel = (n: number) => (n ? `${n.toLocaleString("tr-TR")} yanıt` : "Yanıt yok");
