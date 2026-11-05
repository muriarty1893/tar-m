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
];
