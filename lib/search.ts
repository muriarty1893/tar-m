/**
 * The site-wide search box (components/search/LiveSearch.tsx): what it shows while you type. Shared
 * by the browser and the server (lib/search-data.ts, /api/ara).
 */

/** Konu: a forum topic; Yanıt: a reply in one; Pazar: a listing; Haber: a news article. */
export type SuggestionKind = "konu" | "yanit" | "ilan" | "haber";

export type Suggestion = {
  kind: SuggestionKind;
  key: string;
  title: string;
  /** One short line under the title: section and replies, price and place, date… */
  detail: string;
  href: string;
};

export const SUGGESTION_LABEL: Record<SuggestionKind, string> = { konu: "Konu", yanit: "Yanıt", ilan: "Pazar", haber: "Haber" };

/** Searching starts at two letters. */
export const MIN_QUERY = 2;
export const MAX_QUERY = 80;
