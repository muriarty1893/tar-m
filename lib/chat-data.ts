import "server-only";
import { iso, isUuid, num, sql, str, type Row } from "./db";
import { photoOf } from "./avatars";
import { MESSAGE_BURST_LIMIT, STOCK_PHOTOS, offerLine, type ListingCategory, type ListingStatus, type OfferStatus } from "./market";

/** Reads for Mesajlar. Every read checks that the person is in the conversation. */

export type ChatRole = "buyer" | "seller";

export type ChatMessage = {
  id: string;
  mine: boolean;
  body: string | null;
  offer: { amount: number; status: OfferStatus } | null;
  at: string;
};

export type Thread = {
  id: string;
  role: ChatRole;
  /** `photo`: their profile photo (lib/avatars.ts); null shows their initials. */
  peer: { name: string; photo: string | null };
  listing: { id: string; title: string; price: number; unit: string | null; photo: string; status: ListingStatus };
  messages: ChatMessage[];
  /** When the other person last opened the chat: my messages before it are "Görüldü". */
  peerReadAt: string;
};

const MESSAGE_LIMIT = 300;

/** The conversation for `userId`, newest messages last; marks it read for them. Null if it isn't theirs. */
export async function getThread(conversationId: string, userId: string, { markRead = true } = {}): Promise<Thread | null> {
  if (!isUuid(conversationId)) return null;
  const rows = await sql()`
    select c.*, l.title, l.price, l.unit, l.photos, l.category, l.status as listing_status,
      case when c.buyer_id = ${userId} then s.name else b.name end as peer_name
    from conversations c
    join listings l on l.id = c.listing_id
    join profiles b on b.user_id = c.buyer_id
    join profiles s on s.user_id = c.seller_id
    where c.id = ${conversationId} and (c.buyer_id = ${userId} or c.seller_id = ${userId})`;
  const c = rows[0];
  if (!c) return null;
  const role: ChatRole = c.buyer_id === userId ? "buyer" : "seller";
  if (markRead) {
    if (role === "buyer") await sql()`update conversations set buyer_read_at = now() where id = ${conversationId}`;
    else await sql()`update conversations set seller_read_at = now() where id = ${conversationId}`;
  }
  const messages = await sql()`
    select * from (
      select id, sender_id, body, offer_amount, offer_status, created_at from messages
      where conversation_id = ${conversationId} order by created_at desc limit ${MESSAGE_LIMIT}
    ) m order by created_at asc`;
  const photos = (c.photos as string[] | null) ?? [];
  const peerPhoto = await photoOf(str(role === "buyer" ? c.seller_id : c.buyer_id));
  return {
    id: str(c.id),
    role,
    peer: { name: str(c.peer_name) || "Kullanıcı", photo: peerPhoto },
    listing: {
      id: str(c.listing_id),
      title: str(c.title),
      price: num(c.price) ?? 0,
      unit: c.unit ? str(c.unit) : null,
      photo: photos[0] ?? STOCK_PHOTOS[str(c.category) as ListingCategory],
      status: str(c.listing_status) as ListingStatus,
    },
    messages: messages.map((m: Row) => ({
      id: str(m.id),
      mine: m.sender_id === userId,
      body: m.body === null ? null : str(m.body),
      offer: m.offer_amount === null ? null : { amount: num(m.offer_amount) ?? 0, status: str(m.offer_status) as OfferStatus },
      at: iso(m.created_at),
    })),
    peerReadAt: iso(role === "buyer" ? c.seller_read_at : c.buyer_read_at),
  };
}

export type InboxRow = {
  id: string;
  role: ChatRole;
  peerName: string;
  listingTitle: string;
  listingPhoto: string;
  listingStatus: ListingStatus;
  lastLine: string;
  lastAt: string;
  unread: number;
};

/** Everyone's chats for `userId`, latest first; `role` narrows to buying or selling. */
export async function listInbox(userId: string, role: ChatRole | "all"): Promise<InboxRow[]> {
  const rows = await sql()`
    select c.id, c.buyer_id, c.last_message_at, l.title, l.photos, l.category, l.status as listing_status,
      case when c.buyer_id = ${userId} then s.name else b.name end as peer_name,
      lm.body as last_body, lm.offer_amount as last_offer, lm.sender_id as last_sender,
      (select count(*) from messages m where m.conversation_id = c.id and m.sender_id <> ${userId}
        and m.created_at > case when c.buyer_id = ${userId} then c.buyer_read_at else c.seller_read_at end) as unread
    from conversations c
    join listings l on l.id = c.listing_id
    join profiles b on b.user_id = c.buyer_id
    join profiles s on s.user_id = c.seller_id
    left join lateral (
      select body, offer_amount, sender_id from messages m where m.conversation_id = c.id order by created_at desc limit 1
    ) lm on true
    where (c.buyer_id = ${userId} or c.seller_id = ${userId})
      and (${role} = 'all' or (${role} = 'buyer' and c.buyer_id = ${userId}) or (${role} = 'seller' and c.seller_id = ${userId}))
      and lm.sender_id is not null
    order by c.last_message_at desc
    limit 200`;
  return rows.map((r: Row) => {
    const photos = (r.photos as string[] | null) ?? [];
    const mine = r.last_sender === userId;
    const line = r.last_offer !== null ? offerLine(num(r.last_offer) ?? 0) : str(r.last_body);
    return {
      id: str(r.id),
      role: r.buyer_id === userId ? "buyer" : "seller",
      peerName: str(r.peer_name) || "Kullanıcı",
      listingTitle: str(r.title),
      listingPhoto: photos[0] ?? STOCK_PHOTOS[str(r.category) as ListingCategory],
      listingStatus: str(r.listing_status) as ListingStatus,
      lastLine: mine ? `Siz: ${line}` : line,
      lastAt: iso(r.last_message_at),
      unread: Number(r.unread),
    };
  });
}

/** How many chats have messages the person hasn't seen (for the header's badge). */
export async function unreadConversations(userId: string): Promise<number> {
  const rows = await sql()`
    select count(*) as n from conversations c
    where (c.buyer_id = ${userId} or c.seller_id = ${userId})
      and exists (
        select 1 from messages m where m.conversation_id = c.id and m.sender_id <> ${userId}
          and m.created_at > case when c.buyer_id = ${userId} then c.buyer_read_at else c.seller_read_at end
      )`;
  return Number(rows[0].n);
}

/** Whether the person may send another message now (a cap against scripts, not people). */
export async function underMessageLimit(userId: string) {
  const rows = await sql()`select count(*) as n from messages where sender_id = ${userId} and created_at > now() - interval '10 minutes'`;
  return Number(rows[0].n) < MESSAGE_BURST_LIMIT;
}
