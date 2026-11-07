import Link from "next/link";
import { kindLabel, type ArticleKind } from "@/lib/news";
import { listPublished } from "@/lib/news-data";

/** Destek green, Duyuru amber, Haber blue: the word before each headline. */
const KIND_COLOR: Record<ArticleKind, string> = { destek: "#15803d", duyuru: "#b45309", haber: "#1d4ed8" };

/** How many headlines the strip carries, and the fewest it shows in a loop (so the loop has no gap). */
const LATEST = 8;
const MIN_LOOP = 6;

/**
 * "Çiftçi destekleri & haberler": a thin strip on the home page with the newest published articles
 * gliding by like a market ticker, each opening its page. Written by the admins in Yönetim → Haberler.
 * The label opens /haberler. Not shown until there is an article.
 */
export async function NewsTicker() {
  const latest = (await listPublished()).slice(0, LATEST);
  if (latest.length === 0) return null;
  // Short lists repeat, so one round is wider than the screen.
  const round = Array.from({ length: Math.ceil(MIN_LOOP / latest.length) }, () => latest).flat();
  const seconds = Math.max(25, Math.round(round.reduce((n, a) => n + a.title.length + 8, 0) * 0.17));
  const row = (copy: boolean) => (
    <ul className={copy ? "kayan-serit__kopya" : "flex"} aria-hidden={copy || undefined}>
      {round.map((a, i) => (
        <li key={`${a.slug}-${i}`} className="flex shrink-0 items-center pr-5">
          <Link
            href={`/haberler/${a.slug}`}
            tabIndex={copy || i >= latest.length ? -1 : undefined}
            aria-hidden={(!copy && i >= latest.length) || undefined}
            className="flex min-h-8 items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium text-foreground hover:underline focus-visible:outline-offset-[-2px]"
          >
            <span className="font-borsa-mono text-[10px] font-bold uppercase" style={{ color: KIND_COLOR[a.kind] }}>
              {kindLabel(a.kind)}
            </span>
            {a.title}
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-labelledby="destek-haber" className="flex h-8 items-stretch overflow-hidden rounded-md border border-border bg-card">
      <h2 id="destek-haber" className="flex shrink-0">
        <Link href="/haberler" className="flex items-center bg-create px-2 text-[11px] font-bold leading-none text-white transition-colors hover:bg-[var(--create-hover)] focus-visible:outline-offset-[-3px]">
          Çiftçi destekleri & haberler
        </Link>
      </h2>
      <div className="kayan-serit flex min-w-0 flex-1 items-center pl-2.5" style={{ "--serit-sure": `${seconds}s` } as React.CSSProperties}>
        <div className="kayan-serit__ray">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
