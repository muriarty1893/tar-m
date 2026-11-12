import { parse, type HTMLElement } from "node-html-parser";
import { fold } from "@/data/demo-market";
import { SLUG_MAX, SUMMARY_MAX, TITLE_MAX, type ArticleKind } from "./news";

/**
 * Where automatic news comes from, and how their pages are read. Pure functions over HTML, so they're
 * tested against saved pages; the fetching and saving is lib/services/news-import.ts.
 *
 * Only the headline, the date and a short summary are kept, always with a link to the original: the
 * sources' own text and photos stay on their sites.
 */

export type SourceId = "tkdk" | "bakanlik";
export type Section = "haber" | "duyuru";

export type NewsSource = {
  id: SourceId;
  /** Shown as "Kaynak: …" and on the link to the original. */
  name: string;
  /** The page that lists the newest items. */
  listUrl: string;
  /** The links to articles on the list page, made absolute. */
  links: (html: string) => Candidate[];
  article: (html: string) => SourceArticle | null;
};

/** A link found on a list page. */
export type Candidate = { url: string; section: Section };

/** What an article page says. `date` is YYYY-MM-DD. */
export type SourceArticle = {
  title: string;
  date: string;
  paragraphs: string[];
};

// ---------------------------------------------------------------- Text helpers

const clean = (s: string) =>
  s
    .replace(/[​‌‍﻿]/g, "")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** "18.05.2026" → "2026-05-18"; null for anything else. */
