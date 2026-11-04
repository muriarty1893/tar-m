import { describe, expect, test } from "vitest";
import { forumHref, handleFromName, insertMention, mentionAtCursor, mentionsIn, parseForumQuery, splitMentions, threadReplies, topicSearchText, validateHandle, validateReply, validateTopic } from "@/lib/forum";

const PHOTO = "https://abc123.public.blob.vercel-storage.com/forum/foto-1.jpg";

describe("forum topics", () => {
  test("a kind, a title and some text are required", () => {
    expect(Object.keys(validateTopic({ category: "", title: "", body: "", photos: [] })).sort()).toEqual(["body", "category", "title"]);
    expect(validateTopic({ category: "bitki", title: "Mısır kurdu ilacı", body: "Hangi ilacı önerirsiniz?", photos: [] })).toEqual({});
    expect(validateTopic({ category: "uzay", title: "Mısır kurdu ilacı", body: "Hangi ilacı önerirsiniz?", photos: [] }).category).toBeTruthy();
    expect(validateTopic({ category: "bitki", title: "x".repeat(121), body: "Hangi ilacı önerirsiniz?", photos: [] }).title).toBeTruthy();
  });

  test("replies: two characters to 3000", () => {
    expect(validateReply(" ")).toBeTruthy();
    expect(validateReply("Evet")).toBeNull();
    expect(validateReply("x".repeat(3001))).toBeTruthy();
  });

  test("search folds Turkish letters", () => {
    expect(topicSearchText("Süt Verimi", "İneklerde")).toBe("sut verimi ineklerde");
  });
});

describe("forum addresses", () => {
  test("unknown filters fall back to the defaults", () => {
    expect(parseForumQuery({ kategori: "uzay", sirala: "rastgele", sayfa: "-3", q: "  mazot " })).toEqual({ q: "mazot", kategori: "tumu", sirala: "yeni", sayfa: 1 });
    expect(parseForumQuery({ kategori: "hayvan", sirala: "populer", sayfa: "2" })).toMatchObject({ kategori: "hayvan", sirala: "populer", sayfa: 2 });
  });

  test("defaults are left out, a filter change starts at page 1", () => {
    const q = parseForumQuery({ kategori: "hayvan", sayfa: "3" });
    expect(forumHref(q)).toBe("/forum?kategori=hayvan");
    expect(forumHref(q, { sayfa: 4 })).toBe("/forum?kategori=hayvan&sayfa=4");
    expect(forumHref(parseForumQuery({}))).toBe("/forum");
  });
});

describe("forum, X-style", () => {
  test("photos: up to 4, only the site's own forum uploads", () => {
    const t = { category: "bitki", title: "Mısır kurdu ilacı", body: "Hangi ilacı önerirsiniz?" };
    expect(validateTopic({ ...t, photos: [PHOTO, PHOTO, PHOTO, PHOTO] })).toEqual({});
    expect(validateTopic({ ...t, photos: [PHOTO, PHOTO, PHOTO, PHOTO, PHOTO] }).photos).toBeTruthy();
    expect(validateTopic({ ...t, photos: ["https://abc123.public.blob.vercel-storage.com/ilanlar/x.jpg"] }).photos).toBeTruthy();
    expect(validateTopic({ ...t, photos: ["https://example.com/forum/x.jpg"] }).photos).toBeTruthy();
  });

  test("a reply may be a photo alone", () => {
    expect(validateReply("", [PHOTO])).toBeNull();
    expect(validateReply("", [])).toBeTruthy();
    expect(validateReply("Evet", ["https://example.com/x.jpg"])).toBeTruthy();
  });

  test("usernames from names, and their rules", () => {
    expect(handleFromName("Mehmet Ali Yılmaz")).toBe("mehmetaliyilmaz");
    expect(handleFromName("Şükrü Çağlar Öztürk").length).toBeLessThanOrEqual(16);
    expect(handleFromName("Ö")).toBe("ciftcio");
    expect(validateHandle("ahmet_42")).toBeNull();
    expect(validateHandle("ab")).toBeTruthy();
    expect(validateHandle("ahmetçiftçi")).toBeTruthy();
    expect(validateHandle("Ahmet")).toBeTruthy();
  });

  test("mentions: found once each, lower case, not inside e-mail addresses", () => {
    expect(mentionsIn("@Ahmet ve @veli_42, bir de @ahmet")).toEqual(["ahmet", "veli_42"]);
    expect(mentionsIn("mail: ali@ornek.com")).toEqual([]);
    expect(mentionsIn("@ab kısa")).toEqual([]);
    expect(splitMentions("Merhaba @ahmet, nasılsın?")).toEqual([{ text: "Merhaba " }, { handle: "ahmet" }, { text: ", nasılsın?" }]);
    expect(splitMentions("@veli")).toEqual([{ handle: "veli" }]);
  });

  test("the @word at the cursor, and putting a username in its place", () => {
    expect(mentionAtCursor("Selam @ah", 9)).toEqual({ query: "ah", start: 6 });
    expect(mentionAtCursor("Selam @", 7)).toEqual({ query: "", start: 6 });
    expect(mentionAtCursor("ali@ornek", 9)).toBeNull();
    expect(mentionAtCursor("Selam @ahmet nasıl", 18)).toBeNull();
    const at = mentionAtCursor("Selam @ah", 9)!;
    expect(insertMention("Selam @ah", at, 9, "ahmet")).toEqual({ text: "Selam @ahmet ", cursor: 13 });
  });

  test("threads: answers to the topic, each with everything under it, oldest first", () => {
    const r = (id: string, parentId: string | null, at: string) => ({ id, parentId, createdAt: `2026-11-04T10:${at}:00Z` });
    const thread = threadReplies([r("c", "a", "03"), r("a", null, "01"), r("b", null, "02"), r("d", "c", "04"), r("e", "gone", "05")]);
    expect(thread.map((t) => t.reply.id)).toEqual(["a", "b", "e"]);
    expect(thread[0].children.map((c) => [c.reply.id, c.parent.id])).toEqual([["c", "a"], ["d", "c"]]);
  });
});
