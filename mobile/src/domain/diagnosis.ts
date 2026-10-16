import type { CropId } from './crops';

export type Severity = 'yok' | 'hafif' | 'orta' | 'ciddi';

export type Step = { text: string; note?: string; kind: 'genel' | 'kimyasal' | 'organik' };

export type Diagnosis = {
  id: string;
  name: string;
  latin?: string;
  kind: string;
  severity: Severity;
  spread?: { label: string; detail: string };
  steps: Step[];
  /** Where the marked spots sit on the sample photo, as fractions of width and height. */
  spots?: { x: number; y: number; size: number }[];
};

export const DIAGNOSES: Record<string, Diagnosis> = {
  'sari-pas': {
    id: 'sari-pas',
    name: 'Sarı pas',
    latin: 'Puccinia striiformis',
    kind: 'Mantar hastalığı',
    severity: 'orta',
    spread: { label: 'Hızlı', detail: '3–5 gün içinde' },
    steps: [
      { kind: 'genel', text: 'Etkilenen tarlayı bu hafta gözden geçir, belirtili bitkileri işaretle.' },
      { kind: 'kimyasal', text: 'Kimyasal seçenek: triazol grubu fungisit uygula.', note: 'Ürün etiketindeki dozu ve bekleme süresini mutlaka uy.' },
      { kind: 'organik', text: 'Organik seçenek: kükürt bazlı preparat ile yaprakları ıslat.', note: 'Daha yavaş etki eder, 7 gün sonra tekrarla.' },
    ],
    spots: [
      { x: 0.54, y: 0.22, size: 48 },
      { x: 0.45, y: 0.41, size: 40 },
      { x: 0.38, y: 0.7, size: 36 },
    ],
  },
  'domates-mildiyo': {
    id: 'domates-mildiyo',
    name: 'Mildiyö',
    latin: 'Phytophthora infestans',
    kind: 'Mantar benzeri hastalık',
    severity: 'ciddi',
    spread: { label: 'Çok hızlı', detail: 'Nemli havada 2–3 gün' },
    steps: [
      { kind: 'genel', text: 'Lekeli yaprakları topla ve tarladan uzakta imha et.' },
      { kind: 'kimyasal', text: 'Kimyasal seçenek: bakır veya mankozeb içerikli ilaç uygula.', note: 'Yağmurdan sonra uygulamayı yenile.' },
      { kind: 'organik', text: 'Organik seçenek: bordo bulamacı ile koruyucu ilaçlama yap.', note: 'Sulamayı sabah yap, yaprakları ıslatma.' },
    ],
    spots: [
      { x: 0.42, y: 0.42, size: 48 },
      { x: 0.25, y: 0.6, size: 44 },
    ],
  },
  'misir-kuraklik': {
    id: 'misir-kuraklik',
    name: 'Kuraklık stresi',
    kind: 'Çevresel stres',
    severity: 'hafif',
    spread: { label: 'Yayılmaz', detail: 'Hava ve suya bağlı' },
    steps: [
      { kind: 'genel', text: 'Toprak nemini 20 cm derinlikte kontrol et.' },
      { kind: 'kimyasal', text: 'Kimyasal seçenek: yaprak gübresiyle potasyum takviyesi yap.', note: 'Serin saatte uygula.' },
      { kind: 'organik', text: 'Organik seçenek: sıra aralarına malç ser, buharlaşmayı azalt.', note: 'Sulamayı akşam saatlerine kaydır.' },
    ],
    spots: [{ x: 0.5, y: 0.45, size: 52 }],
  },
  saglikli: {
    id: 'saglikli',
    name: 'Sağlıklı görünüyor',
    kind: 'Hastalık belirtisi yok',
    severity: 'yok',
    steps: [
      { kind: 'genel', text: 'Bitkin sağlıklı görünüyor. Düzenli bakıma devam et.' },
      { kind: 'genel', text: '10 gün sonra aynı tarladan yeniden tara.' },
    ],
  },
};

/** Which diseases each crop's scan can find (beyond "healthy"). */
const CROP_DISEASES: Record<CropId, string[]> = {
  bugday: ['sari-pas'],
  arpa: ['sari-pas'],
  domates: ['domates-mildiyo'],
  misir: ['misir-kuraklik'],
  aycicegi: ['misir-kuraklik'],
  zeytin: ['misir-kuraklik'],
};

export type SamplePhoto = {
  id: string;
  label: string;
  crop: CropId;
  /** A bundled image (require). */
  image: number;
  diagnosisId: string;
  confidence: number;
};

/** Photos to scan without a camera (simulators, the web, a first try). */
export const SAMPLE_PHOTOS: SamplePhoto[] = [
  { id: 'bugday-sari-pas', label: 'Buğday yaprağı', crop: 'bugday', image: require('@/assets/images/app/leaf-rust.jpg'), diagnosisId: 'sari-pas', confidence: 0.87 },
  { id: 'domates-mildiyo', label: 'Domates meyvesi', crop: 'domates', image: require('@/assets/images/app/domates-mildiyo.webp'), diagnosisId: 'domates-mildiyo', confidence: 0.91 },
  { id: 'misir-kuraklik', label: 'Mısır yaprağı', crop: 'misir', image: require('@/assets/images/app/misir-kuraklik.webp'), diagnosisId: 'misir-kuraklik', confidence: 0.78 },
  { id: 'saglikli-fide', label: 'Sağlıklı fide', crop: 'domates', image: require('@/assets/images/app/seedlings.webp'), diagnosisId: 'saglikli', confidence: 0.93 },
];

export const sampleById = (id: string) => SAMPLE_PHOTOS.find((s) => s.id === id);

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * The prototype's stand-in for the AI model: a sample photo gives its known result; a camera
 * photo gives a stable, plausible result for the chosen crop (the same photo, the same answer).
 */
export function diagnose(input: { crop: CropId; sampleId?: string; photoKey?: string }): { diagnosisId: string; confidence: number } {
  const sample = input.sampleId ? sampleById(input.sampleId) : undefined;
  if (sample) return { diagnosisId: sample.diagnosisId, confidence: sample.confidence };
  const h = hash(`${input.crop}:${input.photoKey ?? ''}`);
  const options = [...CROP_DISEASES[input.crop], 'saglikli'];
  return { diagnosisId: options[h % options.length], confidence: Math.round((0.72 + ((h >>> 8) % 24) / 100) * 100) / 100 };
}