export function trDate(s: string): string | null {
  const m = /(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(s);
  if (!m) return null;
  const [, d, mo, y] = m;
  const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

/** Abbreviations that stay in capitals when a title is re-cased. */
const ACRONYMS = new Set(
  [
    "AB",
    "ABD",
    "AR-GE",
    "BM",
    "BMS",
    "COP31",
    "ÇKS",
    "DSİ",
    "FAO",
    "GKGM",
    "IPARD",
    "KDV",
    "KOOP",
    "LEADER",
    "OSB",
    "SSS",
    "STK",
    "TARGET",
    "TİGEM",
    "TKDK",
    "TL",
    "TMO",
    "TÜİK",
    "TÜRKVET",
    "TZOB",
    "ZMO",
    "BUGEM",
    "TAGEM",
    "HAYGEM",
    // Roman numerals ("IPARD III").
    "II",
    "III",
    "IV",
    "VI",
    "VII",
    "VIII",
    "IX",
    "XI",
    "XII",
  ].map((a) => a.toLocaleLowerCase("tr")),
);
/** Small words that stay lower case inside a title. */
const SMALL = new Set(["ve", "ile", "için", "de", "da", "ki", "veya", "ya", "mı", "mi"]);

/** One word (or one part of "türkiye-ab"), in a title's case. */
const caseWord = (bare: string, first: boolean): string => {
  if (ACRONYMS.has(bare)) return bare.toLocaleUpperCase("tr");
  if (!first && SMALL.has(bare)) return bare;
  return bare.includes("-")
    ? bare
        .split("-")
        .map((p, i) => caseWord(p, first && i === 0))
        .join("-")
    : capitalize(bare);
};

const capitalize = (w: string) => w.charAt(0).toLocaleUpperCase("tr") + w.slice(1);

/**
 * "TKDK BAŞKANIMIZ ANKARA VALİSİ CANBOLAT'I ZİYARET ETTİ" → "TKDK Başkanımız Ankara Valisi Canbolat'ı
 * Ziyaret Etti". Titles already in mixed case are left as they are.
 */
export function titleCase(raw: string): string {
  const title = clean(raw);
  const letters = title.replace(/[^\p{L}]/gu, "");
  const upper = letters.replace(/[^\p{Lu}]/gu, "").length;
  if (letters.length === 0 || upper / letters.length < 0.7) return title;
  return title
    .toLocaleLowerCase("tr")
    .split(" ")
    .map((word, i) => {
      // The part after an apostrophe is a suffix: "COP31’DE" → "COP31’de", "CANBOLAT'I" → "Canbolat'ı".
      const [head, ...rest] = word.split(/(?=['’])/);
      const bare = head.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}-]+$/gu, "");
      const lead = head.slice(0, head.indexOf(bare.charAt(0)));
      const tail = head.slice(lead.length + bare.length);
      return lead + caseWord(bare, i === 0) + tail + rest.join("");
    })
    .join(" ");
}

/** The title, cut to what the site allows. */
export function fitTitle(title: string): string {
  return title.length <= TITLE_MAX ? title : `${title.slice(0, TITLE_MAX - 1).replace(/\s+\S*$/, "")}…`;
}

const FALLBACK_SUMMARY = "Ayrıntılar ve ekler kaynağın sayfasında.";

/**
 * A short summary from the opening paragraphs: whole sentences up to the limit, else cut at a word.
 * Paragraphs that only repeat the title are skipped.
 */
export function summarize(paragraphs: string[], title = ""): string {
  const key = (s: string) => fold(s).replace(/[^a-z0-9]+/g, "");
  const titleKey = key(title);
  const text = paragraphs
    .map(clean)
    .filter((p) => p.length > 1 && key(p) !== titleKey)
    .join(" ");
  if (text.length < 10) return FALLBACK_SUMMARY;
  if (text.length <= SUMMARY_MAX) return text;
  // A sentence ends at . ! ? after a word, before a capital: Turkish ordinals ("10. Çağrı") don't end one.
  const sentences = text.split(/(?<=[^\d\s][.!?]["”)]?)\s+(?=[\p{Lu}"“(])/u).reduce<string[]>((acc, s) => {
    // "Dr. Ahmet", "M. Musa Timur", "Prof. Dr.": a title or an initial doesn't end a sentence either.
    const prev = acc.at(-1);
    if (prev && /(?:^|\s)(?:\p{L}{1,2}|Prof|Doç|Yrd|Öğr|Gör|Uzm)\.$/u.test(prev)) acc[acc.length - 1] = `${prev} ${s}`;
    else acc.push(s);
    return acc;
  }, []);
  let out = "";
  for (const s of sentences) {
    if ((out ? `${out} ${s}` : s).length > SUMMARY_MAX) break;
    out = out ? `${out} ${s}` : s;
  }
  if (out.length >= 60) return out;
  return `${text.slice(0, SUMMARY_MAX - 1).replace(/\s+\S*$/, "")}…`;
}

/** An address for the article on this site: the title's words plus the source's own number. */
export function slugFor(title: string, source: SourceId, sourceKey: string): string {
  const suffix = `-${source === "bakanlik" ? "tob" : source}-${sourceKey}`;
  const words = fold(title)
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  let base = words.slice(0, SLUG_MAX - suffix.length);
  if (base.length < words.length) base = base.replace(/-[^-]*$/, "");
  return `${base.replace(/-+$/, "") || "haber"}${suffix}`;
}

/** The source's number for an article, from its address ("…-13210", "/Haber/7380/…"). */
export function sourceKey(url: string): string {
  const path = new URL(url).pathname;
  return (
    /\/(?:Haber|Duyuru)\/(\d+)\//.exec(path)?.[1] ??
    /-(\d+)$/.exec(path)?.[1] ??
    fold(path)
      .replace(/[^a-z0-9]+/g, "")
      .slice(-12)
  );
}

// Things the Ministry and TKDK post that aren't for farmers: tenders, staff exams and hiring, park
// management, internships, ceremonies. Matched against the folded title (or the address's words).
const OFF_TOPIC = [
  /\bihale/,
  /\bsinav/,
  /\bpersonel/,
  /\bstaj/,
  /\bmilli park/,
  /\btabiat park/,
  /\bisletmecilik/,
  /\byapim isi/,
  /\byerlestiril/,
  /\bistenilen evrak/,
  /\batama/,
  /\bgorevde yukselme/,
  /\bunvan degisikligi/,
  /\bsozlesmeli/,
  /\bis ilani/,
  /\balim ilani/,
  /\bvefat/,
  /\banma\b/,
  /\b15 temmuz/,
  /\b\d+ yasinda\b/,
  /\bbayram/,
  /\bkutlu olsun/,
  /\bfotograf yarismasi/,
  /\bdunya .* gunu\b/,
];

export function isOffTopic(text: string): boolean {
  const t = fold(text.replace(/[-_]+/g, " "));
  return OFF_TOPIC.some((re) => re.test(t));
}

const DESTEK = /\b(hibe|destek|tesvik|basvuru|cagri|odeme|odendi|kredi|ipard|leader|cks|aski listesi|prim)/;

/** Destek when it's about money farmers can get or apply for; otherwise what the source called it. */
export function classify(section: Section, title: string): ArticleKind {
  return DESTEK.test(fold(title)) ? "destek" : section;
}

// ---------------------------------------------------------------- Page readers

/** Absolute links on a page whose path matches `re`, each once, in page order. */
function linksMatching(root: HTMLElement, base: string, re: RegExp): Candidate[] {
  const seen = new Set<string>();
  const out: Candidate[] = [];
  for (const a of root.querySelectorAll("a[href]")) {
    let url: URL;
    try {
      url = new URL(a.getAttribute("href")!.trim(), base);
    } catch {
      continue;
    }
    if (url.origin !== new URL(base).origin) continue;
    const m = re.exec(url.pathname);
    if (!m) continue;
    url.hash = "";
    url.search = "";
    if (seen.has(url.href)) continue;
    seen.add(url.href);
    out.push({
      url: url.href,
      section: m[1].toLowerCase() === "duyuru" ? "duyuru" : "haber",
    });
  }
  return out;
}

const paragraphsIn = (el: HTMLElement | null) =>
  el
    ? el
        .querySelectorAll("p")
        .map((p) => clean(p.text))
        .filter(Boolean)
    : [];

/** Text blocks, whatever builds them (<p>, <div>, <br>): the Ministry's editor uses all three. */
const blocksIn = (el: HTMLElement | null) => {
  if (!el) return [];
  // Attachments ("…(Eylül Güncel).pdf") are links on the source's page, not text to summarise.
  for (const a of el.querySelectorAll("a[href]")) if (/\.(pdf|docx?|xlsx?|pptx?|zip|rar)(\?|$)/i.test(a.getAttribute("href")!)) a.remove();
  return el.structuredText.split("\n").map(clean).filter(Boolean);
};

const TKDK_BASE = "https://www.tkdk.gov.tr/";
const BAKANLIK_BASE = "https://www.tarimorman.gov.tr/";

export const SOURCES: NewsSource[] = [
  {
    id: "tkdk",
    name: "TKDK",
    // The home page lists the newest; its /Haberler list is not in date order.
    listUrl: TKDK_BASE,
    links: (html) => linksMatching(parse(html), TKDK_BASE, /^\/(Haber|Duyuru)\/[^/]+-\d+$/i),
    article: (html) => {
      const root = parse(html);
      const box = root.querySelector(".duyuruIcerik");
      const title = clean(box?.querySelector("h2")?.text ?? "");
      const date = trDate(box?.querySelector(".post-left")?.text ?? "");
      if (!box || !title || !date) return null;
      return { title: titleCase(title), date, paragraphs: paragraphsIn(box) };
    },
  },
  {
    id: "bakanlik",
    name: "Tarım ve Orman Bakanlığı",
    listUrl: BAKANLIK_BASE,
    links: (html) => linksMatching(parse(html), BAKANLIK_BASE, /^\/(Haber|Duyuru)\/\d+\/[^/]+$/i),
    article: (html) => {
      const root = parse(html);
      const title = clean(root.querySelector("h3[id$=detaybaslik]")?.text ?? "");
      const date = trDate(root.querySelector(".itemDateCreated")?.text ?? "");
      if (!title || !date) return null;
      const body = root.querySelector(".itemBody div[class^=ExternalClass]") ?? root.querySelector(".itemBody");
      return { title: titleCase(title), date, paragraphs: blocksIn(body) };
    },
  },
];

export const sourceById = (id: string) => SOURCES.find((s) => s.id === id);
