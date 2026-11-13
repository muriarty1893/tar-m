"use client";

import { useTransition } from "react";
import { LockSimpleIcon, LockSimpleOpenIcon, PushPinIcon, PushPinSlashIcon } from "@phosphor-icons/react/dist/ssr";
import { setTopicLocked, setTopicPinned } from "@/app/yonetim/actions";
import { Button } from "@/components/ui/button";

/** Admins only, on a topic: pin it to the top of the forum's lists, and close it to new replies. */
export function TopicAdminBar({ topicId, pinned, locked }: { topicId: string; pinned: boolean; locked: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div role="group" aria-label="Yönetici" className="flex flex-wrap items-center gap-1.5 rounded-md border border-dashed border-input bg-muted/30 p-1.5">
      <span className="px-1 text-[12px] font-semibold text-muted-foreground">Yönetici:</span>
      <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => start(() => setTopicPinned(topicId, !pinned))}>
        {pinned ? <PushPinSlashIcon aria-hidden="true" weight="bold" /> : <PushPinIcon aria-hidden="true" weight="bold" />}
        {pinned ? "Sabitlemeyi kaldır" : "Sabitle"}
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => start(() => setTopicLocked(topicId, !locked))}>
        {locked ? <LockSimpleOpenIcon aria-hidden="true" weight="bold" /> : <LockSimpleIcon aria-hidden="true" weight="bold" />}
        {locked ? "Yanıtlara aç" : "Yanıtlara kapat"}
      </Button>
    </div>
  );
}
