"use client";

import { useEffect } from "react";
import { UNREAD_EVENT } from "@/components/account/HeaderAccount";
import { markAllRead } from "./actions";

/** Once the list is on screen: everything is seen, and the bell's badge goes at once. */
export function MarkRead({ unread }: { unread: number }) {
  useEffect(() => {
    if (!unread) return;
    void markAllRead().then(() => window.dispatchEvent(new Event(UNREAD_EVENT)));
  }, [unread]);
  return null;
}
