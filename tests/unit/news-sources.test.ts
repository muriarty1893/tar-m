import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { classify, isOffTopic, slugFor, sourceById, sourceKey, summarize, titleCase, trDate } from "@/lib/news-sources";
import { SLUG_MAX, SUMMARY_MAX } from "@/lib/news";

// Pages saved from the sources on 2026-11-12 (scripts and styles removed).
const page = (name: string) => fs.readFileSync(path.join(__dirname, "fixtures", "news", name), "utf8");
const tkdk = sourceById("tkdk")!;
const bakanlik = sourceById("bakanlik")!;

describe("TKDK", () => {
  it("finds news and announcements on the home page, each once", () => {
    const links = tkdk.links(page("tkdk-home.html"));
    expect(links).toContainEqual({
      url: "https://www.tkdk.gov.tr/Duyuru/yeni-uygun-harcama-talep-formu-yayimlanmistir-13210",
      section: "duyuru",
    });
    expect(links).toContainEqual({
      url: "https://www.tkdk.gov.tr/Haber/tkdk-cop31-de-ipard-ve-sifir-atik-desteklerini-tanitiyor-13209",
      section: "haber",
    });
    expect(new Set(links.map((l) => l.url)).size).toBe(links.length);
    // Section pages without a number aren't articles.
    expect(links.some((l) => l.url.endsWith("/Duyuru/IKDuyuru"))).toBe(false);
  });

  it("reads an article's title, date and text", () => {
    const a = tkdk.article(page("tkdk-article.html"))!;
    expect(a.title).toBe("Nisan 2026’da 374,7 Milyon TL IPARD Hibesi Ödendi");
    expect(a.date).toBe("2026-05-18");
    expect(a.paragraphs[0]).toMatch(/^Tarım ve Kırsal Kalkınmayı Destekleme Kurumu \(TKDK\) tarafından IPARD III/);
  });
});

