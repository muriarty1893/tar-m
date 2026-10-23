import { describe, expect, test } from "vitest";
import { evaluateOffer, lastLine, priceStep, replyText, seedConversations, unreadCount, type Conversation } from "@/data/demo-chat";
import { LISTINGS, ME, listingById } from "@/data/demo-market";

const tractor = listingById("l-traktor", [])!;

describe("offers", () => {
  test("price steps grow with the price", () => {
    expect(priceStep(3_250_000)).toBe(5000);
    expect(priceStep(38_500)).toBe(500);
    expect(priceStep(1400)).toBe(50);
    expect(priceStep(220)).toBe(10);
    expect(priceStep(4.5)).toBe(0.5);
  });

  test("92 % of the price or more is accepted", () => {
    expect(evaluateOffer(685000, 640000)).toEqual({ kind: "accept" });
  });

  test("under 60 % is turned down", () => {
    expect(evaluateOffer(685000, 400000)).toEqual({ kind: "reject" });
  });

  test("in between, the seller counters halfway, rounded to the step", () => {
    expect(evaluateOffer(685000, 600000)).toEqual({ kind: "counter", amount: 645000 });
    expect(evaluateOffer(220, 180)).toEqual({ kind: "counter", amount: 200 });
  });
});

describe("scripted replies", () => {
  test("the seller answers by topic", () => {
    expect(replyText(tractor, "Hâlâ satılık mı?", "seller")).toMatch(/satılık/i);
    expect(replyText(tractor, "Nerede görebilirim?", "seller")).toContain("Ereğli");
    expect(replyText(tractor, "Son fiyat ne olur?", "seller")).toMatch(/teklif/i);
    expect(replyText({ ...tractor, negotiable: false }, "son fiyat?", "seller")).toMatch(/sabit/i);
  });

  test("anything else gets a polite holding answer", () => {
    expect(replyText(tractor, "Merhabalar", "seller").length).toBeGreaterThan(10);
  });

  test("a buyer writing back about my listing answers as a buyer", () => {
    const mine = LISTINGS.find((l) => l.sellerId === ME.id)!;
    expect(replyText(mine, "Evet, satılık", "buyer")).not.toEqual(replyText(mine, "Evet, satılık", "seller"));
  });
});

describe("conversations", () => {
  const now = new Date("2026-10-17T10:00:00");
  const convs = seedConversations(now);

  test("three sample chats, two with unread messages, one about my own listing", () => {
    expect(convs).toHaveLength(3);
    expect(convs.filter((c) => unreadCount(c) > 0)).toHaveLength(2);
    expect(convs.filter((c) => c.role === "seller")).toHaveLength(1);
  });

  test("unreadCount counts their messages after I last read", () => {
    const c: Conversation = {
      id: "x", listingId: "l-traktor", peerId: "s-ibrahim", role: "buyer", readAt: "2026-10-17T09:00:00.000Z",
      messages: [
        { id: "1", from: "them", at: "2026-10-17T08:00:00.000Z", text: "a" },
        { id: "2", from: "them", at: "2026-10-17T09:30:00.000Z", text: "b" },
        { id: "3", from: "me", at: "2026-10-17T09:40:00.000Z", text: "c" },
      ],
    };
    expect(unreadCount(c)).toBe(1);
  });

  test("lastLine shows who wrote it, and offers as amounts", () => {
    const base = { id: "x", listingId: "l-traktor", peerId: "s-ibrahim", role: "buyer" as const, readAt: "" };
    expect(lastLine({ ...base, messages: [{ id: "1", from: "me", at: "", text: "Merhaba" }] })).toBe("Siz: Merhaba");
    expect(lastLine({ ...base, messages: [{ id: "1", from: "them", at: "", offer: { amount: 645000, status: "pending" } }] })).toBe("Karşı teklif: 645.000 ₺");
    expect(lastLine({ ...base, messages: [{ id: "1", from: "me", at: "", offer: { amount: 600000, status: "countered" } }] })).toBe("Siz: Teklif 600.000 ₺");
    expect(lastLine({ ...base, messages: [] })).toBe("");
  });
});
