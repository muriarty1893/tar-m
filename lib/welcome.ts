/** First-visit welcome question: where the visitor heard about us. */
export const WELCOME_SOURCES = [
  { id: "arkadas", label: "Arkadaş veya akraba" },
  { id: "sosyal-medya", label: "Sosyal medya" },
  { id: "arama", label: "İnternet araması" },
  { id: "kooperatif", label: "Kooperatif veya ziraat odası" },
  { id: "haber", label: "Haber, dergi veya TV" },
  { id: "diger", label: "Diğer" },
] as const;

export type WelcomeSource = (typeof WELCOME_SOURCES)[number]["id"];

/** localStorage key: set once the question is answered, so the welcome never shows again. */
export const WELCOME_KEY = "bereket-hosgeldin";
