// Kept apart from lib/forms so the partner form can render its options without loading zod.
export const PARTNER_TYPES = {
  yatirimci: "Yatırımcı",
  kooperatif: "Kooperatif",
  oda: "Ziraat odası / kamu kurumu",
  ciftlik: "Çiftlik / üretici",
  diger: "Diğer",
} as const;

export type PartnerType = keyof typeof PARTNER_TYPES;
