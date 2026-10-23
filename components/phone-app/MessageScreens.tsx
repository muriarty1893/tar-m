"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeftIcon, CheckCircleIcon, ChecksIcon, PaperPlaneRightIcon, TagIcon } from "@phosphor-icons/react/dist/ssr";
import { QUICK_REPLIES, lastAt, lastLine, unreadCount, type Conversation, type Message } from "@/data/demo-chat";
import { formatPrice, listingById, sellerById, type Listing } from "@/data/demo-market";
import { addDays, agoLabel, clock, dayKey, dayTitle, demoNow } from "@/lib/demo-clock";
import type { DemoMarket } from "./use-demo-market";
import type { Nav } from "./nav";
import { OfferSheet } from "./MarketScreens";
import { Avatar, Segmented, enter, focusRing, scroll } from "./parts";

type Filter = "tumu" | "buyer" | "seller";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "tumu", label: "Tümü" },
  { id: "buyer", label: "Alıyorum" },
  { id: "seller", label: "Satıyorum" },
];

/** Pazar's "Mesajlar": every listing chat, newest first, unread ones in bold with a count. */
export function InboxList({ market, nav, onBrowse }: { market: DemoMarket; nav: Nav; onBrowse: () => void }) {
  const [filter, setFilter] = useState<Filter>("tumu");
  const rows = market.conversations.filter((c) => c.messages.length && (filter === "tumu" || c.role === filter)).sort((a, b) => lastAt(b).localeCompare(lastAt(a)));
  const now = demoNow();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border px-3.5 pb-2.5">
        <Segmented label="Sohbetler" value={filter} options={FILTERS} onChange={setFilter} />
      </div>
      <ul aria-label="Sohbetler" className={`${scroll} min-h-0 flex-1 pb-28`}>
        {rows.map((c) => (
          <Row key={c.id} chat={c} now={now} myListings={market.myListings} onOpen={() => nav.push({ name: "chat", id: c.id })} />
        ))}
        {rows.length === 0 && (
          <li className="m-3.5 rounded-[20px] border border-dashed border-border px-5 py-6 text-center">
            <p className="font-heading text-[16px] font-extrabold">{filter === "seller" ? "İlanlarınıza mesaj yok" : "Henüz mesajınız yok"}</p>
            <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">
              {filter === "seller" ? "Alıcılar ilanlarınıza yazınca burada görünecek." : "Bir ilanda “Mesaj gönder”e dokunarak satıcıyla konuşun."}
            </p>
            <button type="button" onClick={onBrowse} className={`mt-2 min-h-9 cursor-pointer rounded-full bg-primary px-4 text-[12.5px] font-semibold text-primary-foreground ${focusRing}`}>
              İlanlara göz at
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

function Row({ chat, now, myListings, onOpen }: { chat: Conversation; now: Date; myListings: Listing[]; onOpen: () => void }) {
  const listing = listingById(chat.listingId, myListings);
  const peer = sellerById(chat.peerId);
  if (!listing || !peer) return null;
  const unread = unreadCount(chat);
  const when = agoLabel(new Date(lastAt(chat)), now);
  const line = lastLine(chat);
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${peer.name}, ${listing.title}. ${line.replace(/[.!?]$/, "")}. ${when}${unread ? `. ${unread} okunmamış mesaj` : ""}`}
        className={`flex w-full cursor-pointer items-center gap-2.5 border-b border-border px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-secondary/60 ${focusRing}`}
      >
        <span className="relative shrink-0">
          <span className="relative block size-12 overflow-hidden rounded-[12px] bg-muted">
            <Image src={listing.photos[0]} alt="" fill sizes="48px" className="object-cover" />
          </span>
          <span className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-background">
            <Avatar seller={peer} size={22} />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className={`truncate text-[13.5px] ${unread ? "font-bold" : "font-semibold"}`}>{peer.name}</span>
            <span className={`shrink-0 text-[11px] ${unread ? "font-semibold text-primary" : "text-muted-foreground"}`}>{when}</span>
          </span>
          <span className="block truncate text-[11.5px] text-muted-foreground">
            {chat.role === "seller" ? "İlanınız · " : ""}
            {listing.title}
          </span>
          <span className="flex items-center gap-2">
            <span className={`truncate text-[12.5px] ${unread ? "font-semibold" : "text-muted-foreground"}`}>{line}</span>
            {unread > 0 && <span className="ml-auto min-w-5 shrink-0 rounded-full bg-primary px-1.5 text-center text-[11px] font-bold text-primary-foreground">{unread}</span>}
          </span>
        </span>
      </button>
    </li>
  );
}

const dayLabel = (d: Date, now: Date) => (dayKey(d) === dayKey(now) ? "Bugün" : dayKey(d) === dayKey(addDays(now, -1)) ? "Dün" : dayTitle(d));

/** A listing chat: the listing pinned on top, messages and offers, quick replies, and the other side's scripted answers. */
export function ChatScreen({ id, market, nav }: { id: string; market: DemoMarket; nav: Nav }) {
  const [draft, setDraft] = useState("");
  const [offering, setOffering] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const chat = market.conversations.find((c) => c.id === id);
  const count = chat?.messages.length ?? 0;
  const pending = !!chat?.pending;
  const { markRead } = market;

  // Read on open and as answers arrive.
  useEffect(() => {
    markRead(id);
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [id, count, pending, markRead]);

  const listing = chat && listingById(chat.listingId, market.myListings);
  const peer = chat && sellerById(chat.peerId);
  if (!chat || !listing || !peer) return null;

  const status = market.listingStatus[listing.id];
  const buyer = chat.role === "buyer";
  const agreed = chat.messages.some((m) => m.offer?.status === "accepted");
  const canOffer = buyer && listing.negotiable && !agreed && !status;
  const sent = new Set(chat.messages.filter((m) => m.from === "me").map((m) => m.text));
  const quick = QUICK_REPLIES[chat.role].filter((q) => !sent.has(q));
  const now = demoNow();

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    market.sendText(chat.id, t);
    setDraft("");
  };

  return (
    <div className={`relative flex h-full flex-col bg-background ${enter}`}>
      <div className="space-y-2 border-b border-border px-3.5 pb-2.5 pt-[52px]">
        <div className="flex items-center gap-2.5">
          <button type="button" aria-label="Geri" onClick={nav.back} className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-card hover:bg-secondary ${focusRing}`}>
            <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-5" />
          </button>
          <Avatar seller={peer} size={36} />
          <span className="min-w-0">
            <span className="block truncate font-heading text-[15px] font-extrabold">{peer.name}</span>
            <span aria-live="polite" className={`block truncate text-[11.5px] ${pending ? "text-primary" : "text-muted-foreground"}`}>
              {pending ? "yazıyor…" : buyer ? `Satıcı · genelde ${peer.replies} yanıt verir` : `Alıcı · ${peer.place}`}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-[14px] border border-border bg-card p-1.5">
          <button
            type="button"
            onClick={() => nav.push({ name: "listing", id: listing.id })}
            aria-label={`İlanı aç: ${listing.title}, ${formatPrice(listing.price)}`}
            className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-[10px] text-left ${focusRing}`}
          >
            <span className="relative size-10 shrink-0 overflow-hidden rounded-[10px] bg-muted">
              <Image src={listing.photos[0]} alt="" fill sizes="40px" className="object-cover" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] font-semibold">{listing.title}</span>
              <span className="block font-heading text-[13px] font-extrabold">
                {formatPrice(listing.price)}
                {listing.unit && <span className="text-[11px] font-normal text-muted-foreground"> / {listing.unit}</span>}
              </span>
            </span>
          </button>
          {status === "sold" ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-bold text-muted-foreground">SATILDI</span>
          ) : canOffer ? (
            <button type="button" onClick={() => setOffering(true)} className={`h-8 shrink-0 cursor-pointer rounded-full border border-primary/50 px-2.5 text-[12px] font-semibold text-primary ${focusRing}`}>
              Teklif ver
            </button>
          ) : null}
        </div>
      </div>

      <div ref={list} role="log" aria-label="Sohbet" className={`${scroll} min-h-0 flex-1 space-y-2 px-3.5 py-3`}>
        {chat.messages.map((m, i) => {
          const at = new Date(m.at);
          const newDay = i === 0 || dayKey(new Date(chat.messages[i - 1].at)) !== dayKey(at);
          return (
            <Fragment key={m.id}>
              {newDay && <p className="mx-auto w-fit rounded-full bg-muted px-2.5 py-0.5 text-[10.5px] font-semibold text-muted-foreground">{dayLabel(at, now)}</p>}
              {m.offer ? <OfferBubble m={m} chat={chat} onAnswer={(accept) => market.answerOffer(chat.id, m.id, accept)} /> : <TextBubble m={m} />}
            </Fragment>
          );
        })}
        {count === 0 && (
          <p className="mt-4 text-center text-[12.5px] leading-snug text-muted-foreground">
            {peer.name} ile “{listing.title}” hakkında konuşun. Hazır sorulardan birini seçebilirsiniz.
          </p>
        )}
        {pending && (
          <p aria-label={`${peer.name} yazıyor`} className="flex w-fit items-center gap-1 rounded-[18px] rounded-bl-md border border-border bg-card px-3 py-2.5">
            {[0, 1, 2].map((d) => (
              <span key={d} className="size-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce" style={{ animationDelay: `${d * 120}ms` }} />
            ))}
          </p>
        )}
      </div>

      <div className="space-y-2 border-t border-border bg-card px-3 pb-7 pt-2.5">
        {quick.length > 0 && (
          <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none]">
            {quick.map((q) => (
              <button
                key={q}
                type="button"
                disabled={pending}
                onClick={() => send(q)}
                className={`shrink-0 cursor-pointer rounded-full border border-primary/40 bg-secondary px-3 py-1.5 text-[12.5px] font-semibold text-primary transition-colors duration-150 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 ${focusRing}`}
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          {canOffer && (
            <button type="button" aria-label="Teklif ver" onClick={() => setOffering(true)} className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-primary/40 bg-secondary text-primary ${focusRing}`}>
              <TagIcon aria-hidden="true" weight="duotone" className="size-5" />
            </button>
          )}
          <label htmlFor="mesaj-yaz" className="sr-only">
            Mesaj yazın
          </label>
          <input
            id="mesaj-yaz"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Mesaj yazın…"
            autoComplete="off"
            className="min-h-10 min-w-0 flex-1 rounded-full border border-input bg-background px-3.5 text-[13.5px] outline-none focus-visible:border-primary"
          />
          <button
            type="submit"
            aria-label="Gönder"
            disabled={!draft.trim()}
            className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
          >
            <PaperPlaneRightIcon aria-hidden="true" weight="fill" className="size-5" />
          </button>
        </form>
      </div>

      {offering && (
        <OfferSheet
          listing={listing}
          onClose={() => setOffering(false)}
          onOffer={(amount) => {
            setOffering(false);
            market.sendOffer(chat.id, amount);
          }}
        />
      )}
    </div>
  );
}

