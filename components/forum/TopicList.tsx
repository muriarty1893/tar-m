import { TopicRow } from "@/components/forum/TopicRow";
import type { ForumCats } from "@/lib/forum";
import type { TopicCard } from "@/lib/forum-data";

/** Topics in a list: the dense Borsa rows (title, then section · time · who, replies and views). */
export function TopicList({ items, cats, now, framed = true }: { items: TopicCard[]; cats: ForumCats; now: Date; framed?: boolean }) {
  return (
    <ul className={`divide-y divide-border bg-card text-[13px] leading-[1.45] ${framed ? "overflow-hidden rounded-md border border-border" : ""}`}>
      {items.map((t) => (
        <TopicRow key={t.id} topic={t} cats={cats} now={now} dense />
      ))}
    </ul>
  );
}
