import { z } from "zod";
import { PARTNER_TYPES, type PartnerType } from "./partner-types";

const requiredText = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} gerekli.` })
    .trim()
    .min(min, { error: min <= 1 ? `${label} gerekli.` : `${label} en az ${min} karakter olmalı.` })
    .max(max, { error: `${label} en fazla ${max} karakter olabilir.` });

const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, { error: `${label} en fazla ${max} karakter olabilir.` }).optional();

const email = z
  .string({ error: "E-posta gerekli." })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Geçerli bir e-posta adresi girin." }));

// The honeypot is accepted here and checked separately; any value means a bot.
const honeypot = z.string().optional();

export const waitlistSchema = z.object({
  name: requiredText("Ad soyad", 2, 100),
  email,
  city: optionalText("İl", 100),
  crop: optionalText("Ürün", 100),
  consent: z.literal(true, { error: "Devam etmek için KVKK onayı gerekli." }),
  website: honeypot,
});


export const partnerSchema = z.object({
  name: requiredText("Ad soyad", 2, 100),
  organization: requiredText("Kurum adı", 2, 150),
  email,
  phone: z
    .string()
    .trim()
    .max(30, { error: "Telefon en fazla 30 karakter olabilir." })
    .regex(/^[0-9+()\s-]*$/, { error: "Telefon yalnızca rakam, boşluk ve + ( ) - içerebilir." })
    .optional(),
  type: z.enum(Object.keys(PARTNER_TYPES) as [PartnerType, ...PartnerType[]], {
    error: "Lütfen bir kurum türü seçin.",
  }),
  message: requiredText("Mesaj", 10, 2000),
  website: honeypot,
});

export const questionSchema = z.object({
  name: optionalText("Ad", 100),
  email,
  question: z
    .string({ error: "Sorunuz gerekli." })
    .trim()
    .min(10, { error: "Sorunuz en az 10 karakter olmalı." })
    .max(1000, { error: "Sorunuz en fazla 1000 karakter olabilir." }),
  consent: z.literal(true, { error: "Devam etmek için KVKK onayı gerekli." }),
  website: honeypot,
});

export type WaitlistInput = z.input<typeof waitlistSchema>;
export type PartnerInput = z.input<typeof partnerSchema>;
export type QuestionInput = z.input<typeof questionSchema>;

/** Google Sheets runs cells starting with = + - @ as formulas; a leading ' stores them as text. */
export function neutraliseFormula(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

/** First message per field, for showing next to inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
