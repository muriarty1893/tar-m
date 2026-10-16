export type AssistantAction = 'scan' | 'weather' | 'prices' | 'calendar';
export type Reply = { text: string; action?: AssistantAction };

type Rule = { words: string[]; reply: Reply };

// The prototype's scripted assistant: keyword rules over the farmer's question, first match wins.
const RULES: Rule[] = [
  {
    words: ['sarar', 'sarı yaprak', 'solgun'],
    reply: { text: 'Alt yapraklardan başlıyorsa azot eksikliği olabilir. Bir yaprağın fotoğrafını çekersen kesin söyleyebilirim.', action: 'scan' },
  },
  {
    words: ['leke', 'pas', 'küf', 'hastalık', 'mildiyö'],
    reply: { text: 'Lekeler hastalık belirtisi olabilir. En iyisi yaprağı tarayalım, 10 saniyede ne olduğunu söylerim.', action: 'scan' },
  },
  {
    words: ['ilaç', 'ilaçlama', 'rüzgâr', 'rüzgar', 'yağmur', 'hava'],
    reply: { text: 'İlaçlamayı rüzgâr 15 km/s altındayken ve yağmur yokken yap. Bugünün hava durumuna ve en uygun saate bakalım.', action: 'weather' },
  },
  {
    words: ['fiyat', 'lira', 'hal', 'satış', 'kaç para'],
    reply: { text: 'Bugünkü hal fiyatlarını senin ürünlerin için açıyorum.', action: 'prices' },
  },
  {
    words: ['gübre', 'sulama', 'ekim', 'hasat', 'ne zaman'],
    reply: { text: 'Tarlalarının takvimine bakalım; yaklaşan işleri gün gün gösteriyorum.', action: 'calendar' },
  },
];

const FALLBACK: Reply = {
  text: 'Bunu tam anlayamadım. Bitkinde bir sorun varsa yaprağın fotoğrafını çek, birlikte bakalım.',
  action: 'scan',
};

export function reply(question: string): Reply {
  const q = question.toLocaleLowerCase('tr');
  return RULES.find((r) => r.words.some((w) => q.includes(w)))?.reply ?? FALLBACK;
}

/** Ready-made questions to tap, for people who would rather not speak. */
export const SUGGESTED_QUESTIONS = [
  'Domateslerin yaprakları sararıyor, ne yapayım?',
  'Bugün ilaçlama yapabilir miyim?',
  'Buğday fiyatı bugün ne kadar?',
];
