import { describe, it, expect } from "vitest";
import path from "node:path";
import { getAllArticles, getArticle, shareImage } from "@/lib/news";

const fx = (name: string) => path.join(__dirname, "..", "fixtures", name);

describe("getAllArticles", () => {
  it("returns articles newest first", async () => {
    const articles = await getAllArticles(fx("news-valid"));
    expect(articles.at(-1)?.slug).toBe("eski");
    expect(articles[0].date).toBe("2026-10-05");
  });

  it("breaks same-date ties by slug ascending", async () => {
    const slugs = (await getAllArticles(fx("news-valid"))).map((a) => a.slug);
    expect(slugs).toEqual(["a-haber", "b-haber", "eski"]);
  });

  it("normalises dates to YYYY-MM-DD strings and renders markdown to html", async () => {
    const [, , eski] = await getAllArticles(fx("news-valid"));
    expect(eski.date).toBe("2026-09-01");
    expect(eski.html).toContain("<strong>içerik</strong>");
    expect(eski.cover).toBe("/images/a.jpg");
  });

  it("allows a missing cover", async () => {
    const a = (await getAllArticles(fx("news-valid")))[0];
    expect(a.cover).toBeUndefined();
  });

  it("throws naming the file when title is missing", async () => {
    await expect(getAllArticles(fx("news-missing-title"))).rejects.toThrow(/basliksiz\.md.*title/);
  });

  it("throws naming the file when date is invalid", async () => {
    await expect(getAllArticles(fx("news-bad-date"))).rejects.toThrow(/bozuk-tarih\.md.*date/);
  });

  it("throws when a filename is not a URL-safe slug", async () => {
    await expect(getAllArticles(fx("news-bad-slug"))).rejects.toThrow(/Çiftçi Haberi\.md/);
  });

  it("returns an empty list for a folder without articles", async () => {
    expect(await getAllArticles(fx("news-empty"))).toEqual([]);
  });
});

describe("getArticle", () => {
  it("returns the article for a known slug", async () => {
    const a = await getArticle("b-haber", fx("news-valid"));
    expect(a?.title).toBe("Yeni haber B");
  });

  it("returns null for an unknown slug", async () => {
    expect(await getArticle("yok-boyle-bir-haber", fx("news-valid"))).toBeNull();
  });

  it("returns null for a path-traversal slug", async () => {
    expect(await getArticle("../news-bad-date/bozuk-tarih", fx("news-valid"))).toBeNull();
  });
});

describe("shareImage", () => {
  it("uses the article's cover when it has one", () => {
    expect(shareImage("/demo/bugday-sari-pas.webp")).toBe("/demo/bugday-sari-pas.webp");
  });

  it("falls back to the site share image (1200×630) without a cover", () => {
    expect(shareImage(undefined)).toEqual({ url: "/opengraph-image", width: 1200, height: 630 });
  });
});
