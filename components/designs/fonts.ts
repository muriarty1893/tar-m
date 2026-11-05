import {
  Alegreya,
  Alegreya_Sans,
  Bebas_Neue,
  Cabin,
  DM_Sans,
  Fira_Code,
  Fira_Sans,
  Fraunces,
  Inter,
  Kalam,
  Lexend,
  Libre_Bodoni,
  Lora,
  Manrope,
  Nunito,
  Nunito_Sans,
  Open_Sans,
  Outfit,
  Patrick_Hand,
  Public_Sans,
  Raleway,
  Roboto,
  Roboto_Slab,
  Source_Sans_3,
  Space_Grotesk,
  Varela_Round,
  Work_Sans,
} from "next/font/google";

/**
 * The design previews' typefaces (/tasarimlar). Loaded only on those pages; latin-ext has ç ğ ı İ ö ş ü.
 * next/font needs literal options here (no spread).
 */
export const inter = Inter({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-inter" });
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-space-grotesk" });
export const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-dm-sans" });
export const nunito = Nunito({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-nunito" });
export const libreBodoni = Libre_Bodoni({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-libre-bodoni" });
export const publicSans = Public_Sans({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-public-sans" });
export const roboto = Roboto({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-roboto" });
export const manrope = Manrope({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-manrope" });
export const robotoSlab = Roboto_Slab({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-roboto-slab" });
export const openSans = Open_Sans({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-open-sans" });
// Designs 12-21 (font pairings from the ui-ux-pro-max typography data).
export const lora = Lora({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-lora" });
export const raleway = Raleway({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-raleway" });
export const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-fraunces" });
export const cabin = Cabin({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-cabin" });
export const varelaRound = Varela_Round({ subsets: ["latin", "latin-ext"], weight: "400", preload: false, variable: "--font-varela-round" });
export const nunitoSans = Nunito_Sans({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-nunito-sans" });
export const outfit = Outfit({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-outfit" });
export const lexend = Lexend({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-lexend" });
export const sourceSans = Source_Sans_3({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-source-sans" });
export const firaCode = Fira_Code({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-fira-code" });
export const firaSans = Fira_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], preload: false, variable: "--font-fira-sans" });
export const workSans = Work_Sans({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-work-sans" });
export const kalam = Kalam({ subsets: ["latin", "latin-ext"], weight: ["400", "700"], preload: false, variable: "--font-kalam" });
export const patrickHand = Patrick_Hand({ subsets: ["latin", "latin-ext"], weight: "400", preload: false, variable: "--font-patrick-hand" });
export const bebasNeue = Bebas_Neue({ subsets: ["latin", "latin-ext"], weight: "400", preload: false, variable: "--font-bebas-neue" });
export const alegreya = Alegreya({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-alegreya" });
export const alegreyaSans = Alegreya_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "700", "800"], preload: false, variable: "--font-alegreya-sans" });