function TextBubble({ m }: { m: Message }) {
  const mine = m.from === "me";
  return (
    <div className={`w-fit max-w-[84%] rounded-[18px] px-3 pb-1 pt-2 ${mine ? "ml-auto rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card"}`}>
      <p className="text-[13.5px] leading-snug">
        <span className="sr-only">{mine ? "Siz: " : "Karşı taraf: "}</span>
        {m.text}
      </p>
      <p className={`mt-0.5 flex items-center justify-end gap-1 text-[10.5px] ${mine ? "text-white/80" : "text-muted-foreground"}`}>
        {clock(new Date(m.at))}
        {mine && <ChecksIcon aria-hidden="true" weight="bold" className="size-3.5" />}
      </p>
    </div>
  );
}

const STATUS_COPY = {
  pending: { mine: "Yanıt bekleniyor", theirs: "Yanıtınızı bekliyor" },
  accepted: { mine: "Kabul edildi", theirs: "Kabul ettiniz" },
  rejected: { mine: "Kabul edilmedi", theirs: "Reddettiniz" },
  countered: { mine: "Karşı teklif geldi", theirs: "Karşı teklif verdiniz" },
};

function OfferBubble({ m, chat, onAnswer }: { m: Message; chat: Conversation; onAnswer: (accept: boolean) => void }) {
  const offer = m.offer!;
  const mine = m.from === "me";
  const label = mine ? "Teklifiniz" : chat.role === "buyer" ? "Karşı teklif" : "Teklif";
  const status = STATUS_COPY[offer.status][mine ? "mine" : "theirs"];
  const accepted = offer.status === "accepted";
  const open = !mine && offer.status === "pending";
  return (
    <div className={`w-[78%] space-y-1.5 rounded-[18px] border-2 p-3 ${mine ? "ml-auto rounded-br-md" : "rounded-bl-md"} ${accepted ? "border-primary bg-secondary" : "border-gold/50 bg-gold-soft"}`}>
      <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.12em]">
        <TagIcon aria-hidden="true" weight="duotone" className={`size-4 ${accepted ? "text-primary" : "text-gold"}`} />
        <span className={accepted ? "text-primary" : "text-gold"}>{label}</span>
        <span className="ml-auto font-normal normal-case tracking-normal text-muted-foreground">{clock(new Date(m.at))}</span>
      </p>
      <p className="font-heading text-[20px] font-extrabold">{formatPrice(offer.amount)}</p>
      {open ? (
        <div className="flex gap-1.5">
          <button type="button" onClick={() => onAnswer(false)} className={`h-9 flex-1 cursor-pointer rounded-full border border-border bg-card text-[12.5px] font-semibold ${focusRing}`}>
            Reddet
          </button>
          <button type="button" onClick={() => onAnswer(true)} className={`h-9 flex-1 cursor-pointer rounded-full bg-primary text-[12.5px] font-semibold text-primary-foreground ${focusRing}`}>
            Kabul et
          </button>
        </div>
      ) : (
        <p className={`flex items-center gap-1 text-[12px] font-semibold ${accepted ? "text-primary" : "text-muted-foreground"}`}>
          {accepted && <CheckCircleIcon aria-hidden="true" weight="fill" className="size-4" />}
          {status}
        </p>
      )}
    </div>
  );
}
