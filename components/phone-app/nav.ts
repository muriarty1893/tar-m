/**
 * The demo phone's screens that open over a tab, like the mobile app's stack screens: a listing, the
 * new-listing form, the inbox and a chat, the fields, a field, the field map and the price list.
 */
export type Page =
  | { name: "listing"; id: string; fresh?: boolean }
  | { name: "new-listing" }
  | { name: "inbox" }
  | { name: "chat"; id: string }
  | { name: "fields" }
  | { name: "field"; id: string }
  | { name: "map" }
  | { name: "prices" };

export type Nav = {
  push: (page: Page) => void;
  /** Replaces the screen on top (after publishing a listing, the form becomes the listing). */
  replace: (page: Page) => void;
  back: () => void;
  /** Closes every open screen and shows a tab. */
  tab: (tab: "home" | "market" | "weather" | "calendar" | "history") => void;
};
