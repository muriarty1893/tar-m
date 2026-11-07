"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { ArrowLeftIcon, ChecksIcon, HandCoinsIcon, HandshakeIcon, PaperPlaneRightIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { respondToOffer, sendMessage, sendOffer, type ChatResult } from "@/app/mesajlar/actions";
import type { ChatMessage, Thread } from "@/lib/chat-data";
import { OFFER_STATUS, QUICK_REPLIES, formatPrice, priceLabel, type OfferResponse } from "@/lib/market";
import { chatDayLabel, trClock, trDayKey } from "@/lib/tr-time";
import { Avatar } from "@/components/market/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/forms/fields";

/** How often an open chat asks for new messages, while the tab is visible. */
const POLL_MS = 4000;

const OFFER_TONE: Record<string, string> = {
  pending: "bg-gold-soft text-gold",
  accepted: "bg-secondary text-primary",
  rejected: "bg-destructive/10 text-destructive",
  countered: "bg-muted text-muted-foreground",
  withdrawn: "bg-muted text-muted-foreground",
};

/** A listing chat: the listing on top, the messages and offers, and the reply box. Polls for the other side's replies. */
export function ChatThread({ initial }: { initial: Thread }) {
  const [thread, setThread] = useState(initial);
  const [text, setText] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const [offer, setOffer] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const lastId = thread.messages[thread.messages.length - 1]?.id;

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/mesajlar/${initial.id}`, { cache: "no-store" });
      if (res.ok) setThread(((await res.json()) as { thread: Thread }).thread);
    } catch {
      // Offline for a moment: the next poll tries again.
    }
  }, [initial.id]);

  useEffect(() => {
    const tick = () => document.visibilityState === "visible" && refresh();
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  // Keep the newest message in view, unless the reader has scrolled up to read older ones.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [lastId]);

  const apply = (r: ChatResult) => {
    if ("error" in r) setError(r.error);
    else {
      setThread(r.thread);
      setError("");
      stickToBottom.current = true;
    }
  };

  const send = (body: string) => {
    if (!body.trim()) return;
    start(async () => {
      const r = await sendMessage(thread.id, body);
      apply(r);
      if (!("error" in r)) setText("");
    });
  };
  const submitOffer = () =>
    start(async () => {
      const r = await sendOffer(thread.id, offer);
      apply(r);
      if (!("error" in r)) {
        setOffer("");
        setOfferOpen(false);
      }
    });
  const respond = (messageId: string, response: OfferResponse, counter = "") => start(async () => apply(await respondToOffer(messageId, response, counter)));

  const now = new Date();
  const removed = thread.listing.status === "removed";
  const accepted = [...thread.messages].reverse().find((m) => m.offer?.status === "accepted");
  const lastMine = [...thread.messages].reverse().find((m) => m.mine);
  const seen = lastMine && thread.peerReadAt >= lastMine.at;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href="/mesajlar" aria-label="Mesajlara dön" className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border hover:border-primary/50 bg-card">
          <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-5" />
        </Link>
        <Avatar id={thread.peer.name} name={thread.peer.name} photo={thread.peer.photo} size={44} />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{thread.peer.name}</h1>
          <p className="text-sm text-muted-foreground">{thread.role === "buyer" ? "Satıcı" : "Alıcı"} · Mesajlar birkaç saniyede bir yenilenir</p>
        </div>
      </div>

      <Link href={`/pazar/ilan/${thread.listing.id}`} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-secondary bg-card">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image src={thread.listing.photo} alt="" fill sizes="56px" className="object-cover" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{thread.listing.title}</span>
          <span className="block text-primary">{priceLabel(thread.listing.price, thread.listing.unit)}</span>
        </span>
        {thread.listing.status !== "active" && (
          <span className="shrink-0 rounded-full bg-foreground px-3 py-1 text-sm font-semibold text-background">{thread.listing.status === "sold" ? "Satıldı" : "Kaldırıldı"}</span>
        )}
      </Link>

      {accepted?.offer && (
        <p className="flex items-start gap-3 rounded-lg border border-primary/30 bg-secondary px-4 py-3">
          <HandshakeIcon aria-hidden="true" weight="duotone" className="mt-0.5 size-6 shrink-0 text-primary" />
          <span>
            <b>Anlaştınız: {formatPrice(accepted.offer.amount)}.</b> Ödemeyi ve teslimi yüz yüze, ürünü görerek yapın.
            {thread.role === "seller" && thread.listing.status === "active" && (
              <>
                {" "}
                Sattıysanız{" "}
                <Link href={`/pazar/ilan/${thread.listing.id}`} className="font-semibold text-primary underline underline-offset-4">
                  ilanı satıldı olarak işaretleyin
                </Link>
                .
              </>
            )}
          </span>
        </p>
      )}

      <div
        ref={listRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        role="log"
        aria-label={`${thread.peer.name} ile mesajlar`}
        className="h-[min(60vh,36rem)] space-y-3 overflow-y-auto rounded-lg border border-border bg-surface p-4"
      >
        {thread.messages.length === 0 && <p className="py-3 text-center text-muted-foreground">Henüz mesaj yok. İlk mesajı siz yazın.</p>}
        {thread.messages.map((m, i) => {
          const day = trDayKey(new Date(m.at));
          const newDay = i === 0 || trDayKey(new Date(thread.messages[i - 1].at)) !== day;
          return (
            <Fragment key={m.id}>
              {newDay && (
                <p className="py-1 text-center text-sm font-semibold text-muted-foreground">
                  <span className="rounded-full bg-muted px-3 py-1">{chatDayLabel(new Date(m.at), now)}</span>
                </p>
              )}
              <Bubble message={m} role={thread.role} disabled={pending || removed} onRespond={respond} />
            </Fragment>
          );
        })}
        {seen && (
          <p className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
            <ChecksIcon aria-hidden="true" weight="bold" className="size-4 text-primary" />
            Görüldü
          </p>
        )}
      </div>

      {removed ? (
        <p className="rounded-lg bg-muted px-4 py-3 text-center font-semibold">İlan kaldırıldığı için bu sohbete yeni mesaj yazılamıyor.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Hazır mesajlar">
            {QUICK_REPLIES[thread.role].map((q) => (
              <button
                key={q}
                type="button"
                disabled={pending}
                onClick={() => send(q)}
                className="min-h-11 shrink-0 cursor-pointer rounded-md border border-border px-3 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-secondary disabled:opacity-60 bg-card"
              >
                {q}
              </button>
            ))}
          </div>

          {offerOpen && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitOffer();
              }}
              className="flex flex-wrap items-end gap-3 rounded-lg border border-gold/30 bg-gold-soft p-3"
            >
              <div className="min-w-48 flex-1">
                <label htmlFor="sohbet-teklif" className="block font-semibold">
                  Teklifiniz (₺{thread.listing.unit ? ` / ${thread.listing.unit}` : ""})
                </label>
                <Input id="sohbet-teklif" inputMode="decimal" autoComplete="off" value={offer} onChange={(e) => setOffer(e.target.value)} className="mt-1" autoFocus />
              </div>
              <Button type="submit" disabled={pending}>
                Teklifi gönder
              </Button>
              <Button variant="ghost" onClick={() => setOfferOpen(false)} aria-label="Teklifi kapat">
                <XIcon aria-hidden="true" weight="bold" />
              </Button>
            </form>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
            className="flex items-end gap-2"
          >
            {thread.role === "buyer" && thread.listing.status === "active" && !offerOpen && (
              <Button variant="outline" size="icon" onClick={() => setOfferOpen(true)} aria-label="Teklif ver" className="shrink-0">
                <HandCoinsIcon aria-hidden="true" weight="duotone" />
              </Button>
            )}
            <div className="flex-1">
              <label htmlFor="sohbet-mesaj" className="sr-only">
                Mesajınız
              </label>
              <textarea
                id="sohbet-mesaj"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send(text);
                  }
                }}
                rows={1}
                maxLength={1000}
                placeholder="Mesaj yazın…"
                className="field-sizing-content max-h-40 min-h-11 w-full resize-none rounded-lg border border-input bg-card px-4 py-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20"
              />
            </div>
            <Button type="submit" size="icon" disabled={pending || !text.trim()} aria-label="Gönder" className="shrink-0">
              <PaperPlaneRightIcon aria-hidden="true" weight="fill" />
            </Button>
          </form>
          {error && <FieldError id="sohbet-hata">{error}</FieldError>}
        </div>
      )}
    </div>
  );
}

function Bubble({
  message: m,
  role,
  disabled,
  onRespond,
}: {
  message: ChatMessage;
  role: Thread["role"];
  disabled: boolean;
  onRespond: (id: string, r: OfferResponse, counter?: string) => void;
}) {
  const [countering, setCountering] = useState(false);
  const [counter, setCounter] = useState("");
  const time = trClock(new Date(m.at));

  if (m.offer) {
    const canAnswer = !m.mine && m.offer.status === "pending";
    const who = m.mine ? (role === "seller" ? "Karşı teklifiniz" : "Teklifiniz") : role === "buyer" ? "Satıcının karşı teklifi" : "Alıcının teklifi";
    return (
      <div className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-4 shadow-soft">
          <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <HandCoinsIcon aria-hidden="true" weight="duotone" className="size-5 text-gold" />
            {who}
          </p>
          <p className="mt-1 text-xl font-bold">{formatPrice(m.offer.amount)}</p>
          <p className="mt-2 flex items-center justify-between gap-2">
            <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${OFFER_TONE[m.offer.status]}`}>{OFFER_STATUS[m.offer.status]}</span>
            <span className="text-sm text-muted-foreground">{time}</span>
          </p>
          {canAnswer && !countering && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Button size="sm" disabled={disabled} onClick={() => onRespond(m.id, "accept")}>
                Kabul et
              </Button>
              <Button size="sm" variant="outline" disabled={disabled} onClick={() => setCountering(true)}>
                Karşı teklif
              </Button>
              <Button size="sm" variant="ghost" disabled={disabled} onClick={() => onRespond(m.id, "reject")} className="text-destructive hover:bg-destructive/10">
                Reddet
              </Button>
            </div>
          )}
          {canAnswer && countering && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onRespond(m.id, "counter", counter);
              }}
              className="mt-3 space-y-2"
            >
              <label htmlFor={`karsi-${m.id}`} className="block font-semibold">
                Karşı teklifiniz (₺)
              </label>
              <Input id={`karsi-${m.id}`} inputMode="decimal" autoComplete="off" value={counter} onChange={(e) => setCounter(e.target.value)} autoFocus />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={disabled}>
                  Gönder
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setCountering(false)}>
                  Vazgeç
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] whitespace-pre-line break-words rounded-lg px-4 py-2.5 ${m.mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card"}`}
      >
        <span className="sr-only">{m.mine ? "Siz: " : ""}</span>
        {m.body}
        <span className={`ml-3 inline-block translate-y-0.5 text-xs ${m.mine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{time}</span>
      </p>
    </div>
  );
}
