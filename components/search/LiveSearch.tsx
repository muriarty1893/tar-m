"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type KeyboardEvent } from "react";
import { MagnifyingGlassIcon, SpinnerGapIcon } from "@phosphor-icons/react/dist/ssr";
import { MAX_QUERY, MIN_QUERY, SUGGESTION_LABEL, type Suggestion, type SuggestionKind } from "@/lib/search";

/** Each kind's label colours: Konu blue, Yanıt grey, Pazar rose, Haber green. */
const TONE: Record<SuggestionKind, string> = {
  konu: "bg-secondary text-primary",
  yanit: "bg-muted text-foreground",
  ilan: "bg-[#ffe4e6] text-[#9f1239]",
  haber: "bg-good-soft text-good",
};

type Found = { items: Suggestion[] } | { error: true };

/**
 * The site's search box: from two letters, a box opens under it with matching forum topics, replies,
 * Pazar listings and news, each labelled (Konu, Yanıt, Pazar, Haber), and a last line for all results
 * on /ara. Keyboard: ↑ ↓ to move, Enter to open, Esc to close; Enter with nothing picked searches
 * /ara. Results are fetched a moment after typing stops, and kept for the visit.
 */
export function LiveSearch({ id, defaultValue = "", label = "Forumda, Pazar’da ve haberlerde ara", className = "" }: { id: string; defaultValue?: string; label?: string; className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [found, setFound] = useState<Record<string, Found>>({});
  const term = q.trim().slice(0, MAX_QUERY);
  const ready = term.length >= MIN_QUERY;
  const result = ready ? found[term] : undefined;
  const items = result && "items" in result ? result.items : [];
  const listId = `${id}-oneriler`;
  const optionId = (i: number) => `${id}-oneri-${i}`;
  const allHref = `/ara?q=${encodeURIComponent(term)}`;
  // The suggestions, then "all results" as the last option.
  const count = items.length + 1;
  const expanded = open && ready;

  useEffect(() => {
    if (!ready || found[term]) return;
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/ara?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { items: Suggestion[] };
        setFound((f) => ({ ...f, [term]: { items: data.items } }));
      } catch {
        if (!ctrl.signal.aborted) setFound((f) => ({ ...f, [term]: { error: true } }));
      }
    }, 180);
    return () => {
      window.clearTimeout(timer);
      ctrl.abort();
    };
  }, [term, ready, found]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!ready) return;
      e.preventDefault();
      setOpen(true);
      setActive((a) => (e.key === "ArrowDown" ? (a + 1) % count : a <= 0 ? count - 1 : a - 1));
    } else if (e.key === "Enter" && expanded && active >= 0) {
      e.preventDefault();
      go(active < items.length ? items[active].href : allHref);
    } else if (e.key === "Escape" && expanded) {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  }

  const status = !ready ? "" : !result ? "Aranıyor…" : "error" in result ? "Arama şu an yapılamadı." : items.length ? `${items.length} sonuç` : "Sonuç yok.";

  return (
    <form role="search" aria-label="Sitede ara" action="/ara" className={`relative ${className}`} onSubmit={() => setOpen(false)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={id}
        name="q"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        enterKeyHint="search"
        maxLength={MAX_QUERY}
        placeholder={label}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="h-10 w-full rounded-md border border-border bg-card pl-8 pr-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/25 xl:h-11"
      />
      <div hidden={!expanded} className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-card text-[13px] leading-[1.4] shadow-lift">
        {(!result || items.length === 0) && (
          <p className="flex items-center gap-2 border-b border-border px-3 py-2.5 text-muted-foreground">
            {!result && <SpinnerGapIcon aria-hidden="true" weight="bold" className="size-4 motion-safe:animate-spin" />}
            {status}
          </p>
        )}
        <ul id={listId} role="listbox" aria-label="Arama önerileri" className="max-h-[min(65vh,26rem)] overflow-y-auto">
          {items.map((s, i) => (
            <li
              key={s.key}
              id={optionId(i)}
              role="option"
              aria-selected={active === i}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={() => setActive(i)}
              onClick={() => go(s.href)}
              className="flex cursor-pointer items-start gap-2 border-b border-border px-3 py-2 aria-selected:bg-secondary"
            >
              <span className={`mt-px w-12 shrink-0 rounded py-px text-center text-[11px] font-semibold ${TONE[s.kind]}`}>{SUGGESTION_LABEL[s.kind]}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{s.title}</span>
                <span className="block truncate text-[12px] text-muted-foreground">{s.detail}</span>
              </span>
            </li>
          ))}
          <li
            id={optionId(items.length)}
            role="option"
            aria-selected={active === items.length}
            onMouseDown={(e) => e.preventDefault()}
            onMouseMove={() => setActive(items.length)}
            onClick={() => go(allHref)}
            className="flex min-h-10 cursor-pointer items-center px-3 font-semibold text-primary aria-selected:bg-secondary"
          >
            “{term}” için tüm sonuçlar →
          </li>
        </ul>
      </div>
      <p aria-live="polite" className="sr-only">
        {expanded ? status : ""}
      </p>
    </form>
  );
}
