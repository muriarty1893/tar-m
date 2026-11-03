import { describe, expect, it } from "vitest";
import { isCover, isDay, renderMarkdown, shareImage, slugify, validateArticle, type ArticleInput } from "@/lib/news";

const valid: ArticleInput = {
  title: "Buğday hasadı başladı",
  slug: "bugday-hasadi-basladi",
  summary: "Konya Ovası'nda buğday hasadı başladı; ilk verimler sevindirici.",
  body: "Hasat **bu hafta** başladı.",
  cover: "",
  date: "2026-11-03",
  status: "published",
};

describe("slugify", () => {
  it("turns a Turkish title into a URL-safe address", () => {
    expect(slugify("Buğday hasadı başladı!")).toBe("bugday-hasadi-basladi");
    expect(slugify("  İlçe Tarım Müdürlüğü: Şubat 2027  ")).toBe("ilce-tarim-mudurlugu-subat-2027");
    expect(slugify("Çiftçi Destek’ten duyuru")).toBe("ciftci-destekten-duyuru");
    expect(slugify("Konya'da buğday ekimi başladı")).toBe("konyada-bugday-ekimi-basladi");
  });
});

describe("validateArticle", () => {
  it("accepts a complete article", () => {
    expect(validateArticle(valid)).toEqual({});
  });

  it("names every missing field", () => {
    const e = validateArticle({ ...valid, title: "", slug: "", summary: "", body: "", date: "" });
    expect(Object.keys(e).sort()).toEqual(["body", "date", "slug", "summary", "title"]);
  });

  it("a draft may be saved without its text, a published article may not", () => {
    expect(validateArticle({ ...valid, body: "", status: "draft" })).toEqual({});
    expect(validateArticle({ ...valid, body: " ", status: "published" }).body).toBeTruthy();
  });

  it("refuses addresses that aren't URL-safe and days that don't exist", () => {
    expect(validateArticle({ ...valid, slug: "Buğday Hasadı" }).slug).toBeTruthy();
    expect(validateArticle({ ...valid, slug: "../gizli" }).slug).toBeTruthy();
    expect(isDay("2026-02-30")).toBe(false);
    expect(isDay("2026-02-28")).toBe(true);
  });

  it("covers are our own uploads or pictures already on the site", () => {
    expect(isCover("https://sfl1rhxasno8lh61.public.blob.vercel-storage.com/haberler/kapak-1.webp")).toBe(true);
    expect(isCover("/demo/bugday-sari-pas.webp")).toBe(true);
    expect(isCover("https://evil.example.com/x.jpg")).toBe(false);
    expect(isCover("javascript:alert(1)")).toBe(false);
    expect(validateArticle({ ...valid, cover: "https://evil.example.com/x.jpg" }).cover).toBeTruthy();
  });
});

describe("renderMarkdown", () => {
  it("renders Markdown", () => {
    expect(renderMarkdown("## Başlık\n\n**kalın** ve [bağlantı](https://example.com)")).toContain("<strong>kalın</strong>");
  });

  it("drops raw HTML and scripts", () => {
    const out = renderMarkdown('Merhaba <script>alert(1)</script> <img src=x onerror="alert(1)"> [x](javascript:alert(1))');
    expect(out).not.toContain("<script");
    expect(out).not.toContain("onerror");
    expect(out).not.toContain("javascript:");
  });
});

describe("shareImage", () => {
  it("uses the cover, else the site share image", () => {
    expect(shareImage("/demo/a.webp")).toBe("/demo/a.webp");
    expect(shareImage(undefined)).toEqual({ url: "/opengraph-image", width: 1200, height: 630 });
  });
});
