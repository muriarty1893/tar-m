"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { insertMention, mentionAtCursor } from "@/lib/forum";
import { Textarea } from "@/components/ui/textarea";

type Suggestion = { handle: string; name: string };

type Props = Omit<ComponentProps<typeof Textarea>, "value" | "onChange"> & {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** The topic being answered: its people come first. */
  topicId?: string;
};

/**
 * A text box that suggests people while "@ah…" is typed (the topic's own people first), as on X:
 * arrows to move, Enter or Tab to pick, Escape to close; a tap works too.
 */
export const MentionTextarea = forwardRef<HTMLTextAreaElement, Props>(function MentionTextarea({ id, value, onChange, topicId, onKeyDown, ...rest }, ref) {
  const box = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => box.current!, []);
  const [at, setAt] = useState<{ query: string; start: number; cursor: number } | null>(null);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(0);
  const listId = `${id}-kisiler`;
  const open = at !== null && items.length > 0;
  // Where the cursor goes once a picked name is in the text: set as soon as the new text is on the
  // page, before the next key press (a frame later, quick typing would land elsewhere).
  const pendingCursor = useRef<number | null>(null);
  useLayoutEffect(() => {
    const cursor = pendingCursor.current;
    if (cursor === null || !box.current) return;
    pendingCursor.current = null;
    box.current.focus();
    box.current.setSelectionRange(cursor, cursor);
  }, [value]);

  useEffect(() => {
    if (!at) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: at.query });
        if (topicId) params.set("konu", topicId);
        const res = await fetch(`/api/forum/kisiler?${params}`, { signal: controller.signal });
        const data = res.ok ? ((await res.json()) as { items: Suggestion[] }) : { items: [] };
        setItems(data.items);
        setActive(0);
      } catch {
        // Typing on cancels the last request.
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [at, topicId]);

  const look = (el: HTMLTextAreaElement) => {
    const cursor = el.selectionStart ?? el.value.length;
    const found = el.selectionStart === el.selectionEnd ? mentionAtCursor(el.value, cursor) : null;
    setAt(found ? { ...found, cursor } : null);
    if (!found) setItems([]);
  };

  const pick = (s: Suggestion) => {
    if (!at) return;
    const next = insertMention(value, at, at.cursor, s.handle);
    pendingCursor.current = next.cursor;
    onChange(next.text);
    setAt(null);
    setItems([]);
  };

  return (
    <div className="relative">
      <Textarea
        {...rest}
        ref={box}
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          look(e.target);
        }}
        onSelect={(e) => look(e.currentTarget)}
        onBlur={() => setTimeout(() => setAt(null), 150)}
        onKeyDown={(e) => {
          if (open) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length);
              return;
            }
            if (e.key === "Enter" || e.key === "Tab") {
              e.preventDefault();
              pick(items[active]);
              return;
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setAt(null);
              return;
            }
          }
          onKeyDown?.(e);
        }}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
      />
      {open && (
        <ul id={listId} role="listbox" aria-label="Bahsedilecek kişiler" className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-auto rounded-lg border border-border bg-card p-1 shadow-lift">
          {items.map((s, i) => (
            <li
              key={s.handle}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 ${i === active ? "bg-secondary" : ""}`}
            >
              <span className="font-semibold">{s.name}</span>
              <span className="text-muted-foreground">@{s.handle}</span>
            </li>
          ))}
        </ul>
      )}
      <span className="sr-only" aria-live="polite">
        {open ? `${items.length} kişi önerildi; oklarla seçip Enter’a basın.` : ""}
      </span>
    </div>
  );
});
