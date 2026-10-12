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
    imageSrc: "/demo/bugday-pas.svg",
    imageAlt: "Yapraklarında turuncu lekeler olan buğday tarlası",
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
    imageSrc: "/demo/kuru-misir.svg",
    imageAlt: "Toprağı çatlamış, yaprakları kurumuş mısır tarlası",
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
    imageSrc: "/demo/aycicegi.svg",
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
    id: "zeytin",
    title: "Zeytinlik",
    imageSrc: "/demo/zeytin.svg",
    imageAlt: "Yapraklarında ve dallarında koyu lekeler olan zeytin ağaçları",
    seen: "Yaprak ve sürgünlerde koyu renkli lekeler ve yer yer yapışkan bir tabaka görülüyor.",
    diagnosis: "Zeytin kara koşnili belirtisi ve buna bağlı fumajin (kurumcuk) olasılığı",
    suggestions: [
      "Sık dalları budayarak ağacın içine hava ve ışık girmesini sağlayın.",
      "Mücadele zamanlaması için bölgenizdeki tahmin-uyarı duyurularını takip edin.",
      "Uygulama öncesi bir ziraat mühendisinden reçete alın.",
    ],
    successRate: 63,
  },
];
