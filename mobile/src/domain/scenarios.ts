/**
 * The website demo's scan scenarios (data/demo-scenarios.ts), with their scripted chat.
 *
 * NOTE: The agronomic text is illustrative and must be reviewed by an agronomist
 * (ziraat mühendisi) before launch.
 */
export type Scenario = {
  id: string;
  title: string;
  /** A bundled image (require). */
  image: number;
  imageAlt: string;
  seen: string;
  diagnosis: string;
  suggestions: string[];
  /** Estimated harvest success, 0-100. */
  successRate: number;
  questions: { q: string; a: string }[];
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'bugday-pas',
    title: 'Buğday tarlası',
    image: require('@/assets/images/app/bugday-sari-pas.webp'),
    imageAlt: 'Tarlada yakın çekim: damarları boyunca sarı-turuncu pas püstülleri dizilmiş tahıl yaprağı',
    seen: 'Başaklanma dönemindeki buğday yapraklarında, damarlar boyunca uzanan sarı-turuncu çizgiler görülüyor.',
    diagnosis: 'Sarı pas (Puccinia striiformis) belirtileri — erken evre',
    suggestions: [
      'Belirtilerin yayılıp yayılmadığını 2-3 gün içinde tarlanın farklı noktalarından kontrol edin.',
      'İlaçlama kararı için il/ilçe tarım müdürlüğü veya bir ziraat mühendisiyle görüşün.',
      'Gelecek sezon için pasa dayanıklı tohum çeşitlerini değerlendirin.',
    ],
    successRate: 72,
    questions: [
      { q: 'İlaçlama yapmam gerekiyor mu?', a: 'Erken evrede belirtiler sınırlıysa önce yayılmayı izlemek yeterli olabilir. Lekeler bayrak yaprağına çıkıyorsa ilaçlama kararını bir ziraat mühendisiyle birlikte verin.' },
      { q: 'Hastalık komşu tarlalara bulaşır mı?', a: 'Evet, sarı pas sporları rüzgârla uzaklara taşınır. Komşu çiftçileri haberdar etmek ve bölgenizdeki tahmin-uyarı duyurularını takip etmek yayılmayı yavaşlatır.' },
      { q: 'Verim ne kadar düşer?', a: 'Erken yakalanıp kontrol altına alınırsa kayıp sınırlı kalır. Hastalık başakta da ilerlerse kayıp ciddi boyutlara ulaşabilir; tahmini %72 başarı bu nedenle takibe bağlıdır.' },
    ],
  },
  {
    id: 'kuru-misir',
    title: 'Mısır tarlası',
    image: require('@/assets/images/app/misir-kuraklik.webp'),
    imageAlt: 'Kuraklıktan yaprakları kurumuş mısır tarlası',
    seen: 'Toprak yüzeyinde çatlaklar var; mısır yaprakları kıvrılmış ve uçlarından kurumaya başlamış.',
    diagnosis: 'Su stresi (kuraklık) — orta düzey',
    suggestions: [
      'Sulamayı serin saatlere (sabah erken veya akşam) kaydırarak buharlaşma kaybını azaltın.',
      'Damla sulamaya geçiş, aynı su ile daha geniş alanı sulamanızı sağlar.',
    ],
    successRate: 54,
    questions: [
      { q: 'Ne kadar sık sulamalıyım?', a: 'Toprağın 20-30 cm derinliği kurumaya başladığında sulayın. Püskül ve koçan döneminde susuzluk verimi en çok düşüren dönemdir, bu dönemi kaçırmayın.' },
      { q: 'Yaprakların kıvrılması geçer mi?', a: 'Su stresi giderilirse yapraklar genellikle serin saatlerde açılır. Uçlardan kuruyan kısımlar ise geri dönmez; yeni yaprakların sağlıklı olup olmadığına bakın.' },
    ],
  },
  {
    id: 'aycicegi',
    title: 'Ayçiçeği tarlası',
    image: require('@/assets/images/app/aycicegi-tarlasi.webp'),
    imageAlt: 'Tablaları açmış, yaprakları yeşil ayçiçeği tarlası',
    seen: 'Bitkiler eşit boyda, yapraklar koyu yeşil ve tablalar düzgün açılmış.',
    diagnosis: 'Sağlıklı gelişim — belirgin bir sorun görülmedi',
    suggestions: [
      'Tabla döneminde kuş zararına karşı tarlayı düzenli gözlemleyin.',
      'Hasat zamanını tablaların arkası sarı-kahverengiye döndüğünde planlayın.',
    ],
    successRate: 91,
    questions: [
      { q: 'Kuş zararını nasıl azaltırım?', a: 'Tabla döneminde tarlayı sık gezmek, ses ya da görsel kovucuları dönüşümlü kullanmak ve hasadı geciktirmemek kuş zararını belirgin biçimde azaltır.' },
      { q: 'Hasat zamanını nasıl anlarım?', a: 'Tablaların arkası sarı-kahverengiye döndüğünde ve dış yapraklar kuruduğunda hasat yaklaşmıştır. Tohum nemi yaklaşık %9-10\'a indiğinde hasat edin.' },
    ],
  },
  {
    id: 'domates-mildiyo',
    title: 'Domates bahçesi',
    image: require('@/assets/images/app/domates-mildiyo.webp'),
    imageAlt: 'Dalda yeşil domatesler: birinde kahverengi lekeler, biri tamamen kararıp buruşmuş',
    seen: 'Yeşil domates meyvelerinde kahverengi, yağlı görünümlü lekeler var; bir meyve tamamen kararmış ve buruşmuş.',
    diagnosis: 'Domates mildiyösü (Phytophthora infestans) — meyvede ilerlemiş belirti',
    suggestions: [
      'Lekeli meyve ve yaprakları toplayıp bahçeden uzaklaştırın; kompost yığınına atmayın.',
      'Yaprakları ıslatmayan damla sulamaya geçin ve sıra aralarında hava akışını artırın.',
      'Serin ve nemli günlerde koruyucu uygulama için bir ziraat mühendisinden reçete alın.',
    ],
    successRate: 48,
    questions: [
      { q: 'Sağlam meyveleri yiyebilir miyim?', a: 'Lekesiz, sert ve sağlıklı görünen meyveler tüketilebilir. Lekeli ya da yumuşamış meyveleri ayırın; hastalık depoda da ilerleyebilir.' },
      { q: 'Hastalık diğer bitkilere geçer mi?', a: 'Evet. Mildiyö serin ve nemli havada hızla yayılır, patates gibi akraba bitkilere de geçebilir. Hastalıklı bitki artıklarını bahçeden uzaklaştırın.' },
      { q: 'Gelecek yıl tekrar olmaması için ne yapmalıyım?', a: 'Ekim nöbeti uygulayın, dayanıklı çeşit seçin, sıra aralarını geniş tutun ve yaprakları ıslatmayan damla sulama kullanın.' },
    ],
  },
];

export const scenarioById = (id: string) => SCENARIOS.find((s) => s.id === id);

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** The prototype's stand-in for the AI: a photo always maps to the same scenario. */
export const pickScenario = (photoKey: string) => SCENARIOS[hash(photoKey) % SCENARIOS.length];

export const GENERIC_ANSWER =
  'Bu bir demo: gerçek uygulamada yapay zekâ sorunuzu fotoğrafınıza, ürününüze ve bölgenizin hava durumuna göre yanıtlayacak. Şimdilik önerilen sorulardan birini deneyebilirsiniz.';

export const answerFor = (s: Scenario, question: string) => s.questions.find((x) => x.q === question.trim())?.a ?? GENERIC_ANSWER;

/** The harvest gauge's colour: red under 50, gold under 75, green above (as on the website). */
export const successTone = (v: number) => (v < 50 ? 'destructive' : v < 75 ? 'gold' : 'primary');