describe("Tarım ve Orman Bakanlığı", () => {
  it("finds news and announcements on the home page", () => {
    const links = bakanlik.links(page("bakanlik-home.html"));
    expect(links).toContainEqual({
      url: "https://www.tarimorman.gov.tr/Haber/7380/Turk-Gida-Kodeksi-Peynir-Tebligi-Guncellendi",
      section: "haber",
    });
    expect(links.some((l) => l.section === "duyuru" && l.url.includes("/Duyuru/2742/"))).toBe(true);
  });

  it("reads a news article", () => {
    const a = bakanlik.article(page("bakanlik-haber.html"))!;
    expect(a.title).toBe("Türk Gıda Kodeksi Peynir Tebliği Güncellendi");
    expect(a.date).toBe("2026-11-11");
    expect(a.paragraphs[0]).toMatch(/^Türk Gıda Kodeksi Peynir Tebliği, 10 Kasım 2026/);
  });

  it("reads an announcement whose title is already in mixed case", () => {
    const a = bakanlik.article(page("bakanlik-duyuru.html"))!;
    expect(a.title).toBe("Gübre Analizinde Yetkilendirilen Laboratuvarlar ve Referans Kuruluşları Güncellendi");
    expect(a.paragraphs[0]).toMatch(/^Gübre Analiz ve Referans Kuruluşları/);
    expect(a.paragraphs.join(" ")).not.toMatch(/\.pdf/);
  });

  it("reads text built from <div> and <br>, not only <p>", () => {
    const a = bakanlik.article(page("bakanlik-haber-div.html"))!;
    expect(summarize(a.paragraphs, a.title)).toMatch(/^2026 yılı “Tohumculuk Hizmetleri Değerlendirme Toplantısı" Genel Müdür Yardımcımız/);
  });

  it("skips an opening line that only repeats the title", () => {
    const a = bakanlik.article(page("bakanlik-haber-tekrar.html"))!;
    const s = summarize(a.paragraphs, a.title);
    expect(s).not.toMatch(/^Gübrelerin Piyasa Gözetimi ve Denetimi Değerlendirme Toplantısı Antalya’da Yapılıyor\.?$/);
    expect(s.length).toBeGreaterThan(60);
  });

  it("returns null for a page that isn't an article", () => {
    expect(bakanlik.article(page("bakanlik-home.html"))).toBeNull();
    expect(tkdk.article(page("tkdk-home.html"))).toBeNull();
  });
});

describe("text", () => {
  it("re-cases all-caps titles in Turkish, keeping abbreviations and suffixes", () => {
    expect(titleCase("TKDK BAŞKANIMIZ ANKARA VALİSİ CANBOLAT'I ZİYARET ETTİ")).toBe("TKDK Başkanımız Ankara Valisi Canbolat'ı Ziyaret Etti");
    expect(titleCase("TKDK, COP31’DE IPARD VE SIFIR ATIK DESTEKLERİNİ TANITIYOR")).toBe("TKDK, COP31’de IPARD ve Sıfır Atık Desteklerini Tanıtıyor");
    expect(titleCase("TÜRKİYE-AB YÜKSEK DÜZEYLİ TARIM DİYALOĞU")).toBe("Türkiye-AB Yüksek Düzeyli Tarım Diyaloğu");
    expect(titleCase("IPARD III PROGRAMI 10. ÇAĞRI DÖNEMİ")).toBe("IPARD III Programı 10. Çağrı Dönemi");
    expect(titleCase("KONYA’YA BİR DİZİ ZİYARET")).toBe("Konya’ya Bir Dizi Ziyaret");
    expect(titleCase("Yeni Uygun Harcama Talep Formu Yayımlanmıştır")).toBe("Yeni Uygun Harcama Talep Formu Yayımlanmıştır");
  });

  it("reads Turkish dates", () => {
    expect(trDate(" 11.11.2026 / ")).toBe("2026-11-11");
    expect(trDate("1.2.2026")).toBe("2026-02-01");
    expect(trDate("yok")).toBeNull();
  });

  it("summarises in whole sentences within the limit", () => {
    const long = Array.from({ length: 12 }, (_, i) => `Bu ${i + 1}. cümle biraz uzunca bir açıklama içeriyor.`);
    const s = summarize(long);
    expect(s.length).toBeLessThanOrEqual(SUMMARY_MAX);
    expect(s).toMatch(/\.$/);
    const ordinals = summarize([
      "IPARD III Programı 10. Başvuru Çağrı Dönemi 2. Grup ve 11. Başvuru Çağrı Dönemi 1. Grup listesi yayımlanmıştır. (10. Çağrı 2. Grup listesi için tıklayınız.) " +
        "Ek olarak bu duyuruda başka ayrıntılar ve tarihler yer almaktadır, ilgili başvuru sahiplerinin listeyi dikkatle incelemeleri ve gerekli belgeleri zamanında sunmaları önemle rica olunur.",
    ]);
    expect(ordinals).toBe(
      "IPARD III Programı 10. Başvuru Çağrı Dönemi 2. Grup ve 11. Başvuru Çağrı Dönemi 1. Grup listesi yayımlanmıştır. (10. Çağrı 2. Grup listesi için tıklayınız.)",
    );
    const titled = summarize(["Eğitim Ankara’da başladı. TKDK Başkanımız Dr. Ahmet Antalyalı ve Prof. Dr. M. Musa Timur açılışa katıldı. " + "Sonraki cümle çok uzun bir açıklama. ".repeat(10)]);
    expect(titled.startsWith("Eğitim Ankara’da başladı. TKDK Başkanımız Dr. Ahmet Antalyalı ve Prof. Dr. M. Musa Timur açılışa katıldı. Sonraki")).toBe(true);
    expect(titled.length).toBeLessThanOrEqual(SUMMARY_MAX);
    expect(titled).toMatch(/açıklama\.$/);
    expect(summarize([])).toBe("Ayrıntılar ve ekler kaynağın sayfasında.");
    expect(summarize(["Başlık"], "Başlık")).toBe("Ayrıntılar ve ekler kaynağın sayfasında.");
  });

  it("makes valid, unique addresses", () => {
    const slug = slugFor("Nisan 2026’da 374,7 Milyon TL IPARD Hibesi Ödendi", "tkdk", "13088");
    expect(slug).toBe("nisan-2026da-374-7-milyon-tl-ipard-hibesi-odendi-tkdk-13088");
    const long = slugFor("Çok ".repeat(60), "bakanlik", "7380");
    expect(long.length).toBeLessThanOrEqual(SLUG_MAX);
    expect(long).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(long.endsWith("-tob-7380")).toBe(true);
  });

  it("knows each source's article number", () => {
    expect(sourceKey("https://www.tkdk.gov.tr/Haber/target-projesi-egitim-programi-13205")).toBe("13205");
    expect(sourceKey("https://www.tarimorman.gov.tr/Duyuru/2742/Gubre-Analizinde")).toBe("2742");
  });

  it("leaves out tenders, exams, hiring and ceremonies", () => {
    expect(isOffTopic("4-Bolge-Mudurlugu-Mugla-Oludeniz-Kidrak-Tabiat-Parki-Isletmecilik-Ihale-Ilani")).toBe(true);
    expect(isOffTopic("Tarım ve Orman Bakanlığı Sözleşmeli Bilişim Personeli Alımı Sınav Duyurusu")).toBe(true);
    expect(isOffTopic("2027-Yili-Universite-Ogrencileri-Staj-Basvurulari")).toBe(true);
    expect(isOffTopic("Atatürk'ün Vefatının 88. Yıl Dönümü")).toBe(true);
    expect(isOffTopic("Türkiye Cumhuriyeti 103 Yaşında")).toBe(true);
    expect(isOffTopic("Küçükbaş Hayvancılık Destekleri 3. Dönem Başvuruları")).toBe(false);
    expect(isOffTopic("Türk Gıda Kodeksi Peynir Tebliği Güncellendi")).toBe(false);
  });

  it("labels money farmers can get as Destek", () => {
    expect(classify("haber", "Nisan 2026’da 374,7 Milyon TL IPARD Hibesi Ödendi")).toBe("destek");
    expect(classify("duyuru", "Küçükbaş Hayvancılık Destekleri Başvuruları")).toBe("destek");
    expect(classify("duyuru", "Gübre Analizinde Yetkilendirilen Laboratuvarlar Güncellendi")).toBe("duyuru");
    expect(classify("haber", "Türk Gıda Kodeksi Peynir Tebliği Güncellendi")).toBe("haber");
  });
});
