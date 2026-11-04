"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import { HeartIcon } from "@phosphor-icons/react/dist/ssr";
import { toggleLike } from "@/app/forum/actions";

/** ♥ and the count, under a topic or a reply. Changes at once; signed out, it goes to sign-in and back. */
export function LikeButton({ topicId, replyId = null, liked, count }: { topicId: string; replyId?: string | null; liked: boolean; count: number }) {
  const { isSignedIn, getToken } = useAuth();
  const [state, setState] = useState({ liked, count });
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const onClick = () =>
    start(async () => {
      setError("");
      const before = state;
      setState({ liked: !before.liked, count: before.count + (before.liked ? -1 : 1) });
      let r = await toggleLike(topicId, replyId);
      if ("signIn" in r && isSignedIn) {
        // Signed in, but the server didn't see it (an out-of-date session token): renew and retry once.
        await getToken({ skipCache: true }).catch(() => null);
        r = await toggleLike(topicId, replyId);
      }
      if ("signIn" in r) return window.location.assign(r.signIn);
      if ("error" in r) {
        setState(before);
        return setError(r.error);
      }
      setState({ liked: r.liked, count: r.count });
    });

  return (
    <span className="inline-flex items-center">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={state.liked}
        aria-label={`${state.liked ? "Beğeniyi geri al" : "Beğen"}${state.count ? ` (${state.count} beğeni)` : ""}`}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-1 text-sm font-semibold transition-colors ${state.liked ? "text-rose-700" : "text-muted-foreground hover:text-rose-700"}`}
      >
        <HeartIcon aria-hidden="true" weight={state.liked ? "fill" : "bold"} className="size-5" />
        {state.count > 0 && <span>{state.count.toLocaleString("tr-TR")}</span>}
      </button>
      {error && (
        <span role="alert" className="ml-2 text-sm text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}
