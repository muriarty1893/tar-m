import type { ComponentType } from "react";
import { D01Sade } from "./D01Sade";
import { D02Bento } from "./D02Bento";
import { D03Brutal } from "./D03Brutal";
import { D04Cam } from "./D04Cam";
import { D05Kil } from "./D05Kil";
import { D06Gazete } from "./D06Gazete";
import { D07Material } from "./D07Material";
import { D08Ios } from "./D08Ios";
import { D09Gece } from "./D09Gece";
import { D10Koy } from "./D10Koy";
import { D11R10 } from "./D11R10";
import { D12Doga } from "./D12Doga";
import { D13Toprak } from "./D13Toprak";
import { D14Yumusak } from "./D14Yumusak";
import { D15Bauhaus } from "./D15Bauhaus";
import { D16Kolay } from "./D16Kolay";
import { D17Borsa } from "./D17Borsa";
import { D18Akis } from "./D18Akis";
import { D19Defter } from "./D19Defter";
import { D20Manzara } from "./D20Manzara";
import { D21Kilim } from "./D21Kilim";

/** The home page designs to choose from (/tasarimlar). Temporary: the chosen one replaces MobileHome. */
export const DESIGNS: { name: string; style: string; about: string; Page: ComponentType }[] = [
  { name: "Sade", style: "İsviçre minimal", about: "Beyaz zemin, siyah yazı, tek yeşil. Kutu yok, ince çizgiler; büyük rakamlar ve numaralı konu listesi.", Page: D01Sade },
  { name: "Bento", style: "Apple kutuları", about: "Gri zemin üstünde farklı boyutlarda beyaz kutular; hava durumu uzun kutu, yüzen hap şeklinde alt menü.", Page: D02Bento },
  { name: "Cesur", style: "Neubrutalizm", about: "Kalın siyah çerçeveler, sert gölgeler, düz ve canlı renkler, büyük harfler. Göze çarpan, genç.", Page: D03Brutal },
  { name: "Cam", style: "Cam efekti", about: "Yeşil-mavi ışıklı arka plan, üstünde buzlu cam paneller; yüzen üst ve alt bar.", Page: D04Cam },
  { name: "Kil", style: "Kil (oyuncak)", about: "Pastel renkler, kabarık yumuşak kartlar; her konu ayrı bir kart, beğeni ve yanıt rozetleri.", Page: D05Kil },
  { name: "Gazete", style: "Gazete / dergi", about: "Gazete kâğıdı, tırnaklı manşet yazısı, çizgiler; forum “Gündem” olarak, ilk konu fotoğraflı manşet.", Page: D06Gazete },
  { name: "Material", style: "Android (Material 3)", about: "Üst barda arama kutusu, tonlu kartlar, filtre çipleri, sağ altta “Konu aç” butonu, Android alt menüsü.", Page: D07Material },
  { name: "iOS", style: "iPhone (Apple)", about: "Büyük başlık, iPhone widget’ları, gruplu liste, bölmeli seçici ve yarı saydam alt menü.", Page: D08Ios },
  { name: "Gece", style: "Koyu tema", about: "Siyah zemin, grafit paneller, tek parlak limon yeşili vurgu. Gece kullanımına rahat.", Page: D09Gece },
  { name: "Köy Pazarı", style: "Retro / nostaljik", about: "Kraft kâğıdı, sponsor tahta tabelada, reklam bilet gibi, damgalar; forum “Köy Kahvesi”.", Page: D10Koy },
  { name: "r10", style: "r10.net düzeni", about: "r10.net’in düzeni ve renkleri: üstte renkli reklam şeritleri, “Son Açılan” tek satır konu listesi, klasörlü kategori satırları.", Page: D11R10 },
  { name: "Doğa", style: "Organik", about: "Krem zemin, orman yeşili; yaprak biçimli kartlar, çakıl taşı fotoğraflar, yumuşak lekeler ve dalgalı alt menü.", Page: D12Doga },
  { name: "Toprak", style: "Toprak tonları", about: "Kiremit, kum ve zeytin yeşili, hafif kâğıt dokusu; kemer biçimli fotoğraf penceresi ve karakterli tırnaklı başlıklar.", Page: D13Toprak },
  { name: "Yumuşak", style: "Yumuşak arayüz (neumorfizm)", about: "Her şey tek bir yumuşak gri yüzeyde, kabarık ya da içe basık; hava durumu kadran gibi. Sakin, dokunsal.", Page: D14Yumusak },
  { name: "Bauhaus", style: "Bauhaus", about: "Kırmızı, mavi, sarı renk blokları; daire ve üçgenler, siyah çizgiler, kalın büyük harfler. Afiş gibi.", Page: D15Bauhaus },
  { name: "Kolay", style: "Büyük yazı / erişilebilir", about: "Büyük yazı, yüksek kontrast, yazılı büyük butonlar, yazı boyutu ayarı. Yaşlı gözler ve tarlada güneş altında okumak için.", Page: D16Kolay },
  { name: "Borsa", style: "Veri paneli", about: "Üstte kayan fiyat şeridi, küçük rakam kutuları, 7 günlük çizgili fiyat tablosu, 5 günlük hava; forum sık bir tablo.", Page: D17Borsa },
  { name: "Akış", style: "Sosyal medya akışı", about: "Instagram gibi: bölümler hikâye halkası, “Ne sormak istersin?” kutusu, fotoğraflı gönderiler, beğen/yanıt satırı.", Page: D18Akis },
  { name: "Defter", style: "El çizimi", about: "Çizgili defter sayfası, el yazısı, titrek kalem çizgili kutular, bantlı sarı not kâğıdında sponsor, kırmızı kalem notları.", Page: D19Defter },
  { name: "Manzara", style: "Fotoğraf ve katmanlar", about: "Üstü tam ekran tarla fotoğrafı ve üstünde hava; sayfa onun üstüne kayan bir tabaka, gölgeli katmanlı kartlar, yüzen “Konu aç”.", Page: D20Manzara },
  { name: "Kilim", style: "Anadolu kilimi", about: "Kök boya kırmızı, çivit mavisi, safran sarısı; dokuma kilim şeritleri, göz motifleri, kilim çerçeveli sponsor.", Page: D21Kilim },
];
