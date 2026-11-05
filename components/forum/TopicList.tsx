import { TopicRow } from "@/components/forum/TopicRow";
import type { ForumCats } from "@/lib/forum";
import type { TopicCard } from "@/lib/forum-data";

/** Topics in a list, r10-style rows divided by hairlines. */
export function TopicList({ items, cats, now, framed = true }: { items: TopicCard[]; cats: ForumCats; now: Date; framed?: boolean }) {
  return (
    <ul className={`divide-y divide-border bg-card ${framed ? "overflow-hidden rounded-xl border border-border" : ""}`}>
      {items.map((t) => (
        <TopicRow key={t.id} topic={t} cats={cats} now={now} />
      ))}
    </ul>
  );
}
