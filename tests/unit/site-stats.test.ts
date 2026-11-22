import { describe, expect, it } from "vitest";
import { countryLabel, deviceLabel, mergeByLabel, osLabel, pageLabel, pageRef, parsePeriod, periodRange, referrerLabel, type PageTitles } from "@/lib/site-stats";

const titles: PageTitles = {
  topics: new Map([["d298638a-cff3-4802-86bc-949202878030", "Buğday ekimi ne zaman?"]]),
  listings: new Map(),
  articles: new Map([["kis-oncesi-traktor-bakimi", "Kış öncesi traktör bakımı"]]),
  categories: new Map([["hayvancilik", "Hayvancılık"]]),
};

describe("site stats labels", () => {
  it("reads the period, defaulting to 7 days", () => {
    expect(parsePeriod("30")).toBe(30);
    expect(parsePeriod("90")).toBe(90);
    expect(parsePeriod("5")).toBe(7);
    expect(parsePeriod(undefined)).toBe(7);
  });

  it("starts the window at 00:00 UTC, today included", () => {
    const now = new Date("2026-11-22T21:30:00Z");
    expect(periodRange(7, now)).toEqual({ since: "2026-11-16T00:00:00.000Z", until: "2026-11-22T21:30:00.000Z" });
  });

  it("names pages, with titles from the database", () => {
    expect(pageLabel("/", titles)).toBe("Ana sayfa");
    expect(pageLabel("/forum/", titles)).toBe("Forum");
    expect(pageLabel("/forum/d298638a-cff3-4802-86bc-949202878030", titles)).toBe("Forum: Buğday ekimi ne zaman?");
    expect(pageLabel("/forum/11111111-2222-3333-4444-555555555555", titles)).toBe("Forum: silinmiş konu");
    expect(pageLabel("/haberler/kis-oncesi-traktor-bakimi", titles)).toBe("Haber: Kış öncesi traktör bakımı");
    expect(pageLabel("/forum/k/hayvancilik", titles)).toBe("Forum bölümü: Hayvancılık");
    expect(pageLabel("/forum/kisi/murateker", titles)).toBe("Profil: @murateker");
    expect(pageLabel("/yonetim/uyeler", titles)).toBe("Yönetim paneli");
    expect(pageLabel("/bilinmeyen", titles)).toBe("/bilinmeyen");
    expect(pageRef("/pazar/ilan/D298638A-CFF3-4802-86BC-949202878030")).toEqual({ kind: "listing", id: "d298638a-cff3-4802-86bc-949202878030" });
  });

  it("names where visitors came from", () => {
    expect(referrerLabel("")).toMatch(/^Doğrudan/);
    expect(referrerLabel("www.google.com.tr")).toBe("Google");
    expect(referrerLabel("l.facebook.com")).toBe("Facebook");
    expect(referrerLabel("t.co")).toBe("X (Twitter)");
    expect(referrerLabel("ciftcidestek.com.tr")).toBe("Sitenin kendisi");
    expect(referrerLabel("example.org")).toBe("example.org");
  });

  it("names devices, systems and countries in Turkish", () => {
    expect(deviceLabel("mobile")).toBe("Telefon");
    expect(deviceLabel("desktop")).toBe("Bilgisayar");
    expect(osLabel("iOS")).toBe("iPhone / iPad (iOS)");
    expect(osLabel("Android")).toBe("Android");
    expect(countryLabel("TR")).toBe("Türkiye");
    expect(countryLabel("")).toBe("Bilinmiyor");
  });

  it("adds up rows that share a label, biggest first", () => {
    const rows = [
      { k: "/forum", visitors: 2, pageviews: 3 },
      { k: "/", visitors: 5, pageviews: 9 },
      { k: "/forum/", visitors: 4, pageviews: 4 },
    ];
    expect(mergeByLabel(rows, (r) => pageLabel(r.k, titles))).toEqual([
      { label: "Forum", visitors: 6, pageviews: 7 },
      { label: "Ana sayfa", visitors: 5, pageviews: 9 },
    ]);
  });
});
