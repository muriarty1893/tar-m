/**
 * Scripted demo answers. This shape is also the contract a future live AI
 * endpoint must return, so DemoShowcase never has to change.
 *
 * NOTE: The agronomic text below is illustrative and MUST be reviewed by an
 * agronomist (ziraat mühendisi) before launch.
 */
export type DemoScenario = {
  id: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  seen: string;
  diagnosis: string;
  suggestions: string[];
  /** Estimated harvest success, 0-100. */
  successRate: number;
};

export const demoScenarios: DemoScenario[] = [
  {
    id: "bugday-pas",
    title: "Buğday tarlası",
    imageSrc: "/demo/bugday-sari-pas.webp",
    imageAlt: "Tarlada yakın çekim: damarları boyunca sarı-turuncu pas püstülleri dizilmiş tahıl yaprağı",
    seen: "Başaklanma dönemindeki buğday yapraklarında, damarlar boyunca uzanan sarı-turuncu çizgiler görülüyor.",
    diagnosis: "Sarı pas (Puccinia striiformis) belirtileri — erken evre",
    suggestions: [
      "Belirtilerin yayılıp yayılmadığını 2-3 gün içinde tarlanın farklı noktalarından kontrol edin.",
      "İlaçlama kararı için il/ilçe tarım müdürlüğü veya bir ziraat mühendisiyle görüşün.",
      "Gelecek sezon için pasa dayanıklı tohum çeşitlerini değerlendirin.",
    ],
    successRate: 72,
  },
  {
    id: "kuru-misir",
    title: "Mısır tarlası",
    imageSrc: "/demo/misir-kuraklik.webp",
    imageAlt: "Kuraklıktan yaprakları kurumuş mısır tarlası",
    seen: "Toprak yüzeyinde çatlaklar var; mısır yaprakları kıvrılmış ve uçlarından kurumaya başlamış.",
    diagnosis: "Su stresi (kuraklık) — orta düzey",
    suggestions: [
      "Sulamayı serin saatlere (sabah erken veya akşam) kaydırarak buharlaşma kaybını azaltın.",
      "Damla sulamaya geçiş, aynı su ile daha geniş alanı sulamanızı sağlar.",
    ],
    successRate: 54,
  },
  {
    id: "aycicegi",
    title: "Ayçiçeği tarlası",
    imageSrc: "/demo/aycicegi-tarlasi.webp",
    imageAlt: "Tablaları açmış, yaprakları yeşil ayçiçeği tarlası",
    seen: "Bitkiler eşit boyda, yapraklar koyu yeşil ve tablalar düzgün açılmış.",
    diagnosis: "Sağlıklı gelişim — belirgin bir sorun görülmedi",
    suggestions: [
      "Tabla döneminde kuş zararına karşı tarlayı düzenli gözlemleyin.",
      "Hasat zamanını tablaların arkası sarı-kahverengiye döndüğünde planlayın.",
    ],
    successRate: 91,
  },
  {
    id: "domates-mildiyo",
    title: "Domates bahçesi",
    imageSrc: "/demo/domates-mildiyo.webp",
    imageAlt: "Dalda yeşil domatesler: birinde kahverengi lekeler, biri tamamen kararıp buruşmuş",
    seen: "Yeşil domates meyvelerinde kahverengi, yağlı görünümlü lekeler var; bir meyve tamamen kararmış ve buruşmuş.",
    diagnosis: "Domates mildiyösü (Phytophthora infestans) — meyvede ilerlemiş belirti",
    suggestions: [
      "Lekeli meyve ve yaprakları toplayıp bahçeden uzaklaştırın; kompost yığınına atmayın.",
      "Yaprakları ıslatmayan damla sulamaya geçin ve sıra aralarında hava akışını artırın.",
      "Serin ve nemli günlerde koruyucu uygulama için bir ziraat mühendisinden reçete alın.",
    ],
    successRate: 48,
  },
];
