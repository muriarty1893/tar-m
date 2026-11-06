"use client";

import { useEffect } from "react";

/**
 * Counts one real view of a topic: once per topic per browser session, so a refresh or coming back
 * to the page doesn't count again. Runs only in the browser, so bots and link previews don't count.
 */
export function CountView({ topicId }: { topicId: string }) {
  useEffect(() => {
    const key = `goruldu:${topicId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private mode without storage: count it anyway.
    }
    void fetch("/api/forum/goruntulenme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: topicId }),
      keepalive: true,
    }).catch(() => {});
  }, [topicId]);
  return null;
}
