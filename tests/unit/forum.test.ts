import { describe, expect, test } from "vitest";
import { forumHref, parseForumQuery, topicSearchText, validateReply, validateTopic } from "@/lib/forum";

describe("forum topics", () => {
  test("a kind, a title and some text are required", () => {
    expect(Object.keys(validateTopic({ category: "", title: "", body: "" })).sort()).toEqual(["body", "category", "title"]);
    expect(validateTopic({ category: "bitki", title: "Mısır kurdu ilacı", body: "Hangi ilacı önerirsiniz?" })).toEqual({});
    expect(validateTopic({ category: "uzay", title: "Mısır kurdu ilacı", body: "Hangi ilacı önerirsiniz?" }).category).toBeTruthy();
    expect(validateTopic({ category: "bitki", title: "x".repeat(121), body: "Hangi ilacı önerirsiniz?" }).title).toBeTruthy();
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
